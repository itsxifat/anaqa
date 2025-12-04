'use server'

import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Hero from '@/models/Hero';
import Category from '@/models/Category';
import SiteContent from '@/models/SiteContent';
import { revalidatePath } from 'next/cache';

// --- AUTHENTICATION ---
export async function loginAction(formData) {
  const password = formData.get('password');
  // Check against Environment Variable
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies(); 
    cookieStore.set('admin_session', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 // 1 day
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid Password' };
}

// --- HERO CAROUSEL ACTIONS ---
export async function addSlide(formData) {
  await connectDB();

  // 1. Validate Desktop Image
  const imageFile = formData.get('image'); // Desktop
  if (!imageFile || imageFile.size === 0) {
    return { error: 'Desktop Image is required' };
  }

  // 2. Process Desktop Image to Buffer
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 3. Process Mobile Image (Optional)
  const mobileImageFile = formData.get('mobileImage');
  let mobileBuffer = null;
  let mobileType = null;
  
  if (mobileImageFile && mobileImageFile.size > 0) {
    const mobileBytes = await mobileImageFile.arrayBuffer();
    mobileBuffer = Buffer.from(mobileBytes);
    mobileType = mobileImageFile.type;
  }

  try {
    // 4. Parse JSON Data & Fields
    const buttonLayer = JSON.parse(formData.get('buttonLayer') || '{}');
    const showButton = formData.get('showButton') === 'true';
    const overlayOpacity = formData.get('overlayOpacity');

    // 5. Create Database Entry
    await Hero.create({
      buttonLayer: buttonLayer,
      showButton: showButton,
      overlayOpacity: overlayOpacity,
      image: {
        data: buffer,
        contentType: imageFile.type,
      },
      // Conditionally add mobile image if it exists
      ...(mobileBuffer && {
        mobileImage: {
          data: mobileBuffer,
          contentType: mobileType
        }
      })
    });

    // 6. Refresh Pages
    revalidatePath('/');
    revalidatePath('/admin/carousel');
    return { success: true };
  } catch (error) {
    console.error('Error adding slide:', error);
    return { error: 'Failed to save slide' };
  }
}

export async function deleteSlide(id) {
  await connectDB();
  await Hero.findByIdAndDelete(id);
  revalidatePath('/');
  revalidatePath('/admin/carousel');
}

// --- CATEGORY ACTIONS ---
export async function createCategory(formData) {
  await connectDB();
  const name = formData.get('name');
  const parentId = formData.get('parentId') || null;
  
  // Create a simple slug (e.g., "Summer Collection" -> "summer-collection")
  const slug = name.toLowerCase().replace(/ /g, '-');

  try {
    await Category.create({ name, slug, parent: parentId });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/navbar');
    return { success: true };
  } catch (error) {
    console.error('Error creating category:', error);
    return { error: 'Failed to create category' };
  }
}

export async function deleteCategory(id) {
  await connectDB();
  await Category.findByIdAndDelete(id);
  // Note: In a real app, you might want to handle children of deleted categories here
  revalidatePath('/admin/categories');
}

export async function getCategories() {
  await connectDB();
  const categories = await Category.find().lean();
  
  // Helper to build a nested tree structure
  const buildTree = (cats, parentId = null) => {
    return cats
      .filter(c => String(c.parent) === String(parentId))
      .map(c => ({
        ...c,
        _id: c._id.toString(),
        children: buildTree(cats, c._id)
      }));
  };
  
  return buildTree(categories, null);
}

// --- NAVBAR CONFIG ACTIONS ---
export async function saveNavbarConfig(links) {
  await connectDB();
  try {
    // Updates or Creates the main layout configuration
    await SiteContent.findOneAndUpdate(
      { identifier: 'main_layout' },
      { navbarLinks: links },
      { upsert: true, new: true }
    );
    revalidatePath('/'); // Update the live site navbar immediately
    return { success: true };
  } catch (error) {
    console.error('Error saving navbar:', error);
    return { error: 'Failed to save navbar configuration' };
  }
}
'use server'

import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Hero from '@/models/Hero';
import Category from '@/models/Category';
import SiteContent from '@/models/SiteContent';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';

// --- 1. AUTHENTICATION ---
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

// --- 2. HERO CAROUSEL ACTIONS ---
export async function addSlide(formData) {
  await connectDB();

  const imageFile = formData.get('image'); // Desktop
  const mobileImageFile = formData.get('mobileImage'); // Mobile (Optional)

  if (!imageFile || imageFile.size === 0) return { error: 'Desktop Image is required' };

  // Process Desktop Image
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Process Mobile Image
  let mobileBuffer = null;
  let mobileType = null;
  if (mobileImageFile && mobileImageFile.size > 0) {
    const mBytes = await mobileImageFile.arrayBuffer();
    mobileBuffer = Buffer.from(mBytes);
    mobileType = mobileImageFile.type;
  }

  try {
    const buttonLayer = JSON.parse(formData.get('buttonLayer') || '{}');
    const showButton = formData.get('showButton') === 'true';
    const overlayOpacity = formData.get('overlayOpacity');

    await Hero.create({
      buttonLayer,
      showButton,
      overlayOpacity,
      image: { data: buffer, contentType: imageFile.type },
      // Only add mobile image if it exists
      ...(mobileBuffer && {
        mobileImage: { data: mobileBuffer, contentType: mobileType }
      })
    });

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
  return { success: true };
}

// --- 3. CATEGORY ACTIONS ---
export async function createCategory(formData) {
  await connectDB();
  const name = formData.get('name');
  const parentId = formData.get('parentId') || null;
  const slug = name.toLowerCase().replace(/ /g, '-');

  try {
    await Category.create({ name, slug, parent: parentId });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/navbar');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create category' };
  }
}

export async function deleteCategory(id) {
  await connectDB();
  await Category.findByIdAndDelete(id);
  revalidatePath('/admin/categories');
  return { success: true };
}

export async function getCategories() {
  await connectDB();
  const categories = await Category.find().lean();
  
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

// --- 4. NAVBAR ACTIONS ---
export async function saveNavbarConfig(links) {
  await connectDB();
  try {
    await SiteContent.findOneAndUpdate(
      { identifier: 'main_layout' },
      { navbarLinks: links },
      { upsert: true, new: true }
    );
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    return { error: 'Failed to save navbar' };
  }
}

// --- 5. USER MANAGEMENT ACTIONS ---

export async function getUsers(query = '') {
  await connectDB();
  try {
    // Search by Name or Email
    const searchFilter = query
      ? { 
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ] 
        }
      : {};

    const users = await User.find(searchFilter).sort({ createdAt: -1 }).lean();
    
    // Serialize IDs and Safely handle Dates
    return users.map(user => ({
      ...user,
      _id: user._id.toString(),
      // FIX: Check if createdAt exists before calling toISOString()
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return [];
  }
}

export async function toggleUserBan(id, currentStatus) {
  await connectDB();
  try {
    await User.findByIdAndUpdate(id, { isBanned: !currentStatus });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update ban status' };
  }
}

export async function toggleUserRole(id, currentRole) {
  await connectDB();
  try {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await User.findByIdAndUpdate(id, { role: newRole });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update role' };
  }
}

export async function deleteUser(id) {
  await connectDB();
  try {
    await User.findByIdAndDelete(id);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete user' };
  }
}
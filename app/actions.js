'use server'

import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Hero from '@/models/Hero';
import Category from '@/models/Category';
import SiteContent from '@/models/SiteContent';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';

// --- 1. ADMIN AUTHENTICATION ---
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
  
  if (!imageFile || imageFile.size === 0) {
    return { error: 'Desktop Image is required' };
  }

  // Process Desktop Image
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Process Mobile Image (Optional)
  const mobileImageFile = formData.get('mobileImage');
  let mobileBuffer = null;
  let mobileType = null;
  
  if (mobileImageFile && mobileImageFile.size > 0) {
    const mBytes = await mobileImageFile.arrayBuffer();
    mobileBuffer = Buffer.from(mBytes);
    mobileType = mobileImageFile.type;
  }

  try {
    const link = formData.get('link') || '/';

    await Hero.create({
      link,
      image: { data: buffer, contentType: imageFile.type },
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

// --- 4. NAVBAR CONFIG ACTIONS ---
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

// --- 5. USER MANAGEMENT ACTIONS (ADMIN) ---
export async function getUsers(query = '') {
  await connectDB();
  try {
    const searchFilter = query
      ? { 
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ] 
        }
      : {};

    const users = await User.find(searchFilter).sort({ createdAt: -1 }).lean();
    
    return users.map(user => ({
      ...user,
      _id: user._id.toString(),
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

// --- 6. USER PROFILE UPDATE (CLIENT) ---
export async function updateUserProfile(formData) {
  await connectDB();
  
  const email = formData.get('email');
  const name = formData.get('name');
  const phone = formData.get('phone');
  const imageFile = formData.get('image');

  try {
    const user = await User.findOne({ email });
    if (!user) return { error: "User not found" };

    // Update Text Fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Update Image if provided
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save binary data to DB
      user.customImage = {
        data: buffer,
        contentType: imageFile.type
      };
      // IMPORTANT: Remove the google URL string so the app logic switches to customImage
      user.image = null; 
    }

    await user.save();
    
    // Refresh all relevant paths so the UI updates immediately
    revalidatePath('/account'); 
    revalidatePath('/', 'layout'); 
    
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { error: "Failed to update profile" };
  }
}
'use server'

import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Hero from '@/models/Hero';
import Category from '@/models/Category';
import SiteContent from '@/models/SiteContent';
import User from '@/models/User';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';
import { signAdminToken } from '@/lib/auth'; 
import { saveFileToPublic } from '@/lib/storage';

function generateSlug(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// 1. ADMIN AUTHENTICATION
export async function loginAction(formData) {
  const password = formData.get('password');
  if (password === process.env.ADMIN_PASSWORD) {
    const token = await signAdminToken();
    const cookieStore = await cookies(); 
    cookieStore.set('admin_session', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24, 
      sameSite: 'strict'
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid Password' };
}

// 2. HERO CAROUSEL ACTIONS
export async function addSlide(formData) {
  await connectDB();
  const imageFile = formData.get('image'); 
  const mobileImageFile = formData.get('mobileImage');

  if (!imageFile || imageFile.size === 0) {
    return { error: 'Desktop Image is required' };
  }

  try {
    const desktopPath = await saveFileToPublic(imageFile);
    const mobilePath = await saveFileToPublic(mobileImageFile);

    await Hero.create({
      link: formData.get('link') || '/',
      image: desktopPath,
      mobileImage: mobilePath
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

// 3. CATEGORY ACTIONS
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
  const categoriesRaw = await Category.find().lean();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));
  
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

// 4. NAVBAR ACTIONS
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

// 5. USER ACTIONS
export async function getUsers(query = '') {
  await connectDB();
  try {
    const searchFilter = query
      ? { $or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }] }
      : {};
    const usersData = await User.find(searchFilter).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(usersData));
  } catch (error) {
    return [];
  }
}

export async function toggleUserBan(id, currentStatus) {
  await connectDB();
  await User.findByIdAndUpdate(id, { isBanned: !currentStatus });
  revalidatePath('/admin/users');
  return { success: true };
}

export async function toggleUserRole(id, currentRole) {
  await connectDB();
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  await User.findByIdAndUpdate(id, { role: newRole });
  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteUser(id) {
  await connectDB();
  await User.findByIdAndDelete(id);
  revalidatePath('/admin/users');
  return { success: true };
}

// 6. PROFILE UPDATE (Fixed Logic)
export async function updateUserProfile(formData) {
  await connectDB();
  const email = formData.get('email');
  const name = formData.get('name');
  const phone = formData.get('phone');
  const imageFile = formData.get('image');

  console.log("Updating Profile For:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return { error: "User not found" };

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (imageFile && imageFile.size > 0) {
      console.log("Processing Image Upload...");
      const imagePath = await saveFileToPublic(imageFile);
      console.log("Image Saved to:", imagePath);
      
      // Update the user image field directly
      user.image = imagePath;
    }

    await user.save();
    console.log("User Saved Successfully");

    revalidatePath('/account'); 
    revalidatePath('/', 'layout'); 
    return { success: true };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { error: "Failed to update profile" };
  }
}

// 7. PRODUCT MANAGEMENT
export async function createProduct(formData) {
  await connectDB();
  
  try {
    const name = formData.get('name');
    const description = formData.get('description');
    const price = parseFloat(formData.get('price'));
    const discountPrice = formData.get('discountPrice') ? parseFloat(formData.get('discountPrice')) : null;
    const category = formData.get('category');
    const stock = parseInt(formData.get('stock'));
    
    const images = formData.getAll('images'); 
    const imagePaths = [];

    for (const file of images) {
      if (file.size > 0) {
        const path = await saveFileToPublic(file);
        if (path) imagePaths.push(path);
      }
    }

    const slug = generateSlug(name) + '-' + Date.now(); 

    const newProduct = new Product({
      name, slug, description, price, discountPrice, category, stock,
      images: imagePaths
    });

    await newProduct.save();
    revalidatePath('/admin/products');
    revalidatePath('/product'); 
    return { success: true };
  } catch (error) {
    return { error: "Failed to create product" };
  }
}

export async function getAdminProducts() {
  await connectDB();
  const productsRaw = await Product.find().sort({ createdAt: -1 }).populate('category', 'name').lean();
  const products = JSON.parse(JSON.stringify(productsRaw));
  return products.map(p => ({
    ...p,
    images: p.images && p.images.length > 0 ? p.images : ['/placeholder.jpg']
  }));
}

export async function deleteProduct(id) {
  await connectDB();
  await Product.findByIdAndDelete(id);
  revalidatePath('/admin/products');
  revalidatePath('/product');
  return { success: true };
}

export async function getProductBySlug(slug) {
  await connectDB();
  try {
    const productRaw = await Product.findOneAndUpdate(
      { slug }, 
      { $inc: { views: 1 } }, 
      { new: true }
    ).populate('category').lean();

    if (!productRaw) return null;
    const product = JSON.parse(JSON.stringify(productRaw));

    return {
      ...product,
      images: product.images && product.images.length > 0 ? product.images : ['/placeholder.jpg'],
      reviews: product.reviews || []
    };
  } catch (error) {
    return null;
  }
}

export async function getAllProducts() {
  await connectDB();
  const productsRaw = await Product.find().sort({ createdAt: -1 }).populate('category', 'name slug').lean();
  const products = JSON.parse(JSON.stringify(productsRaw));
  return products.map(p => ({
    ...p,
    images: p.images && p.images.length > 0 ? p.images : ['/placeholder.jpg']
  }));
}

export async function getRelatedProducts(categoryId, currentProductId) {
  await connectDB();
  try {
    const productsRaw = await Product.find({
      category: categoryId,
      _id: { $ne: currentProductId } 
    }).limit(4).lean();

    const products = JSON.parse(JSON.stringify(productsRaw));
    return products.map(p => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : ['/placeholder.jpg']
    }));
  } catch (error) { return []; }
}
'use server'

import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Hero from '@/models/Hero';
import Category from '@/models/Category';
import SiteContent from '@/models/SiteContent';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { revalidatePath } from 'next/cache';
import { signAdminToken, authOptions } from '@/lib/auth'; 
import { saveFileToPublic, deleteFileFromPublic } from '@/lib/storage'; 
import { encryptBuffer } from '@/lib/encryption';   
import { getServerSession } from "next-auth";
import bcrypt from 'bcryptjs';

function generateSlug(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================
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

// ==========================================
// 2. HERO CAROUSEL ACTIONS
// ==========================================
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
  try {
    const slide = await Hero.findById(id);
    if (!slide) return { error: "Slide not found" };

    if (slide.image) await deleteFileFromPublic(slide.image);
    if (slide.mobileImage) await deleteFileFromPublic(slide.mobileImage);

    await Hero.findByIdAndDelete(id);
    revalidatePath('/');
    revalidatePath('/admin/carousel');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete slide" };
  }
}

// ==========================================
// 3. CATEGORY ACTIONS
// ==========================================
export async function createCategory(formData) {
  await connectDB();
  const name = formData.get('name');
  const parentId = formData.get('parentId') || null;
  const imageFile = formData.get('image'); 
  const slug = name.toLowerCase().replace(/ /g, '-');

  try {
    let imagePath = null;
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveFileToPublic(imageFile);
    }

    await Category.create({ 
      name, 
      slug, 
      parent: parentId,
      image: imagePath 
    });

    revalidatePath('/admin/categories');
    revalidatePath('/admin/navbar');
    revalidatePath('/categories'); 
    return { success: true };
  } catch (error) {
    console.error("Create Category Error:", error);
    return { error: 'Failed to create category' };
  }
}

export async function getCategoryPageData(slug, searchParams = {}) {
  await connectDB();
  try {
    const mainCategory = await Category.findOne({ slug }).lean();
    if (!mainCategory) return null;

    const subCategoriesRaw = await Category.find({ parent: mainCategory._id }).lean();
    
    let productFilter = {};
    if (searchParams.search) {
      productFilter.name = { $regex: searchParams.search, $options: 'i' };
    }
    if (searchParams.minPrice || searchParams.maxPrice) {
      productFilter.price = {};
      if (searchParams.minPrice) productFilter.price.$gte = Number(searchParams.minPrice);
      if (searchParams.maxPrice) productFilter.price.$lte = Number(searchParams.maxPrice);
    }

    const sections = await Promise.all(subCategoriesRaw.map(async (sub) => {
      const products = await Product.find({ 
        category: sub._id,
        ...productFilter 
      })
      .limit(12) 
      .sort({ createdAt: -1 })
      .lean();

      return {
        ...sub,
        _id: sub._id.toString(),
        products: JSON.parse(JSON.stringify(products))
      };
    }));

    const mainProducts = await Product.find({ 
      category: mainCategory._id,
      ...productFilter
    }).limit(12).lean();

    return {
      mainCategory: JSON.parse(JSON.stringify(mainCategory)),
      sections: sections, 
      mainProducts: JSON.parse(JSON.stringify(mainProducts))
    };

  } catch (error) {
    console.error("Error fetching category page:", error);
    return null;
  }
}

export async function getTopCategories() {
  await connectDB();
  const categories = await Category.find({ parent: null }).lean();
  return JSON.parse(JSON.stringify(categories));
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

// ==========================================
// 4. NAVBAR ACTIONS
// ==========================================
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

export async function getNavbarConfig() {
  await connectDB();
  try {
    const content = await SiteContent.findOne({ identifier: 'main_layout' }).lean();
    if (!content || !content.navbarLinks) {
      return { logoText: 'ANAQA', logoImage: '', links: [] };
    }
    return {
      logoText: 'ANAQA',
      logoImage: '',
      links: JSON.parse(JSON.stringify(content.navbarLinks))
    };
  } catch (error) {
    return { logoText: 'ANAQA', links: [] };
  }
}

// ==========================================
// 5. USER ACTIONS
// ==========================================
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

// ==========================================
// 6. PROFILE & SECURITY ACTIONS (UPDATED)
// ==========================================
export async function updateUserProfile(formData) {
  await connectDB();
  
  const email = formData.get('email');
  const name = formData.get('name');
  const phone = formData.get('phone');
  const imageFile = formData.get('image');

  try {
    const user = await User.findOne({ email });
    if (!user) return { error: "User not found" };

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const { iv, content } = encryptBuffer(buffer);

      user.profilePicture = {
        data: content,
        iv: iv,
        contentType: imageFile.type
      };
      user.image = null; 
    }

    await user.save();
    revalidatePath('/account'); 
    revalidatePath('/', 'layout'); 
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { error: "Failed to update profile" };
  }
}

// --- Change Password ---
export async function changePassword(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');

  if (newPassword !== confirmPassword) return { success: false, error: "Passwords do not match" };
  if (newPassword.length < 6) return { success: false, error: "Password must be at least 6 characters" };

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) return { success: false, error: "User not found" };

  // Verify old password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return { success: false, error: "Incorrect current password" };

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();

  return { success: true };
}

// --- Initiate Email Change ---
// Updated to handle Google users (no password check if user.password is null)
export async function initiateEmailChange(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const password = formData.get('password');
  const newEmail = formData.get('newEmail');

  if (!newEmail || !newEmail.includes('@')) return { success: false, error: "Invalid email" };

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  // LOGIC: Only verify password if the user actually has one set (Non-Google users)
  if (user.password) {
      if (!password) return { success: false, error: "Password required" };
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return { success: false, error: "Incorrect password" };
  }

  // Check if new email is already taken
  const existingUser = await User.findOne({ email: newEmail });
  if (existingUser) return { success: false, error: "Email is already in use" };

  // Generate and save OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.emailChangeOTP = otp;
  user.emailChangeOTPExpires = otpExpires;
  user.pendingNewEmail = newEmail;
  await user.save();

  // TODO: Send OTP via your email provider (Resend, Nodemailer, etc.)
  console.log(`[DEV ONLY] OTP for ${newEmail}: ${otp}`); 

  return { success: true };
}

// --- Verify Email OTP ---
export async function verifyEmailChangeOTP(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const otp = formData.get('otp');
  const newEmail = formData.get('newEmail');

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user || user.pendingNewEmail !== newEmail) return { success: false, error: "Invalid request" };
  
  if (user.emailChangeOTP !== otp || user.emailChangeOTPExpires < new Date()) {
    return { success: false, error: "Invalid or expired OTP" };
  }

  // Update Email
  user.email = newEmail;
  user.emailChangeOTP = undefined;
  user.emailChangeOTPExpires = undefined;
  user.pendingNewEmail = undefined;
  await user.save();

  return { success: true };
}

// ==========================================
// 7. PRODUCT MANAGEMENT
// ==========================================
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
  try {
    const product = await Product.findById(id);
    if (!product) return { error: "Product not found" };

    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(imagePath => deleteFileFromPublic(imagePath))
      );
    }

    await Product.findByIdAndDelete(id);
    revalidatePath('/admin/products');
    revalidatePath('/product');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete product" };
  }
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

// ==========================================
// 8. ORDER MANAGEMENT
// ==========================================
export async function createOrder(orderData) {
  await connectDB();
  const session = await getServerSession(authOptions);

  let userId = session?.user?.id || null;

  if (!userId && session?.user?.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) userId = user._id;
  }

  try {
    const count = await Order.countDocuments();
    const orderId = `#ANQ-${1000 + count + 1}`;

    const newOrder = new Order({
      ...orderData,
      user: userId, 
      orderId,
      status: 'Pending',
      userEmail: session?.user?.email 
    });

    const savedOrder = await newOrder.save();
    
    for (const item of orderData.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { 
          $inc: { stock: -item.quantity } 
        });
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/account/orders'); 
    
    return { success: true, orderId: savedOrder._id.toString() };
  } catch (error) {
    console.error("Create Order Error:", error);
    return { error: "Failed to place order" };
  }
}

export async function getUserOrders() {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) return [];

  let userId = session.user.id;

  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) userId = user._id;
  }

  if (!userId) return [];

  try {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
      
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export async function getAdminOrders() {
  await connectDB();
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .lean();

  return JSON.parse(JSON.stringify(orders));
}

export async function updateOrderStatus(orderId, newStatus) {
  await connectDB();
  try {
    await Order.findByIdAndUpdate(orderId, { status: newStatus });
    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status" };
  }
}
'use server'

import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Hero from '@/models/Hero';
import Category from '@/models/Category';
import SiteContent from '@/models/SiteContent';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Address from '@/models/Address';
import Coupon from '@/models/Coupon';
import { revalidatePath } from 'next/cache';
import { signAdminToken, authOptions } from '@/lib/auth'; 
import { saveFileToPublic, deleteFileFromPublic } from '@/lib/storage'; 
import { encryptBuffer } from '@/lib/encryption';   
import { getServerSession } from "next-auth";
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email'; 

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
// 6. PROFILE & SECURITY ACTIONS
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
    return { error: "Failed to update profile" };
  }
}

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

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return { success: false, error: "Incorrect current password" };

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();

  return { success: true };
}

export async function initiateEmailChange(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const password = formData.get('password');
  const newEmail = formData.get('newEmail');

  if (!newEmail || !newEmail.includes('@')) return { success: false, error: "Invalid email" };

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (user.password) {
      if (!password) return { success: false, error: "Password required" };
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return { success: false, error: "Incorrect password" };
  }

  const existingUser = await User.findOne({ email: newEmail });
  if (existingUser) return { success: false, error: "Email is already in use" };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

  user.emailChangeOTP = otp;
  user.emailChangeOTPExpires = otpExpires;
  user.pendingNewEmail = newEmail;
  await user.save();

  try {
    await sendOtpEmail(newEmail, otp);
  } catch (error) {
    return { success: false, error: "Failed to send OTP email" };
  }

  return { success: true };
}

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

  user.email = newEmail;
  user.emailChangeOTP = undefined;
  user.emailChangeOTPExpires = undefined;
  user.pendingNewEmail = undefined;
  await user.save();

  return { success: true };
}

// ==========================================
// 7. ADDRESS ACTIONS
// ==========================================
export async function getSavedAddresses() {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) return [];

  let userId = session.user.id;
  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) userId = user._id;
  }
  if (!userId) return [];

  const addresses = await Address.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(addresses));
}

export async function saveAddress(formData) {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) return { error: "Unauthorized" };

  let userId = session.user.id;
  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) userId = user._id;
  }

  try {
    const addressData = {
      user: userId,
      label: formData.get('label') || 'Home',
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      postalCode: formData.get('postalCode'),
    };

    await Address.create(addressData);
    revalidatePath('/checkout');
    return { success: true };
  } catch (error) {
    return { error: "Failed to save address" };
  }
}

// ==========================================
// 8. DISCOUNT ENGINE (SMART CALCULATOR)
// ==========================================

// Helper: Compute a single rule against a cart
function computeRuleDiscount(rule, cartItems, cartTotal, totalQty) {
  const now = new Date();
  
  // 1. Check Limits
  if (!rule.isActive) return 0;
  if (now > new Date(rule.validUntil)) return 0;
  if (rule.usedCount >= rule.usageLimit) return 0;
  if (cartTotal < rule.minSpend) return 0;
  if (totalQty < rule.minQuantity) return 0;

  // 2. Check Scope (Specific Products/Categories)
  let eligibleAmount = cartTotal;
  const hasCatRestriction = rule.applicableCategories?.length > 0;
  const hasProdRestriction = rule.applicableProducts?.length > 0;

  if (hasCatRestriction || hasProdRestriction) {
     // --- FIX: Convert ObjectIds to Strings for safe comparison ---
     const catIds = rule.applicableCategories.map(id => id.toString());
     const prodIds = rule.applicableProducts.map(id => id.toString());

     const eligibleItems = cartItems.filter(item => 
        (hasCatRestriction && (
            // Check if item.category is an object (populated) or string (ID)
            catIds.includes(item.category?._id?.toString()) ||
            catIds.includes(item.category?.toString())
        )) ||
        (hasProdRestriction && prodIds.includes(item._id?.toString()))
     );
     // -------------------------------------------------------------
     
     if (eligibleItems.length === 0) return 0;

     eligibleAmount = eligibleItems.reduce((acc, item) => {
        const price = item.discountPrice || item.price;
        return acc + (price * item.quantity);
     }, 0);
  }

  // 3. Calc Value
  let val = 0;
  if (rule.discountType === 'percentage') {
    val = (eligibleAmount * rule.discountValue) / 100;
    if (rule.maxDiscount && val > rule.maxDiscount) val = rule.maxDiscount;
  } else {
    val = rule.discountValue;
  }
  return Math.round(val);
}

// MAIN CALCULATOR
export async function calculateCart(cartItems, manualCode = null) {
  await connectDB();
  
  let response = {
    cartTotal: 0,
    discountTotal: 0,
    grandTotal: 0,
    appliedCoupon: null, // Single object: { code, desc, amount, isAuto }
    error: null
  };

  if (!cartItems || cartItems.length === 0) return response;

  // A. Calculate Raw Total
  response.cartTotal = cartItems.reduce((acc, item) => {
    const price = item.discountPrice || item.price;
    return acc + price * item.quantity;
  }, 0);
  
  const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // B. Find Best AUTOMATIC Rule (Background Check)
  const autoRules = await Coupon.find({ isAutomatic: true, isActive: true });
  let bestAutoDiscount = 0;
  let bestAutoRule = null;

  for (const rule of autoRules) {
    const amount = computeRuleDiscount(rule, cartItems, response.cartTotal, totalQty);
    if (amount > bestAutoDiscount) {
      bestAutoDiscount = amount;
      bestAutoRule = rule;
    }
  }

  // C. Determine Winner
  if (manualCode) {
    // 1. Try Manual First
    const manualRule = await Coupon.findOne({ code: manualCode.toUpperCase(), isActive: true, isAutomatic: false });
    
    if (manualRule) {
      const manualAmount = computeRuleDiscount(manualRule, cartItems, response.cartTotal, totalQty);
      if (manualAmount > 0) {
        // Manual Valid: It Wins
        response.appliedCoupon = { code: manualRule.code, desc: manualRule.description, amount: manualAmount, isAuto: false };
        response.discountTotal = manualAmount;
      } else {
        // Manual Exists but Req not met -> Error + Fallback to Auto
        response.error = `Requirements not met for ${manualCode}`;
        if (bestAutoRule) {
           response.appliedCoupon = { code: bestAutoRule.code, desc: bestAutoRule.description, amount: bestAutoDiscount, isAuto: true };
           response.discountTotal = bestAutoDiscount;
        }
      }
    } else {
      // Manual Invalid Code -> Error + Fallback to Auto
      response.error = 'Invalid Coupon Code';
      if (bestAutoRule) {
         response.appliedCoupon = { code: bestAutoRule.code, desc: bestAutoRule.description, amount: bestAutoDiscount, isAuto: true };
         response.discountTotal = bestAutoDiscount;
      }
    }
  } else {
    // 2. No Manual Code -> Auto Wins
    if (bestAutoRule) {
      response.appliedCoupon = { code: bestAutoRule.code, desc: bestAutoRule.description, amount: bestAutoDiscount, isAuto: true };
      response.discountTotal = bestAutoDiscount;
    }
  }

  // D. Finalize
  if (response.discountTotal > response.cartTotal) response.discountTotal = response.cartTotal;
  response.grandTotal = response.cartTotal - response.discountTotal;

  return response;
}

// 4. COUPON CRUD
export async function createCoupon(formData) {
  await connectDB();
  try {
    const isAutomatic = formData.get('isAutomatic') === 'true';
    let code = formData.get('code');
    
    // Generate system code for auto discounts if empty
    if (isAutomatic && !code) code = `AUTO-${Date.now()}`;

    const data = {
      code,
      description: formData.get('description'),
      isAutomatic,
      discountType: formData.get('discountType'),
      discountValue: Number(formData.get('discountValue')),
      minSpend: Number(formData.get('minSpend') || 0),
      minQuantity: Number(formData.get('minQuantity') || 0),
      validUntil: new Date(formData.get('validUntil')),
      usageLimit: Number(formData.get('usageLimit') || 10000),
      applicableCategories: formData.getAll('categories'), 
      applicableProducts: formData.getAll('products'), 
    };
    await Coupon.create(data);
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create coupon' };
  }
}

export async function getCoupons() {
  await connectDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(coupons));
}

export async function deleteCoupon(id) {
  await connectDB();
  await Coupon.findByIdAndDelete(id);
  revalidatePath('/admin/coupons');
  return { success: true };
}

// ==========================================
// 9. PRODUCT ACTIONS
// ==========================================
export async function getProductHierarchy() {
  await connectDB();
  const categories = await Category.find().lean();
  const hierarchy = await Promise.all(categories.map(async (cat) => {
    const products = await Product.find({ category: cat._id }).select('name price _id').lean();
    return { ...cat, _id: cat._id.toString(), products: JSON.parse(JSON.stringify(products)) };
  }));
  return JSON.parse(JSON.stringify(hierarchy));
}

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
      await Promise.all(product.images.map(imagePath => deleteFileFromPublic(imagePath)));
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
    const productRaw = await Product.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).populate('category').lean();
    if (!productRaw) return null;
    const product = JSON.parse(JSON.stringify(productRaw));
    return { ...product, images: product.images && product.images.length > 0 ? product.images : ['/placeholder.jpg'], reviews: product.reviews || [] };
  } catch (error) { return null; }
}

export async function getAllProducts() {
  await connectDB();
  const productsRaw = await Product.find().sort({ createdAt: -1 }).populate('category', 'name slug').lean();
  const products = JSON.parse(JSON.stringify(productsRaw));
  return products.map(p => ({ ...p, images: p.images && p.images.length > 0 ? p.images : ['/placeholder.jpg'] }));
}

export async function getRelatedProducts(categoryId, currentProductId) {
  await connectDB();
  try {
    const productsRaw = await Product.find({ category: categoryId, _id: { $ne: currentProductId } }).limit(4).lean();
    const products = JSON.parse(JSON.stringify(productsRaw));
    return products.map(p => ({ ...p, images: p.images && p.images.length > 0 ? p.images : ['/placeholder.jpg'] }));
  } catch (error) { return []; }
}

// ==========================================
// 10. ORDER CREATION (FINAL LOGIC)
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
    // 1. RE-CALCULATE EVERYTHING SERVER SIDE
    // We pass the couponCode (if any) to see if it's still valid or if auto logic applies
    const calcResult = await calculateCart(orderData.items, orderData.couponCode);
    
    // 2. Record Coupon Usage (Manual or Auto)
    if (calcResult.appliedCoupon) {
       await Coupon.findOneAndUpdate(
         { code: calcResult.appliedCoupon.code },
         { 
           $inc: { usedCount: 1 },
           $push: { usedBy: { user: userId, usedAt: new Date() } }
         }
       );
    }

    const count = await Order.countDocuments();
    const orderId = `#ANQ-${1000 + count + 1}`;

    const newOrder = new Order({
      ...orderData,
      user: userId, 
      orderId,
      status: 'Pending',
      userEmail: session?.user?.email,
      
      // Override with secure calculations
      subTotal: calcResult.cartTotal,
      discountAmount: calcResult.discountTotal,
      couponCode: calcResult.appliedCoupon?.code || null,
      totalAmount: calcResult.grandTotal + (orderData.shippingAddress.method === 'outside' ? 150 : 80) // Recalc shipping
    });

    await newOrder.save();
    
    // Decrease Stock
    for (const item of orderData.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { 
          $inc: { stock: -item.quantity } 
        });
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/account/orders'); 
    
    return { success: true, orderId: orderId };
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
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) { return []; }
}

export async function getAdminOrders() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email').lean();
  return JSON.parse(JSON.stringify(orders));
}

export async function updateOrderStatus(orderId, newStatus) {
  await connectDB();
  try {
    await Order.findByIdAndUpdate(orderId, { status: newStatus });
    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
    return { success: true };
  } catch (error) { return { error: "Failed to update status" }; }
}
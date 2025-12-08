// anaqa/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  
  // CHANGED: Array of strings (File paths)
  images: [{ type: String }],

  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
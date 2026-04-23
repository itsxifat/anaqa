import mongoose from 'mongoose';

const FeaturedSectionSchema = new mongoose.Schema({
  heading: { type: String, default: 'Featured Collection' },
  subheading: { type: String, default: '' },
  image: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.FeaturedSection ||
  mongoose.model('FeaturedSection', FeaturedSectionSchema);

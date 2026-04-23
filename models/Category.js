import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String, // Path to the uploaded thumbnail
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
}, { timestamps: true });

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
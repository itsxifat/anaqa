import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }, // e.g. /women/clothing
  // Parent reference allows infinite nesting
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
import mongoose from 'mongoose';

const VideoSectionSchema = new mongoose.Schema({
  heading: { type: String, default: 'Shop The Look' },
  subheading: { type: String, default: '' },
  // Store either a local path (uploaded file) or an external URL
  videoUrl: { type: String, default: '' },
  videoPoster: { type: String, default: '' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.VideoSection ||
  mongoose.model('VideoSection', VideoSectionSchema);

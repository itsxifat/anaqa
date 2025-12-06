import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema({
  link: { type: String, default: '/' }, // The URL to open when clicked
  
  // Images
  image: { data: Buffer, contentType: String }, // Desktop
  mobileImage: { data: Buffer, contentType: String }, // Mobile (Optional)
}, { timestamps: true });

export default mongoose.models.Hero || mongoose.model('Hero', HeroSchema);
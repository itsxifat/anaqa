import mongoose from 'mongoose';

const ButtonLayerSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true }, // Toggle Button ON/OFF
  text: String,
  link: { type: String, default: '/' },
  x: { type: Number, default: 50 },
  y: { type: Number, default: 85 },
  color: { type: String, default: '#000000' }, 
  bgColor: { type: String, default: '#ffffff' }, 
  fontSize: { type: String, default: 'text-sm md:text-base' }, 
  fontFamily: { type: String, default: 'font-manrope' },
  fontWeight: { type: String, default: 'font-bold' },
  isUppercase: { type: Boolean, default: true },
  letterSpacing: { type: String, default: 'tracking-widest' },
  borderRadius: { type: Number, default: 0 }, 
  paddingX: { type: Number, default: 40 }, 
  paddingY: { type: Number, default: 16 }, 
  hasShadow: { type: Boolean, default: false },
});

const HeroSchema = new mongoose.Schema({
  buttonLayer: ButtonLayerSchema,
  overlayOpacity: { type: Number, default: 10 },
  
  // Desktop Image (Landscape)
  image: {
    data: Buffer,
    contentType: String,
  },
  
  // Mobile Image (Portrait)
  mobileImage: {
    data: Buffer,
    contentType: String,
  },
}, { timestamps: true });

export default mongoose.models.Hero || mongoose.model('Hero', HeroSchema);
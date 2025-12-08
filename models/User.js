// anaqa/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  
  // CHANGED: Unified image field. Can be Google URL or Local Path
  image: { type: String }, 
  
  provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
  
  // customImage field is removed/deprecated in favor of 'image' string

  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
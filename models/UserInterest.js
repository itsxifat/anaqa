import mongoose from 'mongoose';

const UserInterestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Logged in user
  guestId: { type: String, required: false }, // Non-logged in user (cookie)
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  interactionType: { type: String, enum: ['view', 'cart', 'search'], required: true },
  score: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, expires: '30d' }
});

UserInterestSchema.index({ user: 1 }, { sparse: true });
UserInterestSchema.index({ guestId: 1 }, { sparse: true });
UserInterestSchema.index({ category: 1, score: -1 });
UserInterestSchema.index({ tags: 1, score: -1 });

export default mongoose.models.UserInterest || mongoose.model('UserInterest', UserInterestSchema);
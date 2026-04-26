import mongoose from 'mongoose';

const PageContentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  heroImage: { type: String, default: '' },
  heroHeading: { type: String, default: '' },
  heroSubheading: { type: String, default: '' },
  sections: [{
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
    order: { type: Number, default: 0 },
  }],
  teamMembers: [{
    name: String,
    role: String,
    image: String,
    bio: String,
  }],
  showInFooter: { type: Boolean, default: true },
  footerGroup: { type: String, default: 'Legal' },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

PageContentSchema.index({ slug: 1 });
PageContentSchema.index({ showInFooter: 1, isPublished: 1 });

export default mongoose.models.PageContent ||
  mongoose.model('PageContent', PageContentSchema);

import mongoose from 'mongoose';

// Generic rich-content model powering About Us, Terms, and Privacy Policy
const PageContentSchema = new mongoose.Schema({
  // Slug identifies which page: 'about', 'terms', 'privacy'
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  // Hero / banner section
  heroImage: { type: String, default: '' },
  heroHeading: { type: String, default: '' },
  heroSubheading: { type: String, default: '' },
  // Main body — stored as an array of {heading, body} blocks so the admin
  // can add/reorder sections without a full CMS
  sections: [{
    heading: { type: String, default: '' },
    body: { type: String, default: '' },   // supports HTML from a simple textarea
    order: { type: Number, default: 0 },
  }],
  // About-Us-specific extras
  teamMembers: [{
    name: String,
    role: String,
    image: String,
    bio: String,
  }],
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

PageContentSchema.index({ slug: 1 });

export default mongoose.models.PageContent ||
  mongoose.model('PageContent', PageContentSchema);

'use server';

import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import { saveFileToPublic } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function getAllPages() {
  await connectDB();
  const pages = await PageContent.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(pages));
}

export async function getPageContent(slug) {
  await connectDB();
  const doc = await PageContent.findOne({ slug }).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function getPageById(id) {
  await connectDB();
  const doc = await PageContent.findById(id).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function getFooterPages() {
  await connectDB();
  const pages = await PageContent
    .find({ showInFooter: true, isPublished: true })
    .select('slug title footerGroup')
    .sort({ footerGroup: 1, title: 1 })
    .lean();
  return JSON.parse(JSON.stringify(pages));
}

export async function savePageContent(formData) {
  await connectDB();
  try {
    const id = formData.get('id') || null;
    const slug = formData.get('slug')?.trim().toLowerCase().replace(/\s+/g, '-');
    const title = formData.get('title');
    const description = formData.get('description') || '';
    const heroHeading = formData.get('heroHeading') || '';
    const heroSubheading = formData.get('heroSubheading') || '';
    const showInFooter = formData.get('showInFooter') === 'true';
    const footerGroup = formData.get('footerGroup') || 'Legal';
    const isPublished = formData.get('isPublished') === 'true';

    let heroImage = formData.get('existingHeroImage') || '';
    const heroImageFile = formData.get('heroImage');
    if (heroImageFile && heroImageFile.size > 0) {
      heroImage = await saveFileToPublic(heroImageFile);
    }

    let sections = [];
    const sectionsJson = formData.get('sections');
    if (sectionsJson) {
      try { sections = JSON.parse(sectionsJson); } catch { sections = []; }
    }

    let teamMembers = [];
    const teamJson = formData.get('teamMembers');
    if (teamJson) {
      try { teamMembers = JSON.parse(teamJson); } catch { teamMembers = []; }
    }

    const updateData = {
      slug, title, description, heroImage, heroHeading, heroSubheading,
      sections, teamMembers, showInFooter, footerGroup, isPublished,
    };

    let doc;
    if (id) {
      doc = await PageContent.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      doc = await PageContent.findOneAndUpdate(
        { slug },
        { ...updateData, slug },
        { upsert: true, new: true }
      );
    }

    revalidatePath(`/pages/${slug}`);
    revalidatePath('/');
    revalidatePath('/admin/pages');
    return { success: true, id: doc._id.toString() };
  } catch (err) {
    if (err.code === 11000) return { error: 'A page with this slug already exists.' };
    console.error('savePageContent:', err);
    return { error: 'Failed to save page content' };
  }
}

export async function deletePage(id) {
  await connectDB();
  try {
    const doc = await PageContent.findByIdAndDelete(id);
    if (doc) {
      revalidatePath(`/pages/${doc.slug}`);
      revalidatePath('/');
      revalidatePath('/admin/pages');
    }
    return { success: true };
  } catch (err) {
    console.error('deletePage:', err);
    return { error: 'Failed to delete page' };
  }
}

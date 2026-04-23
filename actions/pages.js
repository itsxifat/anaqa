'use server';

import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import { saveFileToPublic } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function getPageContent(slug) {
  await connectDB();
  const doc = await PageContent.findOne({ slug }).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function savePageContent(formData) {
  await connectDB();
  try {
    const slug = formData.get('slug');
    const title = formData.get('title');
    const heroHeading = formData.get('heroHeading') || '';
    const heroSubheading = formData.get('heroSubheading') || '';

    let heroImage = formData.get('existingHeroImage') || '';
    const heroImageFile = formData.get('heroImage');
    if (heroImageFile && heroImageFile.size > 0) {
      heroImage = await saveFileToPublic(heroImageFile);
    }

    // Sections: sent as JSON string from client
    let sections = [];
    const sectionsJson = formData.get('sections');
    if (sectionsJson) {
      try { sections = JSON.parse(sectionsJson); } catch { sections = []; }
    }

    // Team members (About Us)
    let teamMembers = [];
    const teamJson = formData.get('teamMembers');
    if (teamJson) {
      try { teamMembers = JSON.parse(teamJson); } catch { teamMembers = []; }
    }

    await PageContent.findOneAndUpdate(
      { slug },
      { slug, title, heroImage, heroHeading, heroSubheading, sections, teamMembers },
      { upsert: true, new: true }
    );

    revalidatePath(`/${slug === 'about' ? 'about-us' : slug}`);
    revalidatePath(`/admin/pages/${slug}`);
    return { success: true };
  } catch (err) {
    console.error('savePageContent:', err);
    return { error: 'Failed to save page content' };
  }
}

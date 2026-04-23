'use server';

import connectDB from '@/lib/db';
import FeaturedSection from '@/models/FeaturedSection';
import VideoSection from '@/models/VideoSection';
import { saveFileToPublic } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

// ─── FEATURED SECTION ─────────────────────────────────────────────────────────

export async function getFeaturedSection() {
  await connectDB();
  const doc = await FeaturedSection.findOne({})
    .populate('products', 'name slug price discountPrice images category')
    .lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function saveFeaturedSection(formData) {
  await connectDB();
  try {
    const heading = formData.get('heading') || 'Featured Collection';
    const subheading = formData.get('subheading') || '';
    const productIds = formData.getAll('products');
    const isActive = formData.get('isActive') === 'true';

    let imagePath = formData.get('existingImage') || '';
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      imagePath = await saveFileToPublic(imageFile);
    }

    await FeaturedSection.findOneAndUpdate(
      {},
      { heading, subheading, image: imagePath, products: productIds, isActive },
      { upsert: true, new: true }
    );

    revalidatePath('/');
    revalidatePath('/admin/homepage/featured');
    return { success: true };
  } catch (err) {
    console.error('saveFeaturedSection:', err);
    return { error: 'Failed to save featured section' };
  }
}

// ─── VIDEO SECTION ────────────────────────────────────────────────────────────

export async function getVideoSection() {
  await connectDB();
  const doc = await VideoSection.findOne({})
    .populate('products', 'name slug price discountPrice images category')
    .lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function saveVideoSection(formData) {
  await connectDB();
  try {
    const heading = formData.get('heading') || 'Shop The Look';
    const subheading = formData.get('subheading') || '';
    const productIds = formData.getAll('products');
    const isActive = formData.get('isActive') === 'true';
    const externalVideoUrl = formData.get('externalVideoUrl') || '';

    let videoUrl = formData.get('existingVideo') || '';
    let videoPoster = formData.get('existingPoster') || '';

    const videoFile = formData.get('video');
    if (videoFile && videoFile.size > 0) {
      videoUrl = await saveFileToPublic(videoFile);
    } else if (externalVideoUrl) {
      videoUrl = externalVideoUrl;
    }

    const posterFile = formData.get('poster');
    if (posterFile && posterFile.size > 0) {
      videoPoster = await saveFileToPublic(posterFile);
    }

    await VideoSection.findOneAndUpdate(
      {},
      { heading, subheading, videoUrl, videoPoster, products: productIds, isActive },
      { upsert: true, new: true }
    );

    revalidatePath('/');
    revalidatePath('/admin/homepage/video');
    return { success: true };
  } catch (err) {
    console.error('saveVideoSection:', err);
    return { error: 'Failed to save video section' };
  }
}

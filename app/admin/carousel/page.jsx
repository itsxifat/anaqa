import connectDB from '@/lib/db';
import Hero from '@/models/Hero';
import CarouselClient from './CarouselClient';

export default async function CarouselPage() {
  await connectDB();
  const rawSlides = await Hero.find().sort({ createdAt: -1 }).lean();
  
  // Serialize for client component
  const slides = rawSlides.map(slide => ({
    ...slide,
    _id: slide._id.toString(),
    image: null 
  }));

  return <CarouselClient slides={slides} />;
}
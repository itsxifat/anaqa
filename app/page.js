import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection"; // <--- 1. Import this
import connectDB from "@/lib/db";
import HeroModel from "@/models/Hero";
import SiteContent from "@/models/SiteContent";

export default async function Home() {
  await connectDB();
  
  // Fetch Navbar Data
  const siteContent = await SiteContent.findOne({ identifier: 'main_layout' }).lean();
  const navData = {
    logoImage: "/logo.png",
    logoText: "ANAQA",
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : [] 
  };

  // Fetch Hero Data
  const slides = await HeroModel.find({}).sort({ createdAt: -1 }).lean();
  const heroData = slides.map(slide => ({
    id: slide._id.toString(),
    link: slide.link || '/',
    imageDesktop: slide.image || '/placeholder.jpg',
    imageMobile: slide.mobileImage || null
  }));

  return (
    <main className="min-h-screen bg-white">
      <Navbar navData={navData} />
      
      {/* Hero Carousel Area */}
      {heroData.length > 0 ? (
        <Hero heroData={heroData} />
      ) : (
        <div className="h-[800px] flex flex-col items-center justify-center bg-gray-50 text-gray-400 text-center px-4 font-manrope">
          <p className="text-sm uppercase tracking-widest">Carousel Empty</p>
        </div>
      )}

      {/* 2. New Category Section */}
      <CategorySection />

    </main>
  );
}
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import connectDB from "@/lib/db";
import HeroModel from "@/models/Hero";
import SiteContent from "@/models/SiteContent";

export default async function Home() {
  await connectDB();
  
  // 1. Fetch Navbar Config
  const siteContent = await SiteContent.findOne({ identifier: 'main_layout' }).lean();
  
  // DATA FIX: Serialize Mongoose Objects for Client Component
  const navData = {
    logoImage: "/logo.png",
    logoText: "ANAQA",
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : [] 
  };

  // 2. Fetch Hero Slides
  const slides = await HeroModel.find({}, '-image.data -mobileImage.data').sort({ createdAt: -1 }).lean();
  const heroData = slides.map(slide => ({
    id: slide._id.toString(),
    link: slide.link || '/',
    // Removed buttonLayer props as requested
    imageDesktop: `/api/images/${slide._id}`,
    imageMobile: slide.mobileImage ? `/api/images/${slide._id}?mobile=true` : null
  }));

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar stays fixed at the top */}
      <Navbar navData={navData} />
      
      {/* Hero fills the rest of the screen */}
      {heroData.length > 0 ? (
        <Hero heroData={heroData} />
      ) : (
        <div className="h-[800px] flex flex-col items-center justify-center bg-gray-50 text-gray-400 text-center px-4 font-manrope">
          <p className="text-sm uppercase tracking-widest">Carousel Empty</p>
        </div>
      )}
    </main>
  );
}
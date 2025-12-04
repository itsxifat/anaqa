import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import connectDB from "@/lib/db";
import HeroModel from "@/models/Hero";
import SiteContent from "@/models/SiteContent";

// --- HELPER: Fix Mongoose IDs ---
// This recursively goes through your links and converts _id to string
const serializeLinks = (links) => {
  if (!links) return [];
  return links.map(link => ({
    ...link,
    _id: link._id.toString(), // Convert ObjectId to String
    children: link.children ? serializeLinks(link.children) : []
  }));
};

export default async function Home() {
  await connectDB();
  
  // 1. Fetch Navbar Config
  const siteContent = await SiteContent.findOne({ identifier: 'main_layout' }).lean();
  
  const navData = {
    logoImage: "/logo.png",
    logoText: "ANAQA",
    // FIX: Apply the serialization here
    links: siteContent?.navbarLinks ? serializeLinks(siteContent.navbarLinks) : [] 
  };

  // 2. Fetch Hero Slides
  const slides = await HeroModel.find({}, '-image.data -mobileImage.data').sort({ createdAt: -1 }).lean();
  
  const heroData = slides.map(slide => ({
    id: slide._id.toString(),
    buttonLayer: slide.buttonLayer,
    showButton: slide.showButton !== false, 
    overlayOpacity: slide.overlayOpacity || 10,
    imageDesktop: `/api/images/${slide._id}`,
    imageMobile: slide.mobileImage ? `/api/images/${slide._id}?mobile=true` : null
  }));

  return (
    <main className="min-h-screen bg-white">
      <Navbar navData={navData} />
      {heroData.length > 0 ? (
        <Hero heroData={heroData} />
      ) : (
        <div className="h-screen bg-gray-100 text-center pt-40">
          <p>Add slides in Admin</p>
        </div>
      )}
    </main>
  );
}
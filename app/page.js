import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import RecommendedSection from "@/components/RecommendedSection";
import FeaturedSection from "@/components/FeaturedSection";
import VideoSection from "@/components/VideoSection";
import connectDB from "@/lib/db";
import HeroModel from "@/models/Hero";
import SiteContent from "@/models/SiteContent";
import FeaturedSectionModel from "@/models/FeaturedSection";
import VideoSectionModel from "@/models/VideoSection";

export default async function Home() {
  await connectDB();

  const [siteContent, slides, featuredRaw, videoRaw] = await Promise.all([
    SiteContent.findOne({ identifier: 'main_layout' }).lean(),
    HeroModel.find({}).sort({ createdAt: -1 }).lean(),
    FeaturedSectionModel.findOne({})
      .populate('products', 'name slug price discountPrice images category sku')
      .lean(),
    VideoSectionModel.findOne({})
      .populate('products', 'name slug price discountPrice images category sku')
      .lean(),
  ]);

  const navData = {
    logoImage: "/logo.png",
    logoText: "ANAQA",
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : [],
  };

  const heroData = slides.map(slide => ({
    id: slide._id.toString(),
    link: slide.link || '/',
    imageDesktop: slide.image || '/placeholder.jpg',
    imageMobile: slide.mobileImage || null,
  }));

  const featuredData = featuredRaw ? JSON.parse(JSON.stringify(featuredRaw)) : null;
  const videoData = videoRaw ? JSON.parse(JSON.stringify(videoRaw)) : null;

  return (
    <main className="min-h-screen bg-white">
      <Navbar navData={navData} />

      {/* Hero Carousel */}
      {heroData.length > 0 ? (
        <Hero heroData={heroData} />
      ) : (
        <div className="h-[500px] flex flex-col items-center justify-center bg-gray-50 text-gray-400">
          <p className="text-sm uppercase tracking-widest">Carousel Empty</p>
        </div>
      )}

      {/* Category Section */}
      <CategorySection />

      {/* Featured Section (image + heading + selected products) */}
      <FeaturedSection data={featuredData} />

      {/* Recommendations */}
      <RecommendedSection />

      {/* Video Section (video + selected products) */}
      <VideoSection data={videoData} />
    </main>
  );
}

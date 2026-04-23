import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import SiteContent from '@/models/SiteContent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StaticPageRenderer from '@/components/StaticPageRenderer';

export async function generateMetadata() {
  await connectDB();
  const data = await PageContent.findOne({ slug: 'about' }).lean();
  return {
    title: data?.title || 'About Us',
    description: data?.heroSubheading || '',
  };
}

export default async function AboutUsPage() {
  await connectDB();
  const [siteContent, data] = await Promise.all([
    SiteContent.findOne({ identifier: 'main_layout' }).lean(),
    PageContent.findOne({ slug: 'about' }).lean(),
  ]);

  const navData = {
    logoImage: '/logo.png',
    logoText: 'ANAQA',
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : [],
  };

  const serialized = data ? JSON.parse(JSON.stringify(data)) : {
    title: 'About Us',
    heroHeading: 'Who We Are',
    heroSubheading: 'Crafting luxury experiences for the modern soul.',
    sections: [],
    teamMembers: [],
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar navData={navData} />
      <StaticPageRenderer data={serialized} />
      <Footer />
    </main>
  );
}

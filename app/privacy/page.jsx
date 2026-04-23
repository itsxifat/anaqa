import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import SiteContent from '@/models/SiteContent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StaticPageRenderer from '@/components/StaticPageRenderer';

export async function generateMetadata() {
  await connectDB();
  const data = await PageContent.findOne({ slug: 'privacy' }).lean();
  return { title: data?.title || 'Privacy Policy' };
}

export default async function PrivacyPage() {
  await connectDB();
  const [siteContent, data] = await Promise.all([
    SiteContent.findOne({ identifier: 'main_layout' }).lean(),
    PageContent.findOne({ slug: 'privacy' }).lean(),
  ]);

  const navData = {
    logoImage: '/logo.png',
    logoText: 'ANAQA',
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : [],
  };

  const serialized = data ? JSON.parse(JSON.stringify(data)) : {
    title: 'Privacy Policy',
    heroHeading: 'Privacy Policy',
    heroSubheading: 'Your privacy matters to us. Here is how we handle your data.',
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

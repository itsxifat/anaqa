import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import SiteContent from '@/models/SiteContent';
import Navbar from '@/components/Navbar';
import StaticPageRenderer from '@/components/StaticPageRenderer';

export async function generateMetadata() {
  await connectDB();
  const data = await PageContent.findOne({ slug: 'terms' }).lean();
  return { title: data?.title || 'Terms & Conditions' };
}

export default async function TermsPage() {
  await connectDB();
  const [siteContent, data] = await Promise.all([
    SiteContent.findOne({ identifier: 'main_layout' }).lean(),
    PageContent.findOne({ slug: 'terms' }).lean(),
  ]);

  const navData = {
    logoImage: '/logo.png',
    logoText: 'ANAQA',
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : [],
  };

  const serialized = data ? JSON.parse(JSON.stringify(data)) : {
    title: 'Terms & Conditions',
    heroHeading: 'Terms & Conditions',
    heroSubheading: 'Please read these terms carefully before using our services.',
    sections: [],
    teamMembers: [],
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar navData={navData} />
      <StaticPageRenderer data={serialized} />
    </main>
  );
}

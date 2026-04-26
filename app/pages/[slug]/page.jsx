import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import SiteContent from '@/models/SiteContent';
import Navbar from '@/components/Navbar';
import StaticPageRenderer from '@/components/StaticPageRenderer';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const data = await PageContent.findOne({ slug, isPublished: true }).lean();
  return {
    title: data?.title || slug,
    description: data?.description || data?.heroSubheading || '',
  };
}

export default async function PublicPage({ params }) {
  const { slug } = await params;
  await connectDB();
  const [siteContent, data] = await Promise.all([
    SiteContent.findOne({ identifier: 'main_layout' }).lean(),
    PageContent.findOne({ slug, isPublished: true }).lean(),
  ]);

  if (!data) notFound();

  const navData = {
    logoImage: '/logo.png',
    logoText: 'ANAQA',
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : [],
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar navData={navData} />
      <StaticPageRenderer data={JSON.parse(JSON.stringify(data))} />
    </main>
  );
}

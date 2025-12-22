import connectDB from '@/lib/db';
import SiteContent from '@/models/SiteContent';
import { getProductBySlug, getRelatedProducts } from '@/app/actions';
import Navbar from '@/components/Navbar';
import ProductDetails from '@/components/ProductDetails'; // We create this next

export const dynamic = 'force-dynamic';

// --- 1. DYNAMIC SEO (Admin Controlled) ---
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Product Not Found | ANAQA' };

  return {
    title: product.metaTitle || `${product.name} | ANAQA`,
    description: product.metaDescription || product.description?.substring(0, 160),
    keywords: product.metaKeywords || product.category?.name,
    openGraph: {
      title: product.name,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  await connectDB();
  const { slug } = await params;

  // 2. Fetch Navbar Data
  const siteContent = await SiteContent.findOne({ identifier: 'main_layout' }).lean();
  const navData = {
    logoImage: "/logo.png",
    logoText: "ANAQA",
    links: siteContent?.navbarLinks ? JSON.parse(JSON.stringify(siteContent.navbarLinks)) : []
  };

  // 3. Fetch Product Data (Safe Conversion)
  const rawProduct = await getProductBySlug(slug);
  const product = rawProduct ? JSON.parse(JSON.stringify(rawProduct)) : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Navbar navData={navData} />
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <h1 className="font-bodoni text-3xl mb-2">Item Unavailable</h1>
          <a href="/products" className="border-b border-black text-xs uppercase tracking-widest pb-1">Browse Collection</a>
        </div>
      </div>
    );
  }

  // 4. Fetch Related Items
  const rawRelated = await getRelatedProducts(product.category?._id, product._id);
  const relatedProducts = rawRelated ? JSON.parse(JSON.stringify(rawRelated)) : [];

  return (
    <div className="bg-[#faf9f6] min-h-screen">
      <Navbar navData={navData} />
      {/* Pass data to the interactive client component */}
      <ProductDetails product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
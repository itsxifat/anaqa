import { getProductBySlug, getRelatedProducts } from '@/app/actions';
import ProductGallery from '@/components/ProductGallery';
import ProductInfo from '@/components/ProductInfo';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: `${product?.name} | ANAQA` };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  
  // 1. Fetch Data
  const product = await getProductBySlug(slug);
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  // 2. Fetch Related Items
  const relatedProducts = await getRelatedProducts(product.category?._id, product._id);

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      
      {/* --- MAIN PRODUCT SECTION --- */}
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <ProductGallery images={product.images || ['/placeholder.jpg']} />
        <ProductInfo product={product} />
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="max-w-[1600px] mx-auto px-6 mt-32 border-t border-gray-100 pt-20">
        <h2 className="font-bodoni text-3xl mb-12">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Review List */}
          <div className="space-y-8">
            {product.reviews.length > 0 ? product.reviews.map((review) => (
              <div key={review._id} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-sm">{review.user}</span>
                  <div className="flex text-gold-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
                <span className="text-[10px] text-gray-400 mt-2 block">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            )) : (
              <p className="text-gray-400 italic">No reviews yet. Be the first to review!</p>
            )}
          </div>

          {/* Add Review Form (Placeholder for now) */}
          <div className="bg-white border border-gray-200 p-8 rounded-2xl">
            <h3 className="font-tenor text-sm uppercase tracking-widest mb-6">Write a Review</h3>
            <p className="text-xs text-gray-400 mb-4">Please log in to write a review.</p>
            <button disabled className="w-full py-3 border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest cursor-not-allowed">
              Submit Review
            </button>
          </div>
        </div>
      </div>

      {/* --- RELATED PRODUCTS --- */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-6 mt-32">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-bodoni text-3xl">You May Also Like</h2>
            <Link href={`/collections/${product.category?.slug}`} className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-gold-600">
              View Collection <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <Link key={item._id} href={`/product/${item.slug}`} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative mb-4">
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Quick Add Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest block text-center">View Details</span>
                  </div>
                </div>
                <h3 className="font-tenor text-sm tracking-wide text-gray-900 group-hover:text-gold-600 transition-colors">{item.name}</h3>
                <p className="font-bold text-sm text-gray-500 mt-1">${item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
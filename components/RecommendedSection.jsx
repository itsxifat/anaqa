'use client';

import { useEffect, useState, useRef } from 'react';
import { getRecommendedProducts } from '@/app/analytics-actions';
import ProductCard from '@/components/ProductCard'; 

// Internal Skeleton Component
function RecommendedSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-full">
          <div className="bg-gray-200 aspect-[3/4] mb-4 w-full rounded-md"></div>
          <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
          <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export default function RecommendedSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null); // Ref for the moving track
  
  // 1. Fetch Data
  useEffect(() => {
    async function fetchInfo() {
      try {
        if (typeof getRecommendedProducts === 'function') {
           const data = await getRecommendedProducts();
           setProducts(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  // 2. GPU-Accelerated Mobile Auto-Scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.innerWidth >= 1024 || loading || products.length === 0) return;

    let frameId;
    let pos = 0;
    const speed = 0.5; // Adjust speed here

    const animate = () => {
      pos += speed;
      
      // Calculate single set width (half the total track because we duplicated items)
      // We assume the track contains [...products, ...products]
      const singleSetWidth = track.scrollWidth / 2;

      // Reset smoothly without user noticing
      if (pos >= singleSetWidth) {
         pos = 0;
      }

      // KEY FIX: translate3d forces GPU acceleration
      track.style.transform = `translate3d(-${pos}px, 0, 0)`;
      
      frameId = requestAnimationFrame(animate);
    };

    // Start animation
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [products, loading]);

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-white font-manrope border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
           <div className="text-center mb-16">
            <span className="bg-gray-200 text-transparent text-xs rounded">LOADING</span>
            <h2 className="text-gray-200 bg-gray-200 text-4xl md:text-5xl mt-4 inline-block rounded">Loading Items</h2>
           </div>
           <RecommendedSkeleton />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-32 bg-white font-manrope overflow-hidden border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] font-bold uppercase tracking-[0.3em] text-xs">Selected For You</span>
          <h2 className="font-bodoni text-4xl md:text-5xl text-black mt-4">You Might Also Like</h2>
        </div>

        {/* --- DESKTOP GRID (5 Columns) --- */}
        <div className="hidden lg:grid grid-cols-5 gap-x-6 gap-y-12">
          {products.map((product) => (
             <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* --- MOBILE INFINITE SCROLL (GPU OPTIMIZED) --- */}
        <div className="lg:hidden w-full overflow-hidden">
           {/* 1. overflow-hidden: Hides the parts that slide out.
              2. flex: aligns items in a row.
              3. will-change-transform: Tells browser to put this on its own GPU layer.
           */}
           <div 
             ref={trackRef} 
             className="flex gap-4 will-change-transform"
             style={{ width: 'max-content' }} // Ensure track is wide enough for all items
           >
             {/* Duplicate array for seamless looping */}
             {[...products, ...products].map((product, i) => (
               <div key={`${product._id}-${i}`} className="min-w-[160px] w-[45vw] flex-shrink-0">
                  <ProductCard product={product} />
               </div>
             ))}
           </div>
        </div>

      </div>
    </section>
  );
}
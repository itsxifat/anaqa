'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart, Filter, ChevronDown, LayoutGrid, List, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductListing({ initialProducts }) {
  const [products] = useState(initialProducts || []);
  const containerRef = useRef(null);

  // --- OPTIMIZED GSAP ANIMATIONS ---
  useEffect(() => {
    if (products.length > 0) {
      const ctx = gsap.context(() => {
        
        // 1. PERFORMANCE: Set initial states immediately 
        // This prevents the browser from calculating styles mid-animation
        gsap.set(".anim-text", { y: 40, opacity: 0 });
        gsap.set(".product-card", { y: 50, opacity: 0 });

        // 2. Hero Text Reveal (Lightweight)
        gsap.to(".anim-text", {
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: 'power2.out',
          delay: 0.1 // Small delay to allow hydration to settle
        });

        // 3. Product Cards (Optimized Batching)
        ScrollTrigger.batch(".product-card", {
          // Increase interval slightly to reduce CPU load during fast scrolling
          interval: 0.1, 
          // Start animating when the top of the card hits 95% of viewport
          start: "top 95%",
          // Only run once, prevents recalculations on scroll up
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.6, // Shorter duration = smoother frame rate
              stagger: 0.05, // Tighter stagger for snappier feel
              ease: 'power2.out', // 'power2' is cheaper to calculate than 'back' or 'elastic'
              overwrite: 'auto'
            });
          }
        });
        
      }, containerRef);

      // Cleanup immediately on unmount
      return () => ctx.revert();
    }
  }, [products]);

  return (
    <main ref={containerRef} className="text-gray-900 font-manrope pb-32">
      
      {/* --- HERO HEADER --- */}
      <div className="pt-32 md:pt-40 pb-16 px-6 md:px-12 text-center">
        <div className="overflow-hidden mb-4">
            <span className="anim-text inline-block font-tenor text-[10px] md:text-xs uppercase tracking-[0.4em] text-gray-500 border-b border-gray-300 pb-1 will-change-transform">
              Est. 2025
            </span>
        </div>
        <div className="overflow-hidden mb-6">
            <h1 className="anim-text font-bodoni text-5xl md:text-7xl lg:text-8xl text-black leading-none will-change-transform">
              All Products
            </h1>
        </div>
        <div className="overflow-hidden">
            <p className="anim-text max-w-md mx-auto text-sm text-gray-500 leading-relaxed font-medium will-change-transform">
              Explore our curated selection of premium essentials, designed for the modern lifestyle.
            </p>
        </div>
      </div>

      {/* --- STICKY FILTER BAR --- */}
      <div className="sticky top-[0px] md:top-[110px] z-40 bg-[#faf9f6]/95 backdrop-blur-md border-y border-gray-200 transition-all duration-300">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-[#D4AF37] transition group">
              <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500"/> Filter
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-medium hidden md:inline-block">
              {products.length} Items Found
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-[#D4AF37] transition group">
              Sort By <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform"/>
            </button>
            <div className="hidden md:flex gap-3 text-gray-400 border-l border-gray-200 pl-6">
              <LayoutGrid size={18} className="text-black cursor-pointer" />
              <List size={18} className="cursor-pointer hover:text-black transition" />
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-12 pt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-8 md:gap-y-16">
        {products.length > 0 ? (
          products.map((product) => (
            <div 
              key={product._id} 
              // PERFORMANCE: 'will-change-transform' tells the GPU to prepare ahead of time
              className="product-card group cursor-pointer opacity-0 will-change-transform"
            >
              <Link href={`/product/${product.slug}`} className="block">
                
                {/* Image Area */}
                <div className="relative overflow-hidden aspect-[3/4] bg-gray-100 mb-4 md:mb-6">
                  {/* Using standard img for smoother performance than next/image in massive grids with animations */}
                  <img 
                    src={product.images[0] || '/placeholder.jpg'} 
                    alt={product.name} 
                    loading="lazy" // Native lazy loading helps main thread
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                  />
                  
                  {/* Dark Overlay (Desktop Hover) */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-0 left-0 p-2 md:p-3 w-full flex justify-between items-start">
                    {product.discountPrice ? (
                      <span className="bg-white/90 backdrop-blur text-black text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
                        Sale
                      </span>
                    ) : <div></div>}
                    
                    {product.stock === 0 && (
                      <span className="bg-black/90 backdrop-blur text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Quick Actions (Desktop Only) */}
                  <div className="hidden md:flex absolute bottom-4 right-4 flex-col gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:bg-black hover:text-white transition-colors">
                      <Eye size={18} strokeWidth={1.5} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:bg-black hover:text-white transition-colors">
                      <Heart size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Info Area */}
                <div className="text-left md:text-center group-hover:-translate-y-1 transition-transform duration-500">
                  <div className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-1 truncate">
                    {product.category?.name || 'Collection'}
                  </div>
                  <h3 className="font-playfair text-sm md:text-lg text-gray-900 mb-1 md:mb-2 group-hover:text-[#D4AF37] transition-colors truncate">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center md:justify-center gap-2 md:gap-3 text-xs md:text-sm font-medium font-manrope">
                    {product.discountPrice ? (
                      <>
                        <span className="text-gray-400 line-through decoration-gray-300">৳{product.price?.toLocaleString()}</span>
                        <span className="text-red-600 font-bold">৳{product.discountPrice?.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-gray-900">৳{product.price?.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Mobile Quick Add */}
                  <div className="md:hidden mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                     Shop Now <ArrowRight size={10} />
                  </div>
                </div>

              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4 text-gray-400">
              <ShoppingBag size={32} strokeWidth={1} />
            </div>
            <h3 className="font-bodoni text-2xl text-gray-900 mb-2">No Products Found</h3>
            <p className="text-sm text-gray-500">Check back later for new arrivals.</p>
          </div>
        )}
      </div>
    </main>
  );
}
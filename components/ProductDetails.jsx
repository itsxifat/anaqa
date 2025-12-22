'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Minus, Plus, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext'; 
import gsap from 'gsap';

export default function ProductDetails({ product, relatedProducts }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const zoomContainerRef = useRef(null);
  
  // State
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // --- 1. CINEMATIC ENTRANCE ANIMATION ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Image Curtain Reveal (Luxury Effect)
      gsap.fromTo(".anim-mask", 
        { scaleY: 1.1, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        { scaleY: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1.4, ease: "power4.out" }
      );

      // Content Stagger
      gsap.fromTo(".anim-content",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power2.out", delay: 0.4 }
      );

    }, containerRef);
    return () => ctx.revert();
  }, []);

  // --- 2. MAGNIFYING GLASS ZOOM EFFECT ---
  const handleMouseMove = (e) => {
    if (!zoomContainerRef.current) return;
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    
    // Calculate cursor position as percentage
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Apply zoom
    if (imageRef.current) {
        imageRef.current.style.transformOrigin = `${x}% ${y}%`;
        imageRef.current.style.transform = "scale(1.6)"; // 1.6x Zoom
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
        imageRef.current.style.transform = "scale(1)";
        setTimeout(() => {
            // Reset origin smoothly after scaling down
            if(imageRef.current) imageRef.current.style.transformOrigin = "center center"; 
        }, 300);
    }
  };

  // --- ACTIONS ---
  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, quantity, selectedSize);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    router.push('/cart');
  };

  if (!product) return null;

  return (
    <main ref={containerRef} className="pt-6 pb-24 font-manrope bg-[#faf9f6]">
      
      {/* --- BREADCRUMBS --- */}
      <div className="max-w-[1200px] mx-auto px-6 mb-8 anim-content opacity-0">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/products" className="hover:text-black transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-[#D4AF37] border-b border-[#D4AF37] pb-0.5">{product.name}</span>
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-20 mb-20 items-start">
        
        {/* LEFT: GALLERY (Interactive) */}
        <div className="md:col-span-5 lg:col-span-5 space-y-6 md:sticky md:top-24">
          
          {/* Main Image Container */}
          <div 
            ref={zoomContainerRef}
            className="anim-mask relative aspect-[3/4] bg-gray-100 w-full overflow-hidden cursor-zoom-in shadow-sm select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              ref={imageRef}
              src={product.images?.[activeImage] || '/placeholder.jpg'} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 ease-out will-change-transform"
            />
            {product.discountPrice && (
               <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1.5 shadow-md z-10">
                 Sale
               </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="anim-content opacity-0 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 aspect-[3/4] shrink-0 overflow-hidden transition-all duration-300 ${
                    activeImage === idx 
                      ? 'opacity-100 ring-1 ring-[#D4AF37] ring-offset-2' // Gold Ring Active
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* RIGHT: DETAILS & ACTIONS */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col h-full pt-2">
            
            {/* 1. Header Info */}
            <div className="anim-content opacity-0 mb-8 border-b border-gray-100 pb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3 block">
                {product.category?.name || 'Collection'}
              </span>
              <h1 className="font-bodoni text-4xl lg:text-5xl text-black leading-none tracking-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-4">
                  {product.discountPrice ? (
                    <>
                      <span className="text-2xl font-medium font-bodoni text-black">BDT {product.discountPrice.toLocaleString()}</span>
                      <span className="text-base text-gray-400 line-through font-manrope">BDT {product.price?.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-medium font-bodoni text-black">BDT {product.price?.toLocaleString()}</span>
                  )}
                </div>
                
                {product.reviews && product.reviews.length > 0 && (
                  <div className="flex items-center gap-1.5">
                     <Star size={12} fill="#D4AF37" className="text-[#D4AF37]"/> {/* Gold Star */}
                     <span className="text-xs font-bold mt-0.5 text-black">
                       {(product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length).toFixed(1)}
                     </span>
                     <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-1 border-b border-gray-200">
                       ({product.reviews.length} Reviews)
                     </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Selectors */}
            <div className="anim-content opacity-0 space-y-8 mb-10">
              {/* Size */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">Select Size</span>
                    <button className="text-[10px] text-gray-400 border-b border-transparent hover:border-gray-400 transition-all">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 min-w-[3.5rem] px-3 flex items-center justify-center border text-xs font-medium transition-all duration-300 ${
                          selectedSize === size 
                            ? 'bg-black text-white border-black shadow-md' 
                            : 'bg-transparent text-gray-600 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]' // Gold Hover
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black block mb-3">Quantity</span>
                <div className="flex items-center w-32 border border-gray-200 h-10 bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-black transition active:scale-90"
                  >
                    <Minus size={12}/>
                  </button>
                  <span className="flex-1 text-center text-sm font-medium text-black">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-black transition active:scale-90"
                  >
                    <Plus size={12}/>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. PREMIUM BUTTONS (Animated) */}
            <div className="anim-content opacity-0 flex flex-col gap-4 mb-10">
              {/* Buy Now: Solid Black -> Gold Hover */}
              <button 
                onClick={handleBuyNow}
                className="group relative w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] overflow-hidden transition-all shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-[#D4AF37] transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
                <span className="relative z-10">Buy Now</span>
              </button>
              
              {/* Add to Cart: Outline -> Black Fill */}
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="group relative w-full h-14 bg-transparent border border-black text-black text-[11px] font-bold uppercase tracking-[0.2em] overflow-hidden transition-all disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  {isAdding ? 'Added to Bag' : 'Add to Cart'}
                </span>
              </button>
            </div>

            {/* 4. Description (Formatted) */}
            <div className="anim-content opacity-0 border-t border-gray-200 pt-8">
               <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black mb-4">Description</h3>
               {/* whitespace-pre-line preserves database line breaks */}
               <p className="text-sm text-gray-600 leading-7 font-manrope whitespace-pre-line">
                 {product.description || "Expertly crafted with attention to detail, ensuring a perfect fit and lasting durability. A staple for any sophisticated collection."}
               </p>
            </div>

        </div>
      </div>

      {/* --- RELATED ITEMS (Minimal) --- */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 mt-32 border-t border-gray-200 pt-16 anim-content">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-bodoni text-2xl text-black">You May Also Like</h2>
            <Link href={`/collections/${product.category?.slug}`} className="text-[10px] font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors border-b border-black pb-0.5 hover:border-[#D4AF37]">
              View Collection
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {relatedProducts.map((item) => (
              <Link key={item._id} href={`/product/${item.slug}`} className="group cursor-pointer block">
                <div className="aspect-[3/4] bg-white overflow-hidden relative mb-3">
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                </div>
                <div>
                  <h3 className="font-manrope text-sm text-gray-900 mb-1 leading-tight group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>
                  <p className="font-manrope font-bold text-xs text-black">BDT {item.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
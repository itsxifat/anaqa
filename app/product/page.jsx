'use client'; // Client component for animations

import { useState, useEffect } from 'react';
import { getAllProducts } from '@/app/actions';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // --- ANIMATION VARIANTS ---
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bodoni text-2xl animate-pulse">ANAQA</div>;

  return (
    <main className="min-h-screen bg-white pt-40 pb-32 font-manrope">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-[1800px] mx-auto px-6 md:px-12 mb-24 text-center"
      >
        <span className="font-tenor text-xs uppercase tracking-[0.4em] text-gray-400 mb-6 block">Fall / Winter 2025</span>
        <h1 className="font-bodoni text-6xl md:text-8xl text-black leading-tight">The Collection</h1>
      </motion.div>

      {/* Product Grid */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20"
      >
        {products.length > 0 ? (
          products.map((product) => (
            <motion.div variants={itemVars} key={product._id} className="group cursor-pointer">
              <Link href={`/product/${product.slug}`} className="block">
                
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-[3/4.2] bg-[#f0f0f0] mb-6">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                  {/* Badges */}
                  {product.discountPrice && (
                    <span className="absolute top-4 left-4 bg-white text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-sm">
                      Sale
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-4 right-4 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-sm">
                      Sold Out
                    </span>
                  )}

                  {/* Hover Action */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <button className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 shadow-xl">
                      View Details <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col items-center gap-1">
                  <h3 className="font-tenor text-sm text-gray-900 uppercase tracking-widest group-hover:text-gold-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-medium font-manrope">
                    {product.discountPrice ? (
                      <>
                        <span className="text-gray-400 line-through">৳ {product.price}</span>
                        <span className="text-red-600">৳ {product.discountPrice}</span>
                      </>
                    ) : (
                      <span className="text-gray-900">৳ {product.price}</span>
                    )}
                  </div>
                </div>

              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-32">
            <p className="font-bodoni text-2xl text-gray-300">No products found.</p>
          </div>
        )}
      </motion.div>
    </main>
  );
}
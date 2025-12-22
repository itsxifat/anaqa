'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

export default function CategoryGridAnimated({ categories }) {
  const ref = useRef(null);
  
  // Triggers when the top of the grid hits 80% of the viewport height
  // "once: true" ensures it doesn't replay when scrolling back up (distracting)
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Staggered Entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Faster stagger for responsiveness
      },
    },
  };

  // Smooth "Float Up" Animation
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] // Custom "Soft Cubic" Bezier curve
      } 
    },
  };

  return (
    <motion.div 
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5"
    >
      {categories.map((cat) => (
        <motion.div key={cat._id} variants={cardVariants}>
          <Link
            href={`/category/${cat.slug}`}
            className="group block relative w-full aspect-[3/4] overflow-hidden bg-gray-100"
          >
            {/* Image Layer - Clean Hover Zoom */}
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
                 <span className="font-bodoni text-xl italic">Anaqa</span>
              </div>
            )}

            {/* Gradient Overlay - Improves Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

            {/* Content Layer - Always Visible (Better UX) */}
            <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end">
                
                {/* Decorative Line (Expands on Hover) */}
                <div className="h-[1px] bg-white/40 w-8 group-hover:w-full transition-all duration-500 ease-out mb-3"></div>

                {/* Category Name */}
                <h3 className="font-bodoni text-lg md:text-xl lg:text-2xl text-white tracking-wide">
                    {cat.name}
                </h3>
                
                {/* 'Shop Now' Text - Subtle reveal on desktop, visible on mobile */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transform">
                    Shop Collection
                </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
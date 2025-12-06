"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from 'next/link';

const Hero = ({ heroData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // We need to track direction to animate entrances correctly (left vs right)
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // --- AUTO PLAY LOGIC ---
  useEffect(() => {
    // Don't play if hovered or no data
    if (!heroData?.length || isHovered) return;

    const timer = setInterval(() => {
      // Always slide 'next' (direction 1)
      paginate(1);
    }, 3000); // INTERVAL CHANGED TO 3 SECONDS

    return () => clearInterval(timer);
  }, [heroData, isHovered]); // Removed currentIndex dependence to avoid effect re-triggering

  if (!heroData?.length) return null;
  const slide = heroData[currentIndex];
  const btn = slide.buttonLayer;

  // --- PAGINATION HANDLER ---
  // Use useCallback to ensure stable identity for dependencies
  const paginate = useCallback((newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      // Infinite Loop Logic
      if (nextIndex < 0) nextIndex = heroData.length - 1;
      if (nextIndex >= heroData.length) nextIndex = 0;
      return nextIndex;
    });
  }, [heroData.length]);

  // --- SLIDING VARIANTS (SMOOTH RIGHT TO LEFT) ---
  const slideVariants = {
    enter: (direction) => ({
      // If going 'next' (dir 1), enter from Right (100%). If 'prev', enter from Left (-100%)
      x: direction > 0 ? '100%' : '-100%', 
      zIndex: 1,
      transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] } // Smooth cinematic ease
    }),
    center: {
      zIndex: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
    },
    exit: (direction) => ({
      zIndex: 0,
      // If going 'next' (dir 1), exit to Left (-100%). If 'prev', exit to Right (100%)
      x: direction < 0 ? '100%' : '-100%',
      transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
    })
  };

  return (
    <section 
      // HEIGHT CHANGED: Fixed 700px on Desktop, responsive on mobile
      className="relative w-full overflow-hidden bg-gray-900 text-white h-[calc(100vh-80px)] md:h-[495px] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Removed mode="wait" so slides overlap during transition for smoothness */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          {/* Link Wrapper */}
          <Link href={slide.link || '#'} className="block w-full h-full cursor-pointer relative">
            
            {/* Desktop Image */}
            <img 
              src={slide.imageDesktop} 
              alt="Hero Desktop" 
              className={`absolute inset-0 w-full h-full object-cover ${slide.imageMobile ? 'hidden md:block' : 'block'}`} 
            />
            
            {/* Mobile Image */}
            {slide.imageMobile && (
              <img 
                src={slide.imageMobile} 
                alt="Hero Mobile" 
                className="absolute inset-0 w-full h-full object-cover md:hidden" 
              />
            )}

            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" 
              style={{ opacity: (slide.overlayOpacity || 20) / 100 }} 
            />
          </Link>

          {/* --- FLOATING BUTTON --- */}
          {slide.showButton && btn && (
            <motion.div
              // Simple fade in for button so it doesn't slide with image
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{
                position: 'absolute',
                left: `${btn.x}%`,
                top: `${btn.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
              }}
            >
              <Link href={btn.link || '/'}>
                <button
                  className={`
                    relative px-10 py-4 overflow-hidden group/btn
                    ${btn.fontSize} ${btn.fontFamily} ${btn.fontWeight}
                    ${btn.isUppercase ? 'uppercase' : ''} ${btn.letterSpacing}
                    ${btn.hasShadow ? 'shadow-xl' : 'shadow-md'}
                    transition-all duration-300 hover:-translate-y-1
                  `}
                  style={{ 
                    backgroundColor: btn.bgColor, color: btn.color, borderRadius: `${btn.borderRadius}px`,
                    padding: `${btn.paddingY}px ${btn.paddingX}px`, border: btn.bgColor === 'transparent' ? `1px solid ${btn.color}` : 'none'
                  }}
                >
                  <span className="relative z-10">{btn.text}</span>
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* --- NAVIGATION ARROWS --- */}
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none z-30">
        {/* Prev Button */}
        <button 
          onClick={(e) => { e.preventDefault(); paginate(-1); }} 
          className="pointer-events-auto p-3 rounded-full bg-black/20 text-white/70 hover:bg-black/50 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
        >
          <ChevronLeft size={24} />
        </button>
        
        {/* Next Button */}
        <button 
          onClick={(e) => { e.preventDefault(); paginate(1); }} 
          className="pointer-events-auto p-3 rounded-full bg-black/20 text-white/70 hover:bg-black/50 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* --- CIRCLE DOT INDICATORS --- */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
        {heroData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
                // Determine direction for smooth jump
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
            }}
            className="group p-2" // hit area
          >
            {/* Small Circle Dot */}
            <div 
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300 
                ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}
              `} 
            />
          </button>
        ))}
      </div>

    </section>
  );
};

export default Hero;
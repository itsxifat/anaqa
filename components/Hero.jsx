"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from 'next/link';

const Hero = ({ heroData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // --- AUTO PLAY LOGIC ---
  useEffect(() => {
    if (!heroData?.length || isHovered) return;
    const timer = setInterval(() => { paginate(1); }, 3000);
    return () => clearInterval(timer);
  }, [heroData, isHovered]);

  // --- SAFE GUARD: Return null if no data or invalid index ---
  if (!heroData || heroData.length === 0) return null;
  
  const slide = heroData[currentIndex];
  // Prevent crash if index is somehow out of bounds
  if (!slide) return null; 

  const btn = slide.buttonLayer;

  const paginate = useCallback((newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = heroData.length - 1;
      if (nextIndex >= heroData.length) nextIndex = 0;
      return nextIndex;
    });
  }, [heroData.length]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%', 
      zIndex: 1,
      transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
    }),
    center: {
      zIndex: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
    })
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-gray-900 text-white h-[calc(100vh-80px)] md:h-[495px] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          <Link href={slide.link || '#'} className="block w-full h-full cursor-pointer relative">
            
            {/* Desktop Image: Checks for 'image' OR 'imageDesktop' to be safe */}
            <img 
              src={slide.image || slide.imageDesktop || '/placeholder.jpg'} 
              alt="Hero Desktop" 
              className={`absolute inset-0 w-full h-full object-cover ${slide.imageMobile || slide.mobileImage ? 'hidden md:block' : 'block'}`} 
            />
            
            {/* Mobile Image: Checks for 'mobileImage' OR 'imageMobile' */}
            {(slide.imageMobile || slide.mobileImage) && (
              <img 
                src={slide.imageMobile || slide.mobileImage} 
                alt="Hero Mobile" 
                className="absolute inset-0 w-full h-full object-cover md:hidden" 
              />
            )}

            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" 
              style={{ opacity: (slide.overlayOpacity || 20) / 100 }} 
            />
          </Link>

          {/* ... (Button Logic remains the same) ... */}
          {slide.showButton && btn && (
            <motion.div
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

      {/* ... (Arrows and Dots remain the same) ... */}
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none z-30">
        <button 
          onClick={(e) => { e.preventDefault(); paginate(-1); }} 
          className="pointer-events-auto p-3 rounded-full bg-black/20 text-white/70 hover:bg-black/50 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); paginate(1); }} 
          className="pointer-events-auto p-3 rounded-full bg-black/20 text-white/70 hover:bg-black/50 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
        {heroData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
            }}
            className="group p-2"
          >
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
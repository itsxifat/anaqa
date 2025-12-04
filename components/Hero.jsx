"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from 'next/link';

const Hero = ({ heroData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!heroData?.length) return;
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % heroData.length), 6000);
    return () => clearInterval(timer);
  }, [heroData]);

  if (!heroData?.length) return null;
  const slide = heroData[currentIndex];
  const btn = slide.buttonLayer;

  const paginate = (direction) => {
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = heroData.length - 1;
    if (newIndex >= heroData.length) newIndex = 0;
    setCurrentIndex(newIndex);
  };

  return (
    <section className="relative w-full overflow-hidden bg-black text-white h-[calc(100vh-80px)]">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Images */}
          <div className="relative w-full h-full">
            {/* Desktop Image (Hidden on Mobile if Mobile Image exists) */}
            <img 
              src={slide.imageDesktop} 
              alt="Hero Desktop" 
              className={`absolute inset-0 w-full h-full object-cover ${slide.imageMobile ? 'hidden md:block' : 'block'}`} 
            />
            
            {/* Mobile Image (Visible only on Mobile) */}
            {slide.imageMobile && (
              <img 
                src={slide.imageMobile} 
                alt="Hero Mobile" 
                className="absolute inset-0 w-full h-full object-cover md:hidden" 
              />
            )}

            <div className="absolute inset-0 bg-black transition-all duration-700" style={{ opacity: (slide.overlayOpacity || 10) / 100 }} />
          </div>

          {/* Button */}
          {slide.showButton && btn && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{
                position: 'absolute',
                left: `${btn.x}%`,
                top: `${btn.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
              }}
            >
              <Link href={btn.link || '/'}>
                <button
                  className={`
                    transition-all duration-300 hover:scale-105 whitespace-nowrap
                    ${btn.fontSize} ${btn.fontFamily} ${btn.fontWeight}
                    ${btn.isUppercase ? 'uppercase' : ''} ${btn.letterSpacing}
                    ${btn.hasShadow ? 'shadow-xl' : 'shadow-lg'}
                  `}
                  style={{ 
                    backgroundColor: btn.bgColor, 
                    color: btn.color, 
                    borderRadius: `${btn.borderRadius}px`,
                    padding: `${btn.paddingY}px ${btn.paddingX}px`,
                    border: btn.bgColor === 'transparent' ? `1px solid ${btn.color}` : 'none'
                  }}
                >
                  {btn.text}
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-10 pointer-events-none z-50">
        <button onClick={() => paginate(-1)} className="pointer-events-auto p-3 rounded-full hover:bg-white/10 transition"><ChevronLeft size={32} /></button>
        <button onClick={() => paginate(1)} className="pointer-events-auto p-3 rounded-full hover:bg-white/10 transition"><ChevronRight size={32} /></button>
      </div>
    </section>
  );
};

export default Hero;
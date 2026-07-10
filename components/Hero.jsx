"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import SmartImage from './SmartImage';

// ==========================================
// CONFIGURATION
// ==========================================
const AUTOPLAY_DELAY = 6000;

// ==========================================
// SUB-COMPONENT: MAGNETIC BUTTON
// ==========================================
const MagneticButton = ({ children, link, style }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      <Link href={link || '/'}>
        <button
          className="relative group overflow-hidden px-10 py-4 md:px-12 md:py-5 uppercase tracking-[0.25em] text-[11px] md:text-xs font-bold font-montserrat transition-all duration-500 border border-white/40 hover:border-[#D4AF37]"
          style={{ ...style }}
        >
          {/* Liquid Gold Fill Effect */}
          <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]" />
          
          <span className="relative z-10 flex items-center gap-4 group-hover:text-black transition-colors duration-500 shadow-sm">
            {children}
            <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
          </span>
        </button>
      </Link>
    </motion.div>
  );
};

// ==========================================
// MAIN HERO COMPONENT
// ==========================================
const Hero = ({ heroData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);

  // --- AUTOPLAY ENGINE ---
  useEffect(() => {
    if (!heroData?.length) return;
    const timer = setInterval(() => paginate(1), AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [currentIndex, heroData]);

  if (!heroData || heroData.length === 0) return null;

  const slide = heroData[currentIndex];
  const totalSlides = heroData.length;

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = totalSlides - 1;
      if (next >= totalSlides) next = 0;
      return next;
    });
  };

  // --- TRANSITIONS (Clean, No Filters) ---
  const slideVariants = {
    initial: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      scale: 1.2,
      opacity: 1, // Full opacity
    }),
    animate: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        scale: { duration: 10, ease: "linear" }, // Slow, imperceptible zoom
      }
    },
    exit: (dir) => ({
      x: dir < 0 ? '100%' : '-100%',
      scale: 1.1,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    })
  };

  const textStaggerVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: (customDelay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        delay: 0.3 + customDelay,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: {
      opacity: 0,
      y: -30,
      transition: { duration: 0.4 }
    }
  };

  return (
    // FULL WIDTH CONTAINER
    <section ref={containerRef} className="relative w-full h-[85vh] md:h-[95vh] min-h-[600px] bg-black overflow-hidden group select-none">
      
      {/* 1. CAROUSEL LAYER (Images Only) */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full z-0"
        >
           {/* Image Render - NO FILTERS, NO OVERLAYS */}
           <div className="relative w-full h-full">
              <SmartImage
                src={slide.imageDesktop || slide.image || '/placeholder.jpg'}
                alt="Hero"
                priority
                sizes="100vw"
                className={`object-cover ${slide.imageMobile || slide.mobileImage ? 'hidden md:block' : 'block'}`}
              />

              {(slide.imageMobile || slide.mobileImage) && (
                <SmartImage
                  src={slide.imageMobile || slide.mobileImage}
                  alt="Hero Mobile"
                  priority
                  sizes="100vw"
                  className="object-cover md:hidden"
                />
              )}
           </div>
        </motion.div>
      </AnimatePresence>


      {/* 2. CONTENT LAYER */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-20 lg:px-32 pointer-events-none">
        <AnimatePresence mode="wait">
           {slide.buttonLayer && (
             <div key={currentIndex} className="max-w-[800px]">
                
                {/* A. Decorative Label */}
                <motion.div 
                   variants={textStaggerVariants} 
                   custom={0} 
                   initial="hidden" 
                   animate="visible" 
                   exit="exit"
                   className="flex items-center gap-4 mb-6 overflow-hidden"
                >
                   <div className="w-12 h-[2px] bg-[#D4AF37]" />
                   <span className="font-montserrat text-white text-xs font-bold uppercase tracking-[0.3em] drop-shadow-md">
                      New Collection
                   </span>
                </motion.div>

                {/* B. Main Title */}
                <motion.h1 
                   variants={textStaggerVariants} 
                   custom={0.1} 
                   initial="hidden" 
                   animate="visible" 
                   exit="exit"
                   className="font-playfair text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-10 italic drop-shadow-lg"
                >
                   {/* If no title in data, use consistent branding */}
                   {slide.title || (
                     <>
                      <span className="block">Eternal</span>
                      <span className="block text-[#D4AF37] not-italic">Elegance.</span>
                     </>
                   )}
                </motion.h1>

                {/* C. CTA Button */}
                <motion.div 
                   variants={textStaggerVariants} 
                   custom={0.2} 
                   initial="hidden" 
                   animate="visible" 
                   exit="exit"
                   className="pointer-events-auto"
                >
                   <MagneticButton 
                      link={slide.buttonLayer.link} 
                      style={{ 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.5)'
                      }}
                   >
                      {slide.buttonLayer.text || "Explore Now"}
                   </MagneticButton>
                </motion.div>

             </div>
           )}
        </AnimatePresence>
      </div>


      {/* 3. PREMIUM NAVIGATION (Bottom Right) */}
      <div className="absolute bottom-0 right-0 z-30 p-8 md:p-16 flex items-center gap-4">
          <button 
             onClick={() => paginate(-1)}
             className="group w-14 h-14 md:w-16 md:h-16 border border-white/30 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 backdrop-blur-[2px]"
          >
             <ArrowLeft size={20} className="text-white group-hover:text-black transition-colors duration-300" />
          </button>
          
          <button 
             onClick={() => paginate(1)}
             className="group w-14 h-14 md:w-16 md:h-16 border border-white/30 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-500 backdrop-blur-[2px]"
          >
             <ArrowRight size={20} className="text-white group-hover:text-black transition-colors duration-300" />
          </button>
      </div>

    </section>
  );
};

export default Hero;
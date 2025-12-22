"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Pause, Play } from "lucide-react"; 
import Link from 'next/link';

const Hero = ({ heroData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const slideDuration = 6000; // 6 Seconds per slide

  // --- AUTO PLAY LOGIC WITH PAUSE ---
  useEffect(() => {
    if (!heroData?.length || !isPlaying || isHovered) return;
    
    const timer = setInterval(() => {
      paginate(1);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, isHovered, heroData]);

  if (!heroData || heroData.length === 0) return null;
  const slide = heroData[currentIndex];
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

  // --- ANIMATION VARIANTS (Cinematic) ---
  const imageVariants = {
    initial: (direction) => ({
      scale: 1.2,
      x: direction > 0 ? '100%' : '-100%', // Parallax enter
      opacity: 0.8,
    }),
    animate: {
      scale: 1, // Ken Burns Zoom Out effect
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        scale: { duration: 8, ease: "linear" }, // Continuous slow zoom
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      scale: 1.1,
      x: direction < 0 ? '100%' : '-100%', // Parallax exit
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut" }
    })
  };

  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], // Ultra-smooth bezier
        delay: 0.3 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  return (
    // PADDING WRAPPER: Creates the "floating" frame effect
    <div className="w-full bg-[#faf9f6] pt-4 pb-8 px-4 md:px-6 lg:px-10">
      
      {/* PREMIUM CONTAINER 
        Height is explicitly shrunk to 50vh (desktop) and 45vh (mobile)
        to ensure "Above the Fold" visibility of the next section.
      */}
      <div 
        className="relative w-full max-w-[2000px] mx-auto h-[45vh] min-h-[400px] md:h-[55vh] md:min-h-[500px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl bg-black group isolate"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* --- CAROUSEL TRACK --- */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={imageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <Link href={slide.link || '#'} className="block w-full h-full cursor-pointer relative">
              
              {/* IMAGE */}
              <div className="absolute inset-0 bg-gray-900">
                <img 
                  src={slide.imageDesktop || slide.image || '/placeholder.jpg'} 
                  alt="Hero" 
                  className={`absolute inset-0 w-full h-full object-cover ${slide.imageMobile || slide.mobileImage ? 'hidden md:block' : 'block'}`} 
                />
                
                {(slide.imageMobile || slide.mobileImage) && (
                  <img 
                    src={slide.imageMobile || slide.mobileImage} 
                    alt="Hero Mobile" 
                    className="absolute inset-0 w-full h-full object-cover md:hidden" 
                  />
                )}
              </div>

              {/* OVERLAY: High-end fashion gradient (Dark at bottom/left for text readability) */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/10 pointer-events-none" 
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" 
              />
            </Link>

            {/* --- FLOATING TEXT & BUTTON LAYER --- */}
            {slide.showButton && btn && (
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute z-20 pointer-events-none" // Text shouldn't block clicks unless it's the button
                style={{
                  left: `${btn.x}%`,
                  top: `${btn.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  maxWidth: '600px',
                  textAlign: btn.x > 50 ? 'right' : btn.x < 50 ? 'left' : 'center',
                  padding: '0 2rem'
                }}
              >
                {/* Optional Title Layer if you add title to your data later */}
                {/* <h2 className="font-bodoni text-4xl md:text-6xl text-white mb-6 leading-tight drop-shadow-lg">
                  {slide.title || "The New Collection"}
                </h2> */}

                <div className="pointer-events-auto inline-block">
                  <Link href={btn.link || '/'}>
                    <button
                      className={`
                        relative group/btn overflow-hidden backdrop-blur-md transition-all duration-500
                        ${btn.fontSize || 'text-sm'} ${btn.fontFamily || 'font-sans'} ${btn.fontWeight || 'font-medium'}
                        ${btn.isUppercase ? 'uppercase' : ''} ${btn.letterSpacing || 'tracking-[0.2em]'}
                        px-8 py-4 md:px-10 md:py-5
                      `}
                      style={{ 
                        backgroundColor: btn.bgColor, 
                        color: btn.color, 
                        borderRadius: '9999px',
                        border: btn.bgColor === 'transparent' ? `1px solid ${btn.color}` : 'none',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)'
                      }}
                    >
                      {/* Button Hover Fill Effect */}
                      <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"/>
                      
                      <span className="relative z-10 flex items-center gap-3">
                        {btn.text}
                        <ArrowRight size={16} className="transition-transform duration-500 group-hover/btn:translate-x-2" />
                      </span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* --- UI CONTROLS LAYER --- */}
        <div className="absolute inset-0 pointer-events-none p-6 md:p-10 flex flex-col justify-between z-30">
          
          {/* Top Row: Play/Pause (Optional for pro feel) */}
          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="pointer-events-auto p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-black transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          {/* Bottom Row: Navigation & Timer */}
          <div className="flex items-end justify-between w-full">
            
            {/* Progress Timer Bar */}
            <div className="flex gap-1.5 md:gap-2 items-end">
              {heroData.map((_, idx) => (
                <div 
                  key={idx} 
                  className="relative h-1 md:h-1.5 w-10 md:w-16 bg-white/20 rounded-full overflow-hidden cursor-pointer pointer-events-auto"
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                >
                  {/* Fill Animation */}
                  {idx === currentIndex && (
                    <motion.div 
                      layoutId="timer"
                      initial={{ width: "0%" }}
                      animate={{ width: isPlaying && !isHovered ? "100%" : "0%" }}
                      transition={{ duration: slideDuration / 1000, ease: "linear" }}
                      className="absolute top-0 left-0 h-full bg-white rounded-full"
                    />
                  )}
                  {/* Static Fill for passed slides */}
                  {idx < currentIndex && <div className="absolute inset-0 bg-white/60 rounded-full" />}
                </div>
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-3 pointer-events-auto">
              <button 
                onClick={() => paginate(-1)} 
                className="p-3 md:p-4 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => paginate(1)} 
                className="p-3 md:p-4 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
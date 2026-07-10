'use client';

import React, { 
  useRef, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate,
  useAnimationFrame,
  useInView,
  AnimatePresence
} from 'framer-motion';

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const THEME = {
  gold: '#D4AF37',
  goldDim: '#AA8C2C',
  dark: '#0a0a0a',
  light: '#ffffff',
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeOutCirc: [0.075, 0.82, 0.165, 1],
};

const PHYSICS = {
  tilt: {
    max: 12,              // Maximum rotation in degrees
    perspective: 1200,    // CSS perspective depth
    scale: 1.05,          // Scale on hover
    speed: 400,           // Spring speed (stiffness)
    damping: 25,          // Spring friction
  },
  parallax: {
    intensity: 20,        // Pixel movement for inner image
  },
  mobile: {
    cardWidth: 85,        // Width in vw
    gap: 16,              // Gap in px
  }
};

// ============================================================================
// 2. UTILITY HOOKS (CUSTOM ENGINES)
// ============================================================================

/**
 * Hook to calculate 3D tilt and Parallax values based on mouse position.
 * Returns spring-smoothed motion values for performant animation.
 */
function useParallaxTilt(ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation (Softens the jerky mouse movements)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [PHYSICS.tilt.max, -PHYSICS.tilt.max]), { 
    stiffness: PHYSICS.tilt.speed, 
    damping: PHYSICS.tilt.damping 
  });
  
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-PHYSICS.tilt.max, PHYSICS.tilt.max]), { 
    stiffness: PHYSICS.tilt.speed, 
    damping: PHYSICS.tilt.damping 
  });

  // Inverse movement for the image (creates depth)
  const imageX = useSpring(useTransform(x, [-0.5, 0.5], [-PHYSICS.parallax.intensity, PHYSICS.parallax.intensity]), {
    stiffness: PHYSICS.tilt.speed, 
    damping: PHYSICS.tilt.damping 
  });
  
  const imageY = useSpring(useTransform(y, [-0.5, 0.5], [-PHYSICS.parallax.intensity, PHYSICS.parallax.intensity]), {
    stiffness: PHYSICS.tilt.speed, 
    damping: PHYSICS.tilt.damping 
  });

  // Sheen/Glare gradient position
  const sheenX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const sheenY = useTransform(y, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Normalize coordinates to -0.5 to 0.5
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    x.set(xPct);
    y.set(yPct);
  }, [ref, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { rotateX, rotateY, imageX, imageY, sheenX, sheenY, handleMouseMove, handleMouseLeave };
}

// ============================================================================
// 3. SUB-COMPONENTS (VISUAL EFFECTS)
// ============================================================================

/**
 * Draws a golden SVG line that traces the border of the card.
 */
const TracingBorder = ({ isHovered }) => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none p-4">
      <svg className="w-full h-full overflow-visible">
        <motion.rect
          width="100%"
          height="100%"
          fill="none"
          stroke={THEME.gold}
          strokeWidth="1.5"
          rx="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: isHovered ? 1 : 0, 
            opacity: isHovered ? 1 : 0,
            strokeDashoffset: isHovered ? 0 : 100
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

// ============================================================================
// 4. DESKTOP CARD COMPONENT (COMPLEX)
// ============================================================================

const DesktopCard = ({ category, index }) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const { rotateX, rotateY, imageX, imageY, sheenX, sheenY, handleMouseMove, handleMouseLeave } = useParallaxTilt(ref);

  // Magnetic Text Logic (Text pulls slightly towards cursor)
  const textX = useTransform(imageX, (v) => v * -0.5); 
  const textY = useTransform(imageY, (v) => v * -0.5);

  const onEnter = () => setIsHovered(true);
  const onLeave = () => {
    setIsHovered(false);
    handleMouseLeave();
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 80, scale: 0.9 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          duration: 1.0, 
          delay: index * 0.1, 
          ease: THEME.easeOutExpo 
        } 
      }}
      viewport={{ once: true, amount: 0.1 }}
      style={{
        perspective: PHYSICS.tilt.perspective,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full aspect-[3/4] group cursor-pointer z-0 hover:z-10"
    >
      <Link href={`/category/${category.slug}`} className="block w-full h-full transform-style-3d">
        
        {/* --- 3D ROTATING CONTAINER --- */}
        <motion.div
          style={{ rotateX, rotateY }}
          className="relative w-full h-full bg-[#050505] overflow-hidden shadow-2xl origin-center"
        >
          {/* 1. Parallax Image Layer */}
          <motion.div 
            className="absolute inset-[-15%]" 
            style={{ x: imageX, y: imageY, scale: 1.15 }}
          >
            {category.image ? (
              <Image 
                src={category.image} 
                alt={category.name} 
                fill 
                className="object-cover opacity-80 transition-opacity duration-700 group-hover:opacity-100"
                priority={index < 4}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <span className="font-playfair text-3xl text-white/10 italic tracking-widest">Anaqa</span>
              </div>
            )}
          </motion.div>

          {/* 2. Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

          {/* 3. Interactive Sheen/Glare */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-40 pointer-events-none mix-blend-soft-light"
            style={{
              background: useMotionTemplate`radial-gradient(
                circle at ${sheenX}% ${sheenY}%, 
                rgba(255, 255, 255, 0.4), 
                transparent 50%
              )`
            }}
            transition={{ duration: 0.3 }}
          />

          {/* 4. Golden Border SVG */}
          <TracingBorder isHovered={isHovered} />

          {/* 5. Floating Content Layer (Magnetic) */}
          <motion.div 
            className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center z-30"
            style={{ x: textX, y: textY, z: 50 }} // Z pushes it "out" of screen
          >
            
            {/* Animated Divider Line */}
            <div className="relative overflow-hidden mb-5">
              <div className="h-[2px] w-12 bg-white/20" />
              <motion.div 
                className="absolute inset-0 bg-[#D4AF37]" 
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '0%' : '-101%' }}
                transition={{ duration: 0.6, ease: "circOut" }}
              />
            </div>

            {/* Typography */}
            <h3 className="font-playfair text-3xl text-white italic tracking-wide mb-2 drop-shadow-lg">
              {category.name}
            </h3>

            {/* Hidden Reveal Button */}
            <div className="h-8 overflow-hidden relative w-full flex justify-center">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 30, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="font-montserrat text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                  Discover
                </span>
                <span className="text-[#D4AF37] text-xs">→</span>
              </motion.div>
            </div>

          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// 5. MOBILE CARD COMPONENT (TOUCH OPTIMIZED)
// ============================================================================

/**
 * Uses IntersectionObserver to trigger animations when the card slides into center view.
 */
const MobileCard = ({ category }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.6, margin: "0px -20% 0px -20%" }); // Triggers when mostly centered

  return (
    <div 
      ref={ref}
      className="relative flex-shrink-0 snap-center rounded-sm overflow-hidden bg-gray-900"
      style={{
        width: `${PHYSICS.mobile.cardWidth}vw`,
        marginRight: `${PHYSICS.mobile.gap}px`,
        aspectRatio: '3/4'
      }}
    >
      <Link href={`/category/${category.slug}`} className="block w-full h-full relative group">
        
        {/* Active Parallax Image (Zoom Effect on Active) */}
        <motion.div 
          className="absolute inset-0 w-full h-full"
          animate={{ scale: isInView ? 1.05 : 1 }}
          transition={{ duration: 3.0, ease: "linear" }} // Slow breathe effect
        >
          {category.image ? (
            <Image 
              src={category.image} 
              alt={category.name} 
              fill 
              className="object-cover opacity-90"
              sizes="85vw"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800" />
          )}
        </motion.div>

        {/* Cinematic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />
        
        {/* Border that highlights when active */}
        <motion.div 
          className="absolute inset-3 border border-white/20"
          animate={{ borderColor: isInView ? THEME.gold : 'rgba(255,255,255,0.2)' }}
          transition={{ duration: 0.8 }}
        />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end items-start z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isInView ? 40 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[2px] bg-[#D4AF37] mb-3" 
          />
          
          <h3 className="font-playfair text-3xl text-white italic tracking-wide">
            {category.name}
          </h3>
          
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -10 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-2 flex items-center gap-2"
          >
             <span className="font-montserrat text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]/90">
               View Collection
             </span>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
               <path d="M5 12h14M12 5l7 7-7 7"/>
             </svg>
          </motion.div>
        </div>
      </Link>
    </div>
  );
};

// ============================================================================
// 6. MAIN CONTROLLER COMPONENT
// ============================================================================

export default function CategoryGridAnimated({ categories }) {
  const scrollRef = useRef(null);
  
  // Track scroll progress for the Mobile Golden Bar
  const { scrollXProgress } = useScroll({ container: scrollRef });
  const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 30 });

  // Memoize categories to prevent re-renders
  const memoizedCategories = useMemo(() => categories || [], [categories]);

  if (!memoizedCategories.length) return null;

  return (
    <section className="w-full relative z-10 select-none">
      
      {/* ---------------------------------------------------------
          DESKTOP VIEW (MD and UP) - The 3D Grid
          --------------------------------------------------------- */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8 px-4 max-w-[1800px] mx-auto">
        <AnimatePresence>
          {memoizedCategories.map((cat, index) => (
            <DesktopCard 
              key={`desktop-${cat._id}`} 
              category={cat} 
              index={index} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ---------------------------------------------------------
          MOBILE VIEW (XS to MD) - The Snap Slider
          --------------------------------------------------------- */}
      <div className="md:hidden w-full">
        
        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-12 pt-4 w-full"
          style={{ scrollBehavior: 'smooth' }}
        >
          {memoizedCategories.map((cat) => (
            <MobileCard 
              key={`mobile-${cat._id}`} 
              category={cat} 
            />
          ))}
          
          {/* Invisible Spacer to allow last card to be centered or fully viewed */}
          <div className="w-4 flex-shrink-0" />
        </div>

        {/* Golden Progress Indicator */}
        <div className="absolute bottom-0 left-0 w-full px-12 h-10 flex justify-center items-start">
           <div className="w-full h-[2px] bg-gray-200/20 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" 
               style={{ scaleX, transformOrigin: "0%" }} 
             />
           </div>
        </div>
      </div>

    </section>
  );
}
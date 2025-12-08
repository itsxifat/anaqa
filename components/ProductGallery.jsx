'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductGallery({ images }) {
  const [activeImage, setActiveImage] = useState(images[0] || '/placeholder.jpg');

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails (Left on Desktop, Bottom on Mobile) */}
      <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:h-[600px]">
        {images.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveImage(img)}
            className={`relative w-20 h-24 shrink-0 overflow-hidden border transition-all ${activeImage === img ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 relative h-[500px] md:h-[600px] bg-gray-50 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            src={activeImage} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            alt="Product View" 
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Zoom Hint */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  );
}
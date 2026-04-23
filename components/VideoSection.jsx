'use client';

import { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import ProductCard from './ProductCard';

export default function VideoSection({ data }) {
  if (!data || !data.isActive || !data.products?.length) return null;

  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(v => !v);
  };

  return (
    <section className="py-20 md:py-32 bg-black font-manrope border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] font-bold uppercase tracking-[0.3em] text-xs">
            Shop The Look
          </span>
          <h2 className="font-bodoni text-4xl md:text-5xl text-white mt-4">
            {data.heading}
          </h2>
          {data.subheading && (
            <p className="text-gray-400 text-sm mt-4">{data.subheading}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Video Player */}
          {data.videoUrl ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-900 shadow-2xl group cursor-pointer" onClick={toggle}>
              <video
                ref={videoRef}
                src={data.videoUrl}
                poster={data.videoPoster || undefined}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setPlaying(false)}
              />
              {/* Play/Pause overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  {playing
                    ? <Pause size={24} className="text-white" />
                    : <Play size={24} className="text-white ml-1" />}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl aspect-video bg-gray-800 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No video configured</p>
            </div>
          )}

          {/* Right: Products */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {data.products.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} dark />
            ))}
          </div>
        </div>

        {/* Extra products row */}
        {data.products.length > 4 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-12">
            {data.products.slice(4).map(product => (
              <ProductCard key={product._id} product={product} dark />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

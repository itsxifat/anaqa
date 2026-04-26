'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';

function ProductCard({ product }) {
  const formattedPrice = new Intl.NumberFormat('en-BD', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(product.price || 0);

  return (
    <Link href={`/product/${product.slug}`} className="group block w-full">

      {/* IMAGE */}
      <div className="relative w-full aspect-3/4 overflow-hidden bg-gray-100 mb-4">
        <div className="relative w-full h-full will-change-transform">
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={false}
          />
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

        <div className="absolute top-0 left-0 p-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-black shadow-sm">
            {product.category?.name || 'Shop'}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button className="bg-white text-black w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-lg">
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* INFO */}
      <div className="space-y-1">
        <h3 className="font-manrope text-sm font-bold text-gray-900 truncate group-hover:text-[#D4AF37] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            {product.sku || 'Luxury'}
          </p>
          <p className="font-bodoni text-base font-medium text-black">
            ৳{formattedPrice}
          </p>
        </div>
      </div>

    </Link>
  );
}

// memo prevents re-renders when parent state changes but product data hasn't changed
export default memo(ProductCard);

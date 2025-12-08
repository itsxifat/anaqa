'use client';
import { useState } from 'react';
import { ShoppingBag, Heart, Star, Share2, MessageCircle, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductInfo({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Calculate Discount Percentage
  const discount = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  const currentPrice = product.discountPrice || product.price;

  // Contact Links (Replace with your actual numbers/links)
  const whatsappLink = `https://wa.me/8801700000000?text=Hi, I am interested in ${product.name}`;
  const messengerLink = `https://m.me/anaqafashion`;

  return (
    <div className="font-manrope space-y-8">
      
      {/* Header & Price */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="font-bodoni text-3xl md:text-4xl text-gray-900 mb-2">{product.name}</h1>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex text-gold-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < product.rating ? "currentColor" : "none"} className={i < product.rating ? "text-gold-500" : "text-gray-300"} />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium">{product.numReviews} Reviews</span>
        </div>

        <div className="flex items-end gap-4">
          <span className="text-2xl font-bold text-black">${currentPrice}</span>
          {product.discountPrice && (
            <>
              <span className="text-lg text-gray-400 line-through">${product.price}</span>
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                Save {discount}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed font-light">
        {product.description}
      </p>

      {/* Stock Status */}
      <div>
        {product.stock > 0 ? (
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> In Stock ({product.stock} left)
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500"/> Out of Stock
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button 
          disabled={product.stock === 0}
          className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
        >
          <ShoppingBag size={18} /> {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
        </button>
        
        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`p-4 border ${isWishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'} transition-all`}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Contact Admin */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Have questions? Chat with us</p>
        <div className="flex gap-3">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#20bd5a] transition shadow-sm hover:shadow-md">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a href={messengerLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0084FF] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#0078e7] transition shadow-sm hover:shadow-md">
            <Facebook size={16} /> Messenger
          </a>
        </div>
      </div>

    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/lib/context/CartContext';
import Link from 'next/link';
import { Minus, Plus, X, ArrowRight, ShoppingBag, CheckCircle, Ticket, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// Toast Notification Component
const Toast = ({ message, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: 10 }} 
    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 bg-black text-white shadow-2xl rounded-full"
  >
    <CheckCircle size={14} className="text-[#D4AF37]" />
    <span className="text-[10px] font-bold uppercase tracking-widest">{message}</span>
  </motion.div>
);

export default function CartClient() {
  const { 
    cart, removeFromCart, updateQuantity, 
    cartTotal, grandTotal, appliedCoupon, 
    applyCouponCode, removeCoupon, manualCode, couponError 
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const [inputVal, setInputVal] = useState('');
  const [toast, setToast] = useState(null);

  // Sync local input with context state (e.g. if code loaded from localStorage)
  useEffect(() => {
     if(manualCode) setInputVal(manualCode);
  }, [manualCode]);

  useEffect(() => {
    setMounted(true);
    if (cart.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".cart-row", 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [cart.length]);

  const handleApply = () => {
    if (!inputVal.trim()) return;
    applyCouponCode(inputVal); // Triggers server calculation in Context
  };

  const handleRemove = () => {
    removeCoupon(); // Reverts to automatic coupon if available
    setInputVal('');
  };

  if (!mounted) return null;

  // Empty State
  if (cart.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center font-manrope">
      <div className="mb-6 opacity-20">
        <ShoppingBag size={80} strokeWidth={0.5} />
      </div>
      <h1 className="font-bodoni text-4xl mb-4 text-black">Your Bag is Empty</h1>
      <Link href="/product" className="group relative border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.2em] hover:text-gray-600 transition-colors">
        Explore Collection
      </Link>
    </div>
  );

  return (
    <div ref={containerRef} className="max-w-[1200px] mx-auto px-6 pt-12 pb-32 font-manrope">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="mb-16 text-center">
        <h1 className="font-bodoni text-5xl md:text-6xl text-black mb-4">Shopping Bag</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{cart.length} Items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* LEFT: Items List */}
        <div className="lg:col-span-7 space-y-8">
          <AnimatePresence mode='popLayout'>
            {cart.map((item) => (
              <motion.div 
                layout 
                key={`${item._id}-${item.selectedSize}`} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="cart-row flex gap-6 md:gap-8 py-6 border-b border-gray-100 group"
              >
                <div className="w-24 md:w-32 aspect-[3/4] bg-gray-50 flex-shrink-0 relative overflow-hidden">
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bodoni text-xl md:text-2xl text-black leading-none">{item.name}</h3>
                      <button onClick={() => removeFromCart(item._id, item.selectedSize)} className="text-gray-300 hover:text-black transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                      {item.category?.name} {item.selectedSize && `• ${item.selectedSize}`}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 h-9 px-2">
                          <button onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity - 1)} className="p-2 hover:text-gray-500 transition">
                            <Minus size={10} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity + 1)} className="p-2 hover:text-gray-500 transition">
                            <Plus size={10} />
                          </button>
                        </div>
                        <p className="text-sm font-medium">৳{(item.discountPrice || item.price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* RIGHT: Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <div className="bg-white p-8 md:p-10 border border-gray-100 shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
            <h2 className="font-bodoni text-2xl mb-8">Summary</h2>
            
            {/* COUPON INPUT */}
            <div className="mb-8">
               {/* Show active coupon info */}
               {appliedCoupon && (
                 <div className={`p-4 rounded-lg flex justify-between items-center mb-3 animate-in fade-in slide-in-from-top-2 ${appliedCoupon.isAuto ? 'bg-blue-50 border border-blue-100' : 'bg-[#D4AF37]/5 border border-[#D4AF37]/20'}`}>
                    <div className="flex items-center gap-3">
                       {appliedCoupon.isAuto ? <Zap size={16} className="text-blue-500" /> : <Ticket size={16} className="text-[#D4AF37]" />}
                       <div>
                          <span className="text-xs font-bold text-black block uppercase tracking-wide">
                             {appliedCoupon.isAuto ? "Automatic Offer" : appliedCoupon.code}
                          </span>
                          <span className={`text-[10px] font-bold ${appliedCoupon.isAuto ? 'text-blue-600' : 'text-[#D4AF37]'}`}>
                             {appliedCoupon.desc}
                          </span>
                       </div>
                    </div>
                    {/* Only allow removing manual coupons. Auto ones persist unless overridden. */}
                    {!appliedCoupon.isAuto && (
                       <button onClick={handleRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14}/></button>
                    )}
                 </div>
               )}

               {/* Manual Input (Always show unless manual is active) */}
               {(!appliedCoupon || appliedCoupon.isAuto) && (
                 <div className="flex gap-2">
                    <input 
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value.toUpperCase())}
                      placeholder="PROMO CODE" 
                      className="flex-1 bg-gray-50 border border-transparent focus:bg-white focus:border-black p-3 text-xs font-bold uppercase tracking-widest outline-none transition-all placeholder:text-gray-400"
                    />
                    <button 
                      onClick={handleApply}
                      disabled={!inputVal}
                      className="bg-black text-white px-5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      Apply
                    </button>
                 </div>
               )}
               
               {couponError && <p className="text-[10px] text-red-500 mt-2 font-medium tracking-wide flex items-center gap-1"><X size={10}/> {couponError}</p>}
            </div>

            <div className="space-y-4 mb-8 border-b border-gray-100 pb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-black">৳{cartTotal.toLocaleString()}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-[#D4AF37]">
                  <span className="font-medium">Discount</span>
                  <span className="font-bold">-৳{appliedCoupon.amount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Calculated Next</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-bold uppercase tracking-widest">Total</span>
              <span className="font-bodoni text-3xl text-black">৳{grandTotal.toLocaleString()}</span>
            </div>

            <Link href="/checkout" className="group relative w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.25em] flex items-center justify-center overflow-hidden transition-all hover:bg-gray-900">
              <span className="relative z-10 flex items-center gap-3">Checkout <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
            
            <div className="mt-6 text-center">
              <Link href="/product" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
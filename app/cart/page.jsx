'use client';

import { useCart } from '@/lib/context/CartContext';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center font-manrope">
        <div className="p-6 bg-white rounded-full shadow-sm mb-6 text-gray-300">
          <ShoppingBag size={48} strokeWidth={1} />
        </div>
        <h1 className="font-bodoni text-3xl mb-2">Your Bag is Empty</h1>
        <p className="text-gray-500 mb-8 text-sm">Looks like you haven't added anything yet.</p>
        <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 font-manrope">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <h1 className="font-bodoni text-4xl mb-12">Shopping Bag ({cart.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* --- CART ITEMS --- */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={`${item._id}-${item.selectedSize}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-white p-6 rounded-xl flex gap-6 shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Image */}
                  <div className="w-24 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <img 
                      src={item.images?.[0] || '/placeholder.jpg'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-playfair text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="font-bold text-sm">
                          ৳{(item.discountPrice || item.price).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                        {item.category?.name || 'Item'} {item.selectedSize && `| Size: ${item.selectedSize}`}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 text-gray-500 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-bold w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 text-gray-500 transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button 
                        onClick={() => removeFromCart(item._id, item.selectedSize)}
                        className="text-gray-400 hover:text-red-600 transition p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* --- SUMMARY --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
              <h2 className="font-playfair text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-xl">৳{cartTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Including VAT where applicable</p>
              </div>

              <Link href="/checkout" className="w-full bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all flex justify-center items-center gap-2 group">
                Proceed to Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              
              <div className="mt-6 text-center">
                <Link href="/shop" className="text-xs text-gray-500 underline hover:text-black">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
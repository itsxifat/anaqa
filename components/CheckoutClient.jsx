'use client';

import { useCart } from '@/lib/context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, saveAddress } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, User, Truck, CreditCard, CheckCircle, Loader2, Plus, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutClient({ savedAddresses }) {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(savedAddresses.length > 0);
  const [selectedAddressId, setSelectedAddressId] = useState(savedAddresses[0]?._id || null);
  const [shippingMethod, setShippingMethod] = useState('inside');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Form Data for NEW address
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', label: 'Home'
  });

  const shippingCost = shippingMethod === 'inside' ? 80 : 150;
  const grandTotal = cartTotal + shippingCost;

  useEffect(() => {
    if (cart.length === 0) router.push('/cart');
  }, [cart, router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine Final Data
    let finalData = {};

    if (useSavedAddress && selectedAddressId) {
      const addr = savedAddresses.find(a => a._id === selectedAddressId);
      finalData = {
        firstName: addr.firstName, lastName: addr.lastName, phone: addr.phone,
        address: addr.address, city: addr.city, postalCode: addr.postalCode
      };
    } else {
      finalData = { ...formData };
      // Optional: Save this new address if checkbox checked
      if (isSavingAddress) {
        const saveFormData = new FormData();
        Object.keys(formData).forEach(key => saveFormData.append(key, formData[key]));
        await saveAddress(saveFormData);
      }
    }

    const orderData = {
      guestInfo: finalData,
      items: cart.map(item => ({
        product: item._id,
        name: item.name,
        price: item.discountPrice || item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        image: item.images?.[0] || '/placeholder.jpg'
      })),
      shippingAddress: {
        address: finalData.address,
        city: finalData.city,
        postalCode: finalData.postalCode,
        method: shippingMethod
      },
      totalAmount: grandTotal,
      paymentMethod: 'COD'
    };

    const res = await createOrder(orderData);

    if (res.success) {
      clearCart();
      router.refresh(); 
      router.push('/account/orders'); 
    } else {
      alert("Failed: " + (res.error || "Unknown error"));
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-24 font-manrope">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/cart" className="p-2 hover:bg-white rounded-full transition text-gray-400 hover:text-black">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bodoni text-3xl md:text-4xl text-black">Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* --- LEFT COLUMN: DETAILS --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Address Selection */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
             <h2 className="font-bodoni text-xl mb-6 flex items-center gap-2">
               <MapPin size={18} className="text-[#D4AF37]"/> Shipping Details
             </h2>

             {savedAddresses.length > 0 && (
               <div className="mb-6 flex gap-4 border-b border-gray-100 pb-6">
                 <button type="button" onClick={() => setUseSavedAddress(true)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${useSavedAddress ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                    Saved Address
                 </button>
                 <button type="button" onClick={() => setUseSavedAddress(false)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${!useSavedAddress ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                    New Address
                 </button>
               </div>
             )}

             <AnimatePresence mode='wait'>
               {useSavedAddress && savedAddresses.length > 0 ? (
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 gap-4">
                    {savedAddresses.map((addr) => (
                      <div 
                        key={addr._id} 
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${selectedAddressId === addr._id ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${selectedAddressId === addr._id ? 'border-[#D4AF37]' : 'border-gray-300'}`}>
                           {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />}
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-black">{addr.firstName} {addr.lastName}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-100 px-1.5 rounded text-gray-500">{addr.label}</span>
                           </div>
                           <p className="text-xs text-gray-500 leading-relaxed">{addr.address}, {addr.city} - {addr.postalCode}</p>
                           <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                        </div>
                      </div>
                    ))}
                 </motion.div>
               ) : (
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <input name="firstName" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none transition-all placeholder:text-gray-400" placeholder="First Name"/>
                       <input name="lastName" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none transition-all placeholder:text-gray-400" placeholder="Last Name"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input name="phone" type="tel" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none transition-all placeholder:text-gray-400" placeholder="Phone Number"/>
                       <input name="email" type="email" onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none transition-all placeholder:text-gray-400" placeholder="Email (Optional)"/>
                    </div>
                    <textarea name="address" rows="2" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none resize-none transition-all placeholder:text-gray-400" placeholder="Full Address (House, Road, Area)"/>
                    <div className="grid grid-cols-2 gap-4">
                       <input name="city" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none transition-all placeholder:text-gray-400" placeholder="City"/>
                       <input name="postalCode" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none transition-all placeholder:text-gray-400" placeholder="Postal Code"/>
                    </div>
                    
                    {/* Save Address Toggle */}
                    <div className="flex items-center gap-2 pt-2">
                       <input type="checkbox" id="saveAddr" checked={isSavingAddress} onChange={(e) => setIsSavingAddress(e.target.checked)} className="w-4 h-4 accent-black" />
                       <label htmlFor="saveAddr" className="text-xs font-bold text-gray-500 cursor-pointer select-none">Save this address for next time</label>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* 2. Delivery Method */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
             <h2 className="font-bodoni text-xl mb-6 flex items-center gap-2">
               <Truck size={18} className="text-[#D4AF37]"/> Delivery Method
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div onClick={() => setShippingMethod('inside')} className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between group ${shippingMethod === 'inside' ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-900">Inside Dhaka</span>
                  <span className="text-sm font-bold">৳80</span>
               </div>
               <div onClick={() => setShippingMethod('outside')} className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between group ${shippingMethod === 'outside' ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-900">Outside Dhaka</span>
                  <span className="text-sm font-bold">৳150</span>
               </div>
             </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: SUMMARY --- */}
        <div className="lg:col-span-5">
           <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 sticky top-32">
              <h2 className="font-bodoni text-xl mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin">
                 {cart.map((item) => (
                    <div key={`${item._id}-${item.selectedSize}`} className="flex gap-4 items-center group">
                       <div className="w-12 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={item.images?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bodoni text-sm text-black line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Qty: {item.quantity} {item.selectedSize && `• ${item.selectedSize}`}</p>
                       </div>
                       <span className="text-sm font-medium">৳{(item.discountPrice || item.price) * item.quantity}</span>
                    </div>
                 ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-2 text-sm text-gray-600">
                 <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-black">৳{cartTotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-black">৳{shippingCost.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center pt-4 mt-2 border-t border-dashed border-gray-200">
                    <span className="font-bodoni text-xl text-black">Total</span>
                    <span className="font-bodoni text-2xl text-[#D4AF37]">৳{grandTotal.toLocaleString()}</span>
                 </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-6 border border-gray-100 flex items-start gap-3">
                 <CreditCard size={18} className="text-gray-400 mt-0.5"/>
                 <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black">Cash On Delivery</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Pay in cash upon delivery.</p>
                 </div>
              </div>

              <button type="submit" disabled={loading} className="group relative w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] overflow-hidden rounded-xl flex items-center justify-center mt-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                 <div className="absolute inset-0 bg-[#D4AF37] transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
                 <span className="relative z-10 flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <><CheckCircle size={16} /> Place Order</>}
                 </span>
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}
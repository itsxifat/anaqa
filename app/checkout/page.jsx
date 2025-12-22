'use client';

import { useCart } from '@/lib/context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, User, Truck, CreditCard, CheckCircle, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('inside');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: ''
  });

  const shippingCost = shippingMethod === 'inside' ? 80 : 150;
  const grandTotal = cartTotal + shippingCost;

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      guestInfo: { ...formData },
      items: cart.map(item => ({
        product: item._id, // Ensure this ID is valid
        name: item.name,
        price: item.discountPrice || item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        image: item.images && item.images[0] ? item.images[0] : '/placeholder.jpg'
      })),
      shippingAddress: {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        method: shippingMethod
      },
      totalAmount: grandTotal,
      paymentMethod: 'COD'
    };

    console.log("Submitting Order...", orderData); // Debug Log

    const res = await createOrder(orderData);

    if (res.success) {
      console.log("Order Success:", res.orderId);
      clearCart();
      
      // CRITICAL FIX: Refresh server data before pushing
      router.refresh(); 
      router.push('/account/orders'); 
    } else {
      alert("Failed: " + (res.error || "Unknown error"));
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 font-manrope">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="flex items-center gap-4 mb-10">
          <Link href="/cart" className="p-2 hover:bg-white rounded-full transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bodoni text-3xl md:text-4xl text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ... (Keep your form UI exactly the same as before) ... */}
          
          {/* Just ensuring the button is hooked up correctly */}
          <div className="lg:col-span-7 space-y-8">
             {/* ... Left Column Fields ... */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-playfair text-lg font-bold mb-6 flex items-center gap-2">
                <User size={18} className="text-gray-400"/> Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">First Name</label>
                  <input name="firstName" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none" placeholder="e.g. John"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Last Name</label>
                  <input name="lastName" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none" placeholder="e.g. Doe"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                  <input name="email" type="email" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none" placeholder="john@example.com"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                  <input name="phone" type="tel" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none" placeholder="+880 1XXX XXXXXX"/>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-playfair text-lg font-bold mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-gray-400"/> Shipping Address
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Full Address</label>
                  <textarea name="address" rows="2" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none resize-none" placeholder="House, Road, Area, etc."/>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">City</label>
                    <input name="city" required onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none" placeholder="e.g. Dhaka"/>
                   </div>
                   <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Postal Code</label>
                    <input name="postalCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-lg p-3 text-sm outline-none" placeholder="e.g. 1205"/>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-playfair text-lg font-bold mb-6 flex items-center gap-2">
                <Truck size={18} className="text-gray-400"/> Delivery Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setShippingMethod('inside')} className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${shippingMethod === 'inside' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-sm font-bold text-gray-900">Inside Dhaka</span>
                  <span className="text-sm font-bold">৳80</span>
                </div>
                <div onClick={() => setShippingMethod('outside')} className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${shippingMethod === 'outside' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="text-sm font-bold text-gray-900">Outside Dhaka</span>
                  <span className="text-sm font-bold">৳150</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: SUMMARY & SUBMIT --- */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
              <h2 className="font-playfair text-lg font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {cart.map((item) => (
                  <div key={`${item._id}-${item.selectedSize}`} className="flex gap-4 items-center">
                    <div className="w-14 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                       <img src={item.images?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-playfair text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">৳{(item.discountPrice || item.price) * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>৳{shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                  <span className="font-bodoni text-xl font-bold text-black">Total</span>
                  <span className="font-bodoni text-2xl font-bold text-black">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-6 border border-gray-100 flex items-start gap-3">
                 <CreditCard size={18} className="text-gray-400 mt-0.5"/>
                 <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Cash On Delivery</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">Pay upon delivery.</p>
                 </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all flex justify-center items-center gap-2 mt-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="animate-spin" size={18}/> : <><CheckCircle size={16} /> Place Order</>}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
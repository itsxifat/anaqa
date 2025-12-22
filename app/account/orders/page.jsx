'use client';

import { useEffect, useState } from 'react';
import { getUserOrders } from '@/app/actions';
import { Package, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
        console.log("Orders received:", data); // Debugging: Check console to see if data arrives
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="min-h-screen pt-32 text-center font-manrope">Loading your orders...</div>;

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 font-manrope">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-bodoni text-3xl mb-2">My Orders</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-10">Tracking & History</p>

        {orders.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
             <Package size={48} className="mx-auto text-gray-200 mb-4"/>
             <p className="text-gray-500">No orders found.</p>
             <Link href="/" className="text-xs font-bold uppercase mt-4 inline-block border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
               Start Shopping
             </Link>
           </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                   <div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Order ID</span>
                     <span className="font-bold text-gray-900 text-sm">#{order.orderId || order._id.slice(-6)}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Status</span>
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                     }`}>
                       {order.status === 'Delivered' ? <CheckCircle size={12}/> : order.status === 'Cancelled' ? <XCircle size={12}/> : <Clock size={12}/>}
                       {order.status}
                     </span>
                   </div>
                </div>

                {/* Items */}
                <div className="p-6">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 mb-4 last:mb-0 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                        <img 
                          src={item.image || '/placeholder.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-playfair font-bold text-sm text-gray-900">{item.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Size: {item.size || 'N/A'} | Qty: {item.quantity}
                        </p>
                        <p className="text-xs font-bold mt-2">৳{item.price}</p>
                      </div>
                      
                      {/* Review Button: Only if Delivered */}
                      {order.status === 'Delivered' && (
                         <button className="self-center text-[10px] font-bold uppercase border border-gray-200 px-3 py-2 rounded hover:bg-black hover:text-white transition whitespace-nowrap">
                           Write Review
                         </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                   <div className="text-xs text-gray-500">
                     Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                   </div>
                   <div className="text-sm font-bold text-gray-900">
                     Total: ৳{order.totalAmount}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '@/app/actions';
import { Package, MoreHorizontal, Check, X, Truck } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await getAdminOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    setLoading(true);
    await updateOrderStatus(id, status);
    await loadOrders(); // Refresh
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] p-8 font-manrope">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-playfair text-3xl font-bold mb-8">Order Management</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map(order => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{order.orderId}</td>
                  <td className="p-4">
                    <div className="font-medium">{order.guestInfo?.firstName} {order.guestInfo?.lastName}</div>
                    <div className="text-xs text-gray-400">{order.guestInfo?.phone}</div>
                  </td>
                  <td className="p-4 text-gray-500">{order.items.length} Items</td>
                  <td className="p-4 font-bold">৳{order.totalAmount}</td>
                  <td className="p-4 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       {/* Quick Actions */}
                       {order.status === 'Pending' && (
                         <button onClick={() => handleStatusChange(order._id, 'Processing')} className="p-2 hover:bg-blue-50 text-blue-600 rounded" title="Mark Processing"><Package size={16}/></button>
                       )}
                       {order.status === 'Processing' && (
                         <button onClick={() => handleStatusChange(order._id, 'Shipped')} className="p-2 hover:bg-purple-50 text-purple-600 rounded" title="Mark Shipped"><Truck size={16}/></button>
                       )}
                       {order.status === 'Shipped' && (
                         <button onClick={() => handleStatusChange(order._id, 'Delivered')} className="p-2 hover:bg-green-50 text-green-600 rounded" title="Mark Delivered"><Check size={16}/></button>
                       )}
                       {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                         <button onClick={() => handleStatusChange(order._id, 'Cancelled')} className="p-2 hover:bg-red-50 text-red-600 rounded" title="Cancel Order"><X size={16}/></button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
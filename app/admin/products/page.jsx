'use client';

import Link from 'next/link';
import { Plus, Trash2, Package, Search, Filter, MoreHorizontal, Edit3 } from 'lucide-react';
import { getAdminProducts, deleteProduct } from '@/app/actions';
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function load() {
      const data = await getAdminProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  // GSAP Animation on Load
  useEffect(() => {
    if (!loading && containerRef.current) {
      const rows = containerRef.current.querySelectorAll('.product-row');
      gsap.fromTo(rows, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      // Optimistic UI update
      setProducts(prev => prev.filter(p => p._id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-manrope pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-gray-900">Inventory</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Manage your collection</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-black focus:ring-0 outline-none transition-all"
              />
            </div>
            <Link href="/admin/products/new" className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
              <Plus size={16} /> Add New
            </Link>
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-7xl mx-auto p-8" ref={containerRef}>
        
        {/* Stats Row (Optional Polish) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Package size={20}/></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold font-playfair">{products.length}</p>
            </div>
          </div>
          {/* Add more stats if needed */}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold">
                  <th className="p-6 font-manrope">Product</th>
                  <th className="p-6 font-manrope">Category</th>
                  <th className="p-6 font-manrope">Status</th>
                  <th className="p-6 font-manrope">Price</th>
                  <th className="p-6 font-manrope text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="text-sm divide-y divide-gray-50">
                {loading ? (
                  // Skeleton Loading
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-6 flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-100 rounded-md"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-100 rounded"></div>
                          <div className="h-3 w-20 bg-gray-100 rounded"></div>
                        </div>
                      </td>
                      <td className="p-6"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                      <td className="p-6"><div className="h-6 w-16 bg-gray-100 rounded-full"></div></td>
                      <td className="p-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                      <td className="p-6"></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Package size={48} strokeWidth={1} className="mb-4 opacity-50"/>
                        <p className="text-lg font-medium text-gray-900">No products found</p>
                        <p className="text-sm">Get started by adding your first product.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="product-row group hover:bg-gray-50/80 transition-colors duration-200">
                      
                      {/* Product Info */}
                      <td className="p-6">
                        <div className="flex items-center gap-5">
                          <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                            <img 
                              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 font-playfair text-base group-hover:text-gold-600 transition-colors">{product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {product._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Stock Status */}
                      <td className="p-6">
                        {product.stock > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-green-700">In Stock ({product.stock})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Out of Stock</span>
                          </div>
                        )}
                      </td>

                      {/* Price (BDT) */}
                      <td className="p-6 font-manrope font-bold text-gray-900">
                        ৳{product.price?.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 hover:shadow-sm" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100" 
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
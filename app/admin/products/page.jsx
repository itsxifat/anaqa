import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { getAdminProducts, deleteProduct } from '@/app/actions';

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-manrope">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory</p>
        </div>
        <Link href="/admin/products/new" className="bg-black text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 font-bold">
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                    {/* DIRECT PATH: Uses the first image string from the array */}
                    <img 
                      src={product.images[0] || '/placeholder.jpg'} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-900">{product.name}</td>
                <td className="p-4">${product.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock} Units
                  </span>
                </td>
                <td className="p-4 text-gray-500">{product.category?.name || 'Uncategorized'}</td>
                <td className="p-4 flex justify-end gap-2">
                  <form action={deleteProduct.bind(null, product._id)}>
                    <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">No products found. Add one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
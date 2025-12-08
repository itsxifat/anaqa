'use client';

import { createProduct, getCategories } from '@/app/actions';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Fetch categories for the dropdown
    getCategories().then(setCategories);
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    // Append images manually because we are managing them in state for preview (optional, but good practice)
    // Actually, the file input itself works, but let's ensure we are clean.
    
    const res = await createProduct(formData);
    
    if (res.success) {
      router.push('/admin/products');
    } else {
      alert("Error creating product");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-manrope flex justify-center">
      <div className="w-full max-w-4xl">
        
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-white rounded-full transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-playfair font-bold">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-6">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input name="name" required className="w-full p-3 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Classic Silk Saree" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" required rows="5" className="w-full p-3 border border-gray-200 rounded-lg text-sm" placeholder="Product details..." />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-6">Inventory & Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input name="price" type="number" step="0.01" required className="w-full p-3 border border-gray-200 rounded-lg text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Price ($)</label>
                  <input name="discountPrice" type="number" step="0.01" className="w-full p-3 border border-gray-200 rounded-lg text-sm" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input name="stock" type="number" required className="w-full p-3 border border-gray-200 rounded-lg text-sm" placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Media & Organization */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-6">Product Media</h3>
              
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
                <UploadCloud size={32} className="text-gray-300 mb-2" />
                <span className="text-xs font-bold uppercase text-gray-400">Upload Images</span>
                <input type="file" name="images" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {images.map((file, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-6">Category</h3>
              <select name="category" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> Publish Product</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
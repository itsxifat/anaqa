'use client';

import { createProduct, getCategories } from '@/app/actions';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, Save, ArrowLeft, X, Check, Image as ImageIcon, Box, Tag, DollarSign, AlertCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'framer-motion';

// --- HELPER: FLATTEN CATEGORY TREE ---
// Turns the nested tree into a flat list with depth indicators for the dropdown
const flattenCategories = (categories, depth = 0) => {
  let flat = [];
  categories.forEach(cat => {
    flat.push({ 
      _id: cat._id, 
      name: cat.name, 
      depth: depth,
      // Visual label with indentation
      label: `${'\u00A0\u00A0'.repeat(depth * 2)}${depth > 0 ? '└─ ' : ''}${cat.name}`
    });
    if (cat.children && cat.children.length > 0) {
      flat = flat.concat(flattenCategories(cat.children, depth + 1));
    }
  });
  return flat;
};

// --- CUSTOM TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, x: '-50%' }} 
    animate={{ opacity: 1, y: 0, x: '-50%' }} 
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md min-w-[320px] ${
      type === 'error' 
        ? 'bg-red-50/90 border-red-200 text-red-800' 
        : 'bg-green-50/90 border-green-200 text-green-800'
    }`}
  >
    {type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
    <div className="flex-1">
      <p className="text-xs font-bold uppercase tracking-widest opacity-70">{type === 'error' ? 'Error' : 'Success'}</p>
      <p className="text-sm font-medium">{message}</p>
    </div>
    <button onClick={onClose} className="opacity-50 hover:opacity-100"><X size={16}/></button>
  </motion.div>
);

export default function NewProductPage() {
  const router = useRouter();
  const formRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(false);
  const [flatCategories, setFlatCategories] = useState([]); // Use flat list for dropdown
  const [images, setImages] = useState([]);
  const [toast, setToast] = useState(null); 
  const [errors, setErrors] = useState({}); 

  // --- ANIMATION ON LOAD ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".anim-entry", 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    async function loadCats() {
      const tree = await getCategories();
      const flat = flattenCategories(tree);
      setFlatCategories(flat);
    }
    loadCats();
  }, []);

  // --- HELPERS ---
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
      if (errors.images) setErrors(prev => ({ ...prev, images: null }));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- SUBMISSION LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); 

    const formData = new FormData(e.target);
    const newErrors = {};

    // 1. Validate Category
    const category = formData.get('category');
    if (!category || category === "") {
        newErrors.category = "Please select a category";
    }

    // 2. Validate Images
    if (images.length === 0) {
        newErrors.images = "At least one product image is required";
    }

    // 3. Validate Price
    const price = parseFloat(formData.get('price'));
    if (!price || price <= 0) {
        newErrors.price = "Price must be greater than 0";
    }

    // IF ERRORS EXIST
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        showToast("Please fix the highlighted errors.", 'error');
        gsap.fromTo("form", { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
        return;
    }
    
    // Manual append for state-managed images
    formData.delete('images');
    images.forEach(file => formData.append('images', file));

    try {
        const res = await createProduct(formData);
        
        if (res.success) {
          showToast("Product published successfully!", 'success');
          setTimeout(() => router.push('/admin/products'), 1000);
        } else {
          showToast(res.error || "Failed to create product.", 'error');
          setLoading(false);
        }
    } catch (err) {
        showToast("An unexpected error occurred.", 'error');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-manrope pb-32" ref={formRef}>
      
      {/* --- NOTIFICATION LAYER --- */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-black">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-playfair font-bold text-gray-900">New Product</h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Inventory Management</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition">
                Cancel
             </button>
             <button onClick={(e) => formRef.current?.requestSubmit()} disabled={loading} className="md:hidden bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Check size={16} />}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (2/3) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. General Info */}
            <div className="anim-entry bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-gray-50 rounded-full text-gray-400"><Tag size={18}/></div>
                <h3 className="font-playfair font-bold text-lg text-gray-900">General Information</h3>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors">Product Name</label>
                  <input 
                    name="name" 
                    required 
                    className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-lg font-medium transition-all outline-none placeholder:text-gray-300" 
                    placeholder="e.g. Midnight Velvet Gown" 
                  />
                </div>
                
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-black transition-colors">Description</label>
                  <textarea 
                    name="description" 
                    required 
                    rows="6" 
                    className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-sm leading-relaxed transition-all outline-none placeholder:text-gray-300 resize-none" 
                    placeholder="Describe the fabric, fit, and intricate details..." 
                  />
                </div>
              </div>
            </div>

            {/* 2. Media Gallery */}
            <div className={`anim-entry bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border transition-colors ${errors.images ? 'border-red-300 bg-red-50/10' : 'border-gray-100/50'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400"><ImageIcon size={18}/></div>
                    <h3 className="font-playfair font-bold text-lg text-gray-900">Gallery</h3>
                </div>
                {errors.images && <span className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.images}</span>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1 aspect-square relative group cursor-pointer">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  <div className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-all ${errors.images ? 'border-red-200 bg-red-50' : 'border-gray-200 group-hover:border-gray-400 group-hover:bg-gray-50'}`}>
                    <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mb-2 text-gray-400 group-hover:text-black transition-colors">
                      <UploadCloud size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-600">Upload</span>
                  </div>
                </div>

                {images.map((file, i) => (
                  <div key={i} className="aspect-square relative group rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Pricing & Inventory */}
            <div className="anim-entry grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Pricing */}
               <div className={`bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border transition-colors ${errors.price ? 'border-red-300' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-full text-gray-400"><DollarSign size={18}/></div>
                        <h3 className="font-playfair font-bold text-lg text-gray-900">Pricing</h3>
                    </div>
                    {errors.price && <AlertCircle size={16} className="text-red-500"/>}
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Base Price</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif text-lg group-focus-within:text-black transition-colors">৳</span>
                        <input 
                          name="price" type="number" step="0.01" required 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-lg font-bold outline-none transition-all placeholder:text-gray-300" 
                          placeholder="0.00" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Discount Price</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif text-lg group-focus-within:text-red-500 transition-colors">৳</span>
                        <input 
                          name="discountPrice" type="number" step="0.01"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 rounded-xl text-lg font-bold text-red-600 outline-none transition-all placeholder:text-gray-300" 
                          placeholder="0.00" 
                        />
                      </div>
                    </div>
                  </div>
               </div>

               {/* Inventory */}
               <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400"><Box size={18}/></div>
                    <h3 className="font-playfair font-bold text-lg text-gray-900">Inventory</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">SKU (Auto)</label>
                      <input disabled className="w-full p-3 bg-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed border border-transparent" placeholder="Generated on save" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Stock Quantity</label>
                      <input 
                        name="stock" type="number" required 
                        className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-lg font-bold outline-none transition-all" 
                        placeholder="0" 
                      />
                    </div>
                  </div>
               </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (1/3) --- */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Organization (UPDATED CATEGORY SELECT) */}
            <div className={`anim-entry bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border transition-colors ${errors.category ? 'border-red-300' : 'border-gray-100/50'}`}>
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-playfair font-bold text-lg text-gray-900">Organization</h3>
                  {errors.category && <AlertCircle size={16} className="text-red-500"/>}
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <div className="relative">
                    <select 
                        name="category" 
                        className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl text-sm font-medium outline-none transition-all appearance-none cursor-pointer"
                        defaultValue=""
                    >
                      <option value="" disabled>Select Category</option>
                      {flatCategories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.label} 
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  {errors.category && <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">{errors.category}</p>}
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
                    <span>Status</span>
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">Product will be immediately available for sale upon publication.</p>
                </div>
              </div>
            </div>

            {/* Sticky Action Button */}
            <div className="anim-entry sticky top-32">
              <button 
                disabled={loading} 
                className="w-full bg-black text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 disabled:opacity-70 transition-all flex justify-center items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
              >
                {loading ? <Loader2 className="animate-spin" size={18}/> : (
                  <>
                    <Save size={18} className="group-hover:scale-110 transition-transform"/> 
                    PUBLISH PRODUCT
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest">
                Changes saved automatically
              </p>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}
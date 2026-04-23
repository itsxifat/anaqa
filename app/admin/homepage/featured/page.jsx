'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { X, Plus, Search, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminPageWrapper from '../../components/AdminPageWrapper';
import { getFeaturedSection, saveFeaturedSection } from '@/actions/homepageSections';
import { getAdminProducts } from '@/app/actions';

export default function FeaturedSectionAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heading, setHeading] = useState('Featured Collection');
  const [subheading, setSubheading] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [existingImage, setExistingImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  const fileRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [section, products] = await Promise.all([
        getFeaturedSection(),
        getAdminProducts(),
      ]);
      if (section) {
        setHeading(section.heading || '');
        setSubheading(section.subheading || '');
        setIsActive(section.isActive ?? true);
        setExistingImage(section.image || '');
        setImagePreview(section.image || '');
        setSelectedProducts(section.products || []);
      }
      setAllProducts(products || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) return prev.filter(p => p._id !== product._id);
      if (prev.length >= 8) { toast.error('Max 8 products allowed'); return prev; }
      return [...prev, product];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('heading', heading);
    fd.append('subheading', subheading);
    fd.append('isActive', String(isActive));
    fd.append('existingImage', existingImage);
    if (imageFile) fd.append('image', imageFile);
    selectedProducts.forEach(p => fd.append('products', p._id));

    const result = await saveFeaturedSection(fd);
    if (result.success) {
      toast.success('Featured section saved!');
      setImageFile(null);
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setSaving(false);
  };

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <AdminPageWrapper title="Featured Section" subtitle="Loading...">
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Featured Section"
      subtitle="Image + heading + products displayed on homepage"
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors disabled:opacity-50 rounded-lg"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* LEFT: Settings */}
        <div className="space-y-6">
          {/* Text */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700">Section Text</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Heading</label>
              <input
                value={heading}
                onChange={e => setHeading(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition"
                placeholder="Featured Collection"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Subheading</label>
              <input
                value={subheading}
                onChange={e => setSubheading(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition"
                placeholder="Curated pieces for you"
              />
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700 mb-4">Section Image</h3>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImagePreview(''); setExistingImage(''); setImageFile(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] transition text-gray-400 hover:text-[#D4AF37]"
              >
                <ImageIcon size={28} />
                <span className="text-xs font-semibold uppercase tracking-wider">Upload Image</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            {imagePreview && (
              <button onClick={() => fileRef.current?.click()} className="text-xs text-[#D4AF37] hover:underline mt-2 block">
                Change image
              </button>
            )}
          </div>

          {/* Active toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-gray-800">Section Visibility</p>
              <p className="text-xs text-gray-400 mt-0.5">Show this section on the homepage</p>
            </div>
            <button onClick={() => setIsActive(v => !v)}>
              {isActive
                ? <ToggleRight size={36} className="text-[#D4AF37]" />
                : <ToggleLeft size={36} className="text-gray-300" />}
            </button>
          </div>
        </div>

        {/* RIGHT: Product Picker */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700">
              Products <span className="text-[#D4AF37]">({selectedProducts.length}/8)</span>
            </h3>
          </div>

          {/* Selected chips */}
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
              {selectedProducts.map(p => (
                <div key={p._id} className="flex items-center gap-1.5 bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                  {p.name}
                  <button onClick={() => toggleProduct(p)}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          {/* Product list */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filtered.map(p => {
              const isSelected = selectedProducts.some(s => s._id === p._id);
              return (
                <button
                  key={p._id}
                  onClick={() => toggleProduct(p)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left
                    ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.category?.name}</p>
                  </div>
                  {isSelected && <Plus size={14} className="text-[#D4AF37] rotate-45 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { X, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminPageWrapper from '../../components/AdminPageWrapper';
import ProductPicker from '../../components/ProductPicker';
import { getFeaturedSection, saveFeaturedSection } from '@/actions/homepageSections';

export default function FeaturedSectionAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heading, setHeading] = useState('Featured Collection');
  const [subheading, setSubheading] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [existingImage, setExistingImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const fileRef = useRef(null);

  useEffect(() => {
    getFeaturedSection().then(section => {
      if (section) {
        setHeading(section.heading || 'Featured Collection');
        setSubheading(section.subheading || '');
        setIsActive(section.isActive ?? true);
        setExistingImage(section.image || '');
        setImagePreview(section.image || '');
        setSelectedProducts(section.products || []);
      }
      setLoading(false);
    });
  }, []);

  // Stable callback — ProductPicker won't re-render when other state changes
  const handleProductsChange = useCallback((products) => {
    setSelectedProducts(products);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
    toast[result.success ? 'success' : 'error'](
      result.success ? 'Featured section saved!' : (result.error || 'Failed to save')
    );
    if (result.success) setImageFile(null);
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminPageWrapper title="Featured Section" subtitle="Loading…">
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Featured Section"
      subtitle="Image + heading + products shown on the homepage"
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors disabled:opacity-50 rounded-lg"
        >
          {saving ? 'Saving…' : 'Save Changes'}
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="Featured Collection"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Subheading</label>
              <input
                value={subheading}
                onChange={e => setSubheading(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="Curated pieces for you"
              />
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700 mb-4">Section Image</h3>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-4/3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImagePreview(''); setExistingImage(''); setImageFile(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-4/3 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] transition-colors text-gray-400 hover:text-[#D4AF37]"
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

        {/* RIGHT: Fast product picker */}
        <ProductPicker selected={selectedProducts} onChange={handleProductsChange} />

      </div>
    </AdminPageWrapper>
  );
}

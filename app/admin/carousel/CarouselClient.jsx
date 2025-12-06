'use client';

import { addSlide, deleteSlide } from '@/app/actions';
import { useRef, useState, useEffect } from 'react';
import { 
  Trash2, UploadCloud, Loader2, Link as LinkIcon, 
  Smartphone, Monitor, Image as ImageIcon, ExternalLink,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ notification, onClose }) => {
  if (!notification) return null;

  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="fixed top-6 right-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border ${bgColors[notification.type]}`}
      >
        {notification.type === 'success' ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
        <div>
          <h4 className="text-sm font-bold capitalize">{notification.title}</h4>
          <p className="text-xs opacity-90">{notification.message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><XCircle size={14}/></button>
      </motion.div>
    </div>
  );
};

export default function CarouselClient({ slides }) {
  const formRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Preview State
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); 
  const [notification, setNotification] = useState(null); // Notification State

  // Clear notification after 3s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'desktop') setDesktopPreview(url);
      if (type === 'mobile') setMobilePreview(url);
    }
  };

  async function handleAdd(formData) {
    setIsUploading(true);
    try {
      const res = await addSlide(formData);
      if (res.error) {
        setNotification({ type: 'error', title: 'Error', message: res.error });
      } else {
        setNotification({ type: 'success', title: 'Success', message: 'Slide added successfully' });
        formRef.current?.reset();
        setDesktopPreview(null);
        setMobilePreview(null);
      }
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: 'Something went wrong.' });
    } finally { 
      setIsUploading(false); 
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-gray-900 font-manrope pb-20 relative">
      
      {/* Notifications */}
      <AnimatePresence>
        {notification && <Toast notification={notification} onClose={() => setNotification(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div>
          <h2 className="text-2xl font-playfair font-bold">Carousel Manager</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Desktop Viewport Preview</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-md transition ${viewMode === 'desktop' ? 'bg-white shadow text-black' : 'text-gray-400'}`}><Monitor size={18}/></button>
            <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-md transition ${viewMode === 'mobile' ? 'bg-white shadow text-black' : 'text-gray-400'}`}><Smartphone size={18}/></button>
          </div>
          <div className="text-xs font-bold bg-black text-white px-3 py-1 rounded">
            {slides.length} SLIDES
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: UPLOAD & PREVIEW */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* THE PREVIEW CONTAINER - EXACT RATIO SIMULATION */}
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 mb-1">
              {viewMode === 'desktop' ? <Monitor size={14} className="text-gray-400" /> : <Smartphone size={14} className="text-gray-400" />}
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {viewMode === 'desktop' ? 'Desktop (1920 x 1000px)' : 'Mobile (390 x 764px)'}
              </span>
            </div>
            
            <div className={`relative w-full bg-gray-100 overflow-hidden group mx-auto ${viewMode === 'desktop' ? 'aspect-[1.92/1]' : 'aspect-[0.51/1] max-w-[390px]'}`}>
              {/* Show correct preview based on mode */}
              {(viewMode === 'desktop' ? desktopPreview : (mobilePreview || desktopPreview)) ? (
                <img 
                  src={viewMode === 'desktop' ? desktopPreview : (mobilePreview || desktopPreview)} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Preview" 
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={64} className="opacity-20 mb-4"/>
                  <span className="text-sm font-bold uppercase tracking-widest opacity-50">Preview Area</span>
                  <span className="text-xs mt-2 opacity-40">Images will be cropped to fit this box</span>
                </div>
              )}
            </div>
          </div>

          {/* UPLOAD CONTROLS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Upload New Slide</h3>
            <form ref={formRef} action={handleAdd} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Desktop Image <span className="text-red-500">*</span></label>
                  <input type="file" name="image" accept="image/*" onChange={(e) => handleImageChange(e, 'desktop')} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-black hover:file:bg-gray-200 cursor-pointer border border-gray-200 rounded-lg py-2" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Mobile Image (Optional)</label>
                  <input type="file" name="mobileImage" accept="image/*" onChange={(e) => handleImageChange(e, 'mobile')} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-black hover:file:bg-gray-200 cursor-pointer border border-gray-200 rounded-lg py-2" />
                </div>
              </div>

              <div className="flex gap-6 items-end">
                <div className="flex-[2]">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Destination Link</label>
                  <div className="flex items-center gap-3 border border-gray-200 p-3 rounded-lg focus-within:border-black transition-colors bg-white">
                    <LinkIcon size={16} className="text-gray-400" />
                    <input name="link" placeholder="/collections/winter" className="flex-1 text-sm outline-none font-medium text-gray-800 placeholder-gray-300" />
                  </div>
                </div>
                <button disabled={isUploading} className="flex-1 bg-black text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                  {isUploading ? <Loader2 className="animate-spin" size={16}/> : 'PUBLISH'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: ACTIVE SLIDES */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">History</h3>
          
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {slides.map((slide) => (
              <div key={slide._id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-gray-300">
                
                {/* Mini Preview */}
                <div className="relative w-full aspect-[1.92/1] bg-gray-100">
                  <img 
                    src={slide.imageDesktop} 
                    alt="Slide" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                  
                  {/* Link Badge */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <ExternalLink size={8} /> {slide.link}
                  </div>
                </div>

                {/* Delete Action (FIXED ID HERE) */}
                <div className="p-3 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-mono">
                    ID: {slide._id ? slide._id.slice(-6) : '...'}
                  </span>
                  <button 
                    onClick={() => deleteSlide(slide._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Remove Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {slides.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 font-medium text-sm">No active slides</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
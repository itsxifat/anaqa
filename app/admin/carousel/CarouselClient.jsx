'use client';

import { addSlide, deleteSlide } from '@/app/actions';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, UploadCloud, Loader2, 
  Smartphone, Monitor, Image as ImageIcon, MousePointer2, Link as LinkIcon,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

// ... (KEEP ALL YOUR EXISTING CONSTANTS: FONTS, BUTTON_SIZES, SCREEN RATIOS) ...
const DESKTOP_RATIO = 1920 / 920; 
const MOBILE_RATIO = 390 / 750;

const FONTS = [
  { label: 'Manrope', val: 'font-manrope' },
  { label: 'Playfair', val: 'font-playfair' },
  { label: 'Montserrat', val: 'font-montserrat' },
  { label: 'Cinzel', val: 'font-cinzel' },
  { label: 'Bodoni', val: 'font-bodoni' },
];

const BUTTON_SIZES = [
  { label: 'Small', val: 'text-xs md:text-sm' },
  { label: 'Medium', val: 'text-sm md:text-base' },
  { label: 'Large', val: 'text-base md:text-lg' },
  { label: 'X-Large', val: 'text-lg md:text-xl' },
];

// --- TOAST COMPONENT ---
const Toast = ({ notification, onClose }) => {
  if (!notification) return null;

  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-green-600" />,
    error: <XCircle size={18} className="text-red-600" />,
    warning: <AlertCircle size={18} className="text-yellow-600" />,
  };

  return (
    <div className="fixed top-6 right-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border ${bgColors[notification.type] || bgColors.success}`}
      >
        {icons[notification.type]}
        <div>
          <h4 className="text-sm font-bold">{notification.title}</h4>
          <p className="text-xs opacity-90">{notification.message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
          <XCircle size={14} />
        </button>
      </motion.div>
    </div>
  );
};

export default function CarouselClient({ slides }) {
  const formRef = useRef(null);
  const containerWrapperRef = useRef(null);
  const containerRef = useRef(null);
  
  // State
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null); // For Toasts
  
  const [previewImage, setPreviewImage] = useState(null);
  const [previewMobileImage, setPreviewMobileImage] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(10);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showButton, setShowButton] = useState(true);

  // Button State
  const [btn, setBtn] = useState({
    text: 'SHOP NOW',
    link: '/',
    x: 50, y: 85,
    color: '#000000',
    bgColor: '#ffffff',
    fontSize: 'text-sm md:text-base',
    fontFamily: 'font-manrope',
    fontWeight: 'font-bold',
    isUppercase: true,
    letterSpacing: 'tracking-widest',
    borderRadius: 0,
    paddingX: 40,
    paddingY: 16,
    hasShadow: false,
  });

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Scale Logic (Existing)
  useEffect(() => {
    const handleResize = () => {
      if (!containerWrapperRef.current || !containerRef.current) return;
      const wrapper = containerWrapperRef.current;
      const container = containerRef.current;
      const availW = wrapper.clientWidth - 48;
      const availH = wrapper.clientHeight - 48;
      const targetRatio = previewMode === 'desktop' ? DESKTOP_RATIO : MOBILE_RATIO;
      let newW = availW;
      let newH = newW / targetRatio;
      if (newH > availH) {
        newH = availH;
        newW = newH * targetRatio;
      }
      container.style.width = `${newW}px`;
      container.style.height = `${newH}px`;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [previewMode]);

  // Image Handler with Validation
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Client-Side Size Check (e.g., 9MB limit to be safe)
      if (file.size > 9 * 1024 * 1024) {
        setNotification({ 
          type: 'error', 
          title: 'File Too Large', 
          message: 'Image must be under 9MB' 
        });
        e.target.value = ""; // Reset input
        return;
      }
      
      const url = URL.createObjectURL(file);
      if (type === 'mobile') setPreviewMobileImage(url);
      else setPreviewImage(url);
    }
  };

  const handleDragEnd = (_, info) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = info.point.x - rect.left;
    const relativeY = info.point.y - rect.top;
    const xPercent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setBtn(prev => ({ ...prev, x: xPercent, y: yPercent }));
  };

  const updateBtn = (updates) => setBtn(prev => ({ ...prev, ...updates }));

  // --- SUBMIT HANDLER ---
  async function handleAdd(formData) {
    setIsUploading(true);
    
    // Prepare Data
    formData.set('buttonLayer', JSON.stringify(btn));
    formData.set('showButton', showButton);
    formData.set('overlayOpacity', overlayOpacity);

    try {
      const res = await addSlide(formData);
      
      if (res.error) {
        // Show Error Toast
        setNotification({ type: 'error', title: 'Error', message: res.error });
      } else {
        // Show Success Toast & Reset
        setNotification({ type: 'success', title: 'Success', message: 'Slide published successfully' });
        formRef.current?.reset();
        setPreviewImage(null);
        setPreviewMobileImage(null);
        setBtn(prev => ({...prev, x: 50, y: 85}));
      }
    } catch (err) {
      // Catch "Body exceeded 1MB" or network errors
      console.error(err);
      setNotification({ 
        type: 'error', 
        title: 'Upload Failed', 
        message: 'File too large or connection error. Try a smaller image.' 
      });
    } finally { 
      setIsUploading(false); 
    }
  }

  // Active Image Preview
  const activePreview = previewMode === 'mobile' 
    ? (previewMobileImage || previewImage) 
    : previewImage;

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-manrope overflow-hidden relative">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {notification && <Toast notification={notification} onClose={() => setNotification(null)} />}
      </AnimatePresence>

      {/* TOOLBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold font-playfair">Carousel Studio</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white shadow' : 'text-gray-400'}`}><Monitor size={18}/></button>
            <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white shadow' : 'text-gray-400'}`}><Smartphone size={18}/></button>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          {slides.length} Slides Active
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* CENTER: CANVAS */}
        <div ref={containerWrapperRef} className="flex-1 bg-[#e5e5e5] relative flex items-center justify-center overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          
          <div 
            ref={containerRef}
            className={`
              bg-gray-900 shadow-2xl relative overflow-hidden transition-all duration-300
              ${previewMode === 'mobile' ? 'rounded-[2rem] border-[8px] border-gray-800' : 'rounded-md shadow-[0_0_50px_rgba(0,0,0,0.2)]'}
            `}
          >
            {/* Background Image */}
            {activePreview ? (
              <img src={activePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-4">
                <ImageIcon size={64} className="opacity-50"/>
                <span className="text-xl font-bold tracking-widest uppercase">
                  {previewMode === 'mobile' ? 'Mobile View' : 'Desktop View'}
                </span>
                <span className="text-xs opacity-70">Upload image to see preview</span>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOpacity / 100 }} />

            {/* Draggable Button */}
            {showButton && (
              <motion.div
                drag
                dragMomentum={false} 
                onDragEnd={handleDragEnd}
                style={{ 
                  position: 'absolute', 
                  left: `${btn.x}%`, 
                  top: `${btn.y}%`,
                  x: '-50%', y: '-50%',
                  zIndex: 50,
                  cursor: 'move'
                }}
              >
                <button 
                  className={`
                    whitespace-nowrap transition-all duration-300 pointer-events-none
                    ${btn.fontSize} ${btn.fontFamily} ${btn.fontWeight}
                    ${btn.isUppercase ? 'uppercase' : ''} ${btn.letterSpacing}
                    ${btn.hasShadow ? 'shadow-xl' : 'shadow-sm'}
                  `}
                  style={{ 
                    backgroundColor: btn.bgColor, 
                    color: btn.color, 
                    borderRadius: `${btn.borderRadius}px`,
                    padding: `${btn.paddingY}px ${btn.paddingX}px`,
                    border: btn.bgColor === 'transparent' ? `1px solid ${btn.color}` : 'none'
                  }}
                >
                  {btn.text}
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* --- RIGHT: PROPERTIES --- */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto flex flex-col shrink-0 z-30">
          <form ref={formRef} action={handleAdd} className="flex flex-col gap-6">
            
            {/* Uploads */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Desktop Image</label>
              <input type="file" name="image" accept="image/*" onChange={(e) => handleImageChange(e, 'desktop')} className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" required />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Mobile Image (Optional)</label>
              <input type="file" name="mobileImage" accept="image/*" onChange={(e) => handleImageChange(e, 'mobile')} className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
            </div>

            <div className="border-b border-gray-100 pb-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex justify-between">
                <span>Overlay Opacity</span> <span>{overlayOpacity}%</span>
              </label>
              <input type="range" min="0" max="90" value={overlayOpacity} onChange={(e) => setOverlayOpacity(e.target.value)} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
            </div>

            {/* Button Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">Show Button</span>
              <button 
                type="button" 
                onClick={() => setShowButton(!showButton)}
                className={`w-10 h-5 rounded-full relative transition-colors ${showButton ? 'bg-black' : 'bg-gray-300'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${showButton ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Button Settings (Conditional) */}
            {showButton && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Label & Link</label>
                  <input value={btn.text} onChange={(e) => updateBtn({ text: e.target.value })} className="w-full border p-2 rounded text-sm mb-2" placeholder="Text" />
                  <input value={btn.link} onChange={(e) => updateBtn({ link: e.target.value })} className="w-full border p-2 rounded text-sm" placeholder="Link (e.g. /shop)" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Font</label>
                    <select value={btn.fontFamily} onChange={(e) => updateBtn({ fontFamily: e.target.value })} className="w-full border p-2 rounded text-xs bg-white">
                      {FONTS.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Style</label>
                    <button type="button" onClick={() => updateBtn({ isUppercase: !btn.isUppercase })} className={`w-full border p-2 rounded text-xs ${btn.isUppercase ? 'bg-black text-white' : ''}`}>CAPS</button>
                  </div>
                </div>

                {/* Colors */}
                <div className="flex gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">BG</label>
                    <input type="color" value={btn.bgColor} onChange={(e) => updateBtn({ bgColor: e.target.value })} className="h-8 w-12 cursor-pointer border rounded"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Text</label>
                    <input type="color" value={btn.color} onChange={(e) => updateBtn({ color: e.target.value })} className="h-8 w-12 cursor-pointer border rounded"/>
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Radius & Size</label>
                  <input type="range" min="0" max="50" value={btn.borderRadius} onChange={(e) => updateBtn({ borderRadius: Number(e.target.value) })} className="w-full h-1 bg-gray-200 rounded mb-3"/>
                  <div className="flex gap-2">
                    <input type="number" value={btn.paddingX} onChange={(e) => updateBtn({ paddingX: Number(e.target.value) })} className="w-full border p-1 rounded text-xs" placeholder="W" />
                    <input type="number" value={btn.paddingY} onChange={(e) => updateBtn({ paddingY: Number(e.target.value) })} className="w-full border p-1 rounded text-xs" placeholder="H" />
                  </div>
                </div>
              </div>
            )}

            <button disabled={isUploading} className="w-full bg-green-600 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-700 disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="animate-spin" size={16}/> : 'PUBLISH SLIDE'}
            </button>
          </form>

          {/* List */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Gallery ({slides.length})</h4>
             <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
               {slides.map(slide => (
                 <div key={slide._id} className="flex justify-between items-center p-2 rounded bg-gray-50 border border-gray-100 text-xs group">
                   <span className="truncate max-w-[150px]">{slide.buttonLayer?.text || (slide.showButton ? "Button" : "No Button")}</span>
                   <button onClick={() => deleteSlide(slide._id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={14}/></button>
                 </div>
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
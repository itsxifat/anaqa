'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { X, Video, Image as ImageIcon, ToggleLeft, ToggleRight, Link as LinkIcon } from 'lucide-react';
import AdminPageWrapper from '../../components/AdminPageWrapper';
import ProductPicker from '../../components/ProductPicker';
import { getVideoSection, saveVideoSection } from '@/actions/homepageSections';

export default function VideoSectionAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heading, setHeading] = useState('Shop The Look');
  const [subheading, setSubheading] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [existingVideo, setExistingVideo] = useState('');
  const [existingPoster, setExistingPoster] = useState('');
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [videoMode, setVideoMode] = useState('upload');
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const videoRef = useRef(null);
  const posterRef = useRef(null);

  useEffect(() => {
    getVideoSection().then(section => {
      if (section) {
        setHeading(section.heading || 'Shop The Look');
        setSubheading(section.subheading || '');
        setIsActive(section.isActive ?? true);
        setExistingVideo(section.videoUrl || '');
        setExistingPoster(section.videoPoster || '');
        setPosterPreview(section.videoPoster || '');
        if (section.videoUrl?.startsWith('http')) {
          setExternalVideoUrl(section.videoUrl);
          setVideoMode('url');
        }
        setSelectedProducts(section.products || []);
      }
      setLoading(false);
    });
  }, []);

  const handleProductsChange = useCallback((products) => {
    setSelectedProducts(products);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('heading', heading);
    fd.append('subheading', subheading);
    fd.append('isActive', String(isActive));
    fd.append('existingVideo', existingVideo);
    fd.append('existingPoster', existingPoster);
    if (videoMode === 'url') {
      fd.append('externalVideoUrl', externalVideoUrl);
    } else if (videoFile) {
      fd.append('video', videoFile);
    }
    if (posterFile) fd.append('poster', posterFile);
    selectedProducts.forEach(p => fd.append('products', p._id));

    const result = await saveVideoSection(fd);
    toast[result.success ? 'success' : 'error'](
      result.success ? 'Video section saved!' : (result.error || 'Failed to save')
    );
    if (result.success) { setVideoFile(null); setPosterFile(null); }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminPageWrapper title="Video Section" subtitle="Loading…">
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Video Section"
      subtitle="Video + products shown on the homepage"
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
                placeholder="Shop The Look"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Subheading</label>
              <input
                value={subheading}
                onChange={e => setSubheading(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="Style from our latest drops"
              />
            </div>
          </div>

          {/* Video Source */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700">Video Source</h3>
            <div className="flex gap-2">
              {['upload', 'url'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setVideoMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-colors
                    ${videoMode === mode ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  {mode === 'upload' ? <Video size={14} /> : <LinkIcon size={14} />}
                  {mode === 'upload' ? 'Upload File' : 'External URL'}
                </button>
              ))}
            </div>

            {videoMode === 'upload' ? (
              <>
                {videoFile ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <Video size={16} className="text-[#D4AF37]" />
                    <span className="text-xs text-gray-700 truncate flex-1">{videoFile.name}</span>
                    <button onClick={() => setVideoFile(null)}><X size={14} className="text-gray-400 hover:text-red-500" /></button>
                  </div>
                ) : existingVideo && !existingVideo.startsWith('http') ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <Video size={16} className="text-[#D4AF37]" />
                    <span className="text-xs text-gray-700 truncate flex-1">{existingVideo}</span>
                    <button onClick={() => setExistingVideo('')}><X size={14} className="text-gray-400 hover:text-red-500" /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => videoRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 hover:border-[#D4AF37] transition-colors text-gray-400 hover:text-[#D4AF37]"
                  >
                    <Video size={24} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Upload Video</span>
                    <span className="text-[10px]">MP4, WebM recommended</span>
                  </button>
                )}
                <input ref={videoRef} type="file" accept="video/*" className="hidden"
                  onChange={e => setVideoFile(e.target.files?.[0] || null)} />
              </>
            ) : (
              <input
                value={externalVideoUrl}
                onChange={e => setExternalVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-colors"
              />
            )}
          </div>

          {/* Poster */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700 mb-4">Video Poster (thumbnail)</h3>
            {posterPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterPreview} alt="Poster" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPosterPreview(''); setExistingPoster(''); setPosterFile(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => posterRef.current?.click()}
                className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] transition-colors text-gray-400 hover:text-[#D4AF37]"
              >
                <ImageIcon size={24} />
                <span className="text-xs font-semibold uppercase tracking-wider">Upload Poster</span>
              </button>
            )}
            <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setPosterFile(f); setPosterPreview(URL.createObjectURL(f)); }
            }} />
          </div>

          {/* Visibility */}
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

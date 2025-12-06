'use client';

import { useState } from 'react';
import { X, Camera, Save, Loader2, User, Phone, Mail } from 'lucide-react';
import { updateUserProfile } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";

export default function EditProfileModal({ user, isOpen, onClose }) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Helper to get correct User ID (handles both MongoDB _id and NextAuth id)
  const userId = user.id || user._id; 

  // Construct Image URL safely
  // If we have a preview, use it. 
  // Otherwise, if custom image exists (check logic), use API.
  // Fallback to Google image or UI Avatars.
  const currentImageSrc = preview || 
    (user.image && user.image.includes('googleusercontent') ? user.image : `/api/user/avatar/${userId}?t=${new Date().getTime()}`) ||
    `https://ui-avatars.com/api/?name=${user.name}`;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    const result = await updateUserProfile(formData);
    
    if (result.success) {
      await update(); // Attempt to update session
      window.location.reload(); // FORCE RELOAD to ensure new name/pic appears
    } else {
      alert("Failed to update profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none"
          >
            <div className="bg-white w-full max-w-lg p-0 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden mx-4">
              
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Update your personal details</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="p-8">
                <form action={handleSubmit} className="space-y-8">
                  <input type="hidden" name="email" value={user.email} />

                  {/* Image Upload */}
                  <div className="flex justify-center -mt-2">
                    <div className="relative group cursor-pointer">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:border-gold-500/30 transition-all duration-300">
                        {/* FIX: Handle image error by hiding/showing fallback */}
                        <img 
                          src={currentImageSrc}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.name}` }} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full cursor-pointer backdrop-blur-[2px]">
                        <Camera className="text-white drop-shadow-md" size={28} strokeWidth={1.5} />
                        <input type="file" name="image" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-5">
                    <div className="group">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        <User size={12}/> Full Name
                      </label>
                      <input name="name" defaultValue={user.name} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-black transition-all" required />
                    </div>
                    
                    <div className="group">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        <Phone size={12}/> Phone Number
                      </label>
                      <input name="phone" defaultValue={user.phone} placeholder="+1 234 567 890" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-black transition-all" />
                    </div>

                    <div className="opacity-60">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        <Mail size={12}/> Email Address
                      </label>
                      <input value={user.email} readOnly className="w-full p-4 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>

                  <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 disabled:opacity-70 transition-all flex justify-center items-center gap-3">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> SAVE CHANGES</>}
                  </button>

                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
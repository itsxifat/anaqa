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

  // Use the direct image path from session user
  const currentImageSrc = preview || user.image || `https://ui-avatars.com/api/?name=${user.name}`;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    const result = await updateUserProfile(formData);
    
    if (result.success) {
      // 1. Update session client-side
      await update(); 
      // 2. Force a reload to ensure the new image is fetched fresh from server
      setTimeout(() => {
        window.location.reload(); 
      }, 500);
    } else {
      alert("Failed to update profile.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none"
          >
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Left Side: Image & Basic Info */}
              <div className="bg-gray-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 md:w-1/3">
                <div className="relative group cursor-pointer mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-gray-200 transition-colors">
                    <img 
                      src={currentImageSrc} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.name}` }}
                    />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer">
                    <Camera className="text-white" size={24} />
                    <input type="file" name="image" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center">{user.name}</h3>
                <p className="text-xs text-gray-500 text-center">{user.email}</p>
              </div>

              {/* Right Side: Form */}
              <div className="flex-1 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <p className="text-xs text-gray-500 mt-1">Make changes to your account details.</p>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                    <X size={20} />
                  </button>
                </div>

                <form action={handleSubmit} className="flex-1 flex flex-col gap-5">
                  <input type="hidden" name="email" value={user.email} />

                  <div className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <User size={12} /> Full Name
                      </label>
                      <input 
                        name="name" 
                        defaultValue={user.name} 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                        required 
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Phone size={12} /> Phone Number
                      </label>
                      <input 
                        name="phone" 
                        defaultValue={user.phone} 
                        placeholder="+1 (555) 000-0000" 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-400" 
                      />
                    </div>

                    {/* Email Input (Read-only) */}
                    <div className="space-y-1 opacity-60">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Mail size={12} /> Email Address
                      </label>
                      <input 
                        value={user.email} 
                        readOnly 
                        className="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-lg text-sm text-gray-500 cursor-not-allowed" 
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-6 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={onClose} 
                      className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={loading} 
                      className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-70 transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
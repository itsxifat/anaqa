'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { User, Package, Heart, LogOut, Settings, CreditCard, ArrowRight } from "lucide-react";
import gsap from "gsap";
import EditProfileModal from "@/components/EditProfileModal"; 

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const containerRef = useRef(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- AUTH GUARD ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // --- GSAP ANIMATIONS ---
  useEffect(() => {
    if (status === "authenticated" && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(".anim-header", { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.1 });
        gsap.to(".anim-card", { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.05)", stagger: 0.1, delay: 0.3 });
        gsap.to(".anim-footer", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.6 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#faf9f6] pt-32 px-6 flex justify-center">
        <div className="w-full max-w-6xl animate-pulse space-y-12">
          <div className="flex justify-between items-end border-b border-gray-200 pb-8">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#faf9f6] pt-32 pb-20 px-6 font-manrope text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="anim-header opacity-0 translate-y-8 flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-gray-200 pb-8">
          <div>
            <span className="font-tenor text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 block">My Dashboard</span>
            <h1 className="font-bodoni text-4xl md:text-5xl lg:text-6xl text-black">
              Hello, {session.user?.name?.split(' ')[0] || 'Guest'}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right hidden md:block">
              <p className="font-bodoni text-lg">{session.user?.name}</p>
              <p className="font-tenor text-xs text-gray-400 tracking-wider">Member since 2025</p>
            </div>
            <div className="relative">
                <div className="absolute inset-0 rounded-full border border-gray-200 scale-110"></div>
                {session.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover relative z-10" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bodoni border-2 border-white shadow-sm relative z-10">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* 1. Profile Card */}
          <div className="anim-card opacity-0 translate-y-12 bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110">
                    <User size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-tenor text-sm uppercase tracking-widest text-gray-900 mb-2">Personal Info</h3>
                  <p className="text-gray-500 text-sm mb-1 font-medium">{session.user?.name}</p>
                  <p className="text-gray-400 text-xs mb-6">{session.user?.email}</p>
                </div>
                
                {/* --- UX FIX: Wrapper Div is now the Clickable Trigger --- */}
                <div 
                  onClick={() => setIsEditOpen(true)}
                  className="border-t border-gray-100 pt-4 flex items-center justify-between group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black group-hover:text-gold-600 transition-colors">
                      Edit Profile
                    </span>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-black transition-colors"/>
                </div>
            </div>
          </div>

          {/* 2. Orders Card */}
          <div className="anim-card opacity-0 translate-y-12 bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white border border-gray-100 text-black rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#D4AF37] group-hover:text-white group-hover:border-transparent transition-all duration-500">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-tenor text-sm uppercase tracking-widest text-gray-900 mb-2">My Orders</h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">Track, return, or buy things again.</p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">View History</span>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-black transition-colors"/>
                </div>
            </div>
          </div>

          {/* 3. Wishlist Card */}
          <div className="anim-card opacity-0 translate-y-12 bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white border border-gray-100 text-black rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-black group-hover:text-white group-hover:border-transparent transition-all duration-500">
                    <Heart size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-tenor text-sm uppercase tracking-widest text-gray-900 mb-2">Wishlist</h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">Your curated collection of favorites.</p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">View Saved</span>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-black transition-colors"/>
                </div>
            </div>
          </div>

        </div>

        {/* --- FOOTER --- */}
        <div className="anim-footer opacity-0 translate-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <div className="bg-white px-8 py-6 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-300 transition-all cursor-pointer group hover:shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-gray-50 rounded-full text-gray-500 group-hover:bg-black group-hover:text-white transition-colors">
                            <Settings size={18} />
                        </div>
                        <div>
                            <span className="font-bodoni text-lg text-gray-900 block">Account Settings</span>
                            <span className="text-xs text-gray-400">Password, Email, Notifications</span>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all"/>
                </div>
                
                <div className="bg-white px-8 py-6 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-300 transition-all cursor-pointer group hover:shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-gray-50 rounded-full text-gray-500 group-hover:bg-black group-hover:text-white transition-colors">
                            <CreditCard size={18} />
                        </div>
                        <div>
                            <span className="font-bodoni text-lg text-gray-900 block">Payment Methods</span>
                            <span className="text-xs text-gray-400">Manage cards & billing</span>
                        </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all"/>
                </div>
            </div>

            <div className="text-center border-t border-gray-200 pt-12">
                <button 
                    onClick={() => signOut({ callbackUrl: '/' })} 
                    className="group relative inline-flex items-center justify-center gap-3 px-12 py-4 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform"/>
                    <span>Sign Out</span>
                </button>
                <p className="mt-6 text-[10px] text-gray-300 uppercase tracking-[0.2em]">Securely logged in to ANAQA</p>
            </div>
        </div>

      </div>

      {/* RENDER MODAL */}
      <EditProfileModal 
        user={session.user} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />
    </div>
  );
}
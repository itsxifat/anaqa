'use client';

import { signupAction } from "@/app/authActions";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, User, Mail, Phone, Lock, ArrowRight, AlertCircle } from "lucide-react";
import gsap from "gsap";

export default function SignupPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- GSAP ANIMATION ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".anim-item", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    
    // We use a FormData object if passing directly to server action
    // But here we need to wrap it to prevent default submission behavior if using onSubmit
    const res = await signupAction(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
      // Shake animation on error
      gsap.fromTo(".error-box", { x: -10 }, { x: 0, duration: 0.1, repeat: 5, yoyo: true });
    } else {
      router.push(`/verify?email=${encodeURIComponent(formData.get('email'))}`);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-[#faf9f6] font-manrope px-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[100px]" />

      <div className="anim-item bg-white p-10 md:p-12 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-white/60 backdrop-blur-xl w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="anim-item font-tenor text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 block">Join ANAQA</span>
          <h1 className="anim-item text-3xl md:text-4xl font-bodoni font-medium text-gray-900">Create Account</h1>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="error-box bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-xs font-medium rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="space-y-5">
          
          <div className="anim-item relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input name="name" type="text" placeholder="Full Name" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-gray-300 focus:ring-0 transition-all placeholder:text-gray-400" />
          </div>

          <div className="anim-item relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input name="email" type="email" placeholder="Email Address" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-gray-300 focus:ring-0 transition-all placeholder:text-gray-400" />
          </div>

          <div className="anim-item relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input name="phone" type="tel" placeholder="Phone Number" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-gray-300 focus:ring-0 transition-all placeholder:text-gray-400" />
          </div>

          <div className="anim-item relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input name="password" type="password" placeholder="Password" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-gray-300 focus:ring-0 transition-all placeholder:text-gray-400" />
          </div>
          
          <div className="anim-item pt-2">
            <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] hover:bg-gray-800 disabled:opacity-70 flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>Sign Up <ArrowRight size={14} className="text-gray-400" /></>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="anim-item text-center mt-8">
          <p className="text-xs text-gray-500">
            Already have an account? <Link href="/login" className="text-black font-bold uppercase tracking-wider border-b border-black/20 hover:border-black transition-all pb-0.5 ml-1">Log In</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
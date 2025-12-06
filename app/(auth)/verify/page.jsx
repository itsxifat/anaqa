'use client';

import { verifyOtpAction } from "@/app/authActions";
import { useState, Suspense, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, ArrowRight, AlertTriangle } from "lucide-react";
import gsap from "gsap";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const containerRef = useRef(null);
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // --- GSAP ENTRANCE ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".anim-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleVerify = async () => {
    if(!otp) return;
    setLoading(true);
    setMessage("");

    const res = await verifyOtpAction(email, otp);
    
    if (res.error) {
      setMessage(res.error);
      setIsSuccess(false);
      setLoading(false);
      // Shake animation
      gsap.fromTo(".msg-box", { x: -5 }, { x: 5, duration: 0.1, repeat: 5, yoyo: true });
    } else {
      setIsSuccess(true);
      setMessage("Verified Successfully!");
      // Success animation
      gsap.to(".verify-btn", { scale: 0.95, duration: 0.2, yoyo: true, repeat: 1 });
      setTimeout(() => router.push('/login?verified=true'), 1000);
    }
  };

  return (
    <div ref={containerRef} className="bg-white p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 w-full max-w-sm text-center relative z-10">
      
      <div className="anim-item w-16 h-16 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <ShieldCheck size={32} strokeWidth={1.5} />
      </div>

      <h1 className="anim-item text-3xl font-bodoni font-medium text-gray-900 mb-2">Verify Email</h1>
      <p className="anim-item text-gray-400 text-xs font-manrope tracking-wide mb-8">
        We sent a 6-digit code to <br/> <span className="font-bold text-gray-800">{email}</span>
      </p>

      {message && (
        <div className={`msg-box anim-item px-4 py-2 text-xs font-bold rounded-lg mb-6 flex items-center justify-center gap-2 ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {isSuccess ? <ShieldCheck size={14}/> : <AlertTriangle size={14}/>}
          {message}
        </div>
      )}

      <div className="anim-item relative mb-8">
        <input 
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Only numbers
          className="w-full text-center text-3xl tracking-[0.5em] font-bodoni font-bold border-b-2 border-gray-200 focus:border-black outline-none py-3 bg-transparent transition-colors placeholder:tracking-normal placeholder:font-manrope placeholder:text-sm placeholder:font-normal placeholder:text-gray-300" 
          maxLength={6}
          placeholder="Enter 6 Digits"
        />
      </div>

      <button 
        onClick={handleVerify} 
        disabled={loading || otp.length < 6} 
        className="verify-btn anim-item w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : (
          <>Verify <ArrowRight size={14} className="text-gray-400" /></>
        )}
      </button>

      <p className="anim-item mt-6 text-[10px] text-gray-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors">
        Resend Code
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] font-manrope relative overflow-hidden px-4">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-[#faf9f6] to-[#faf9f6] -z-0" />
      <Suspense fallback={<div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full"></div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
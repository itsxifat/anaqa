'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await signIn("credentials", { 
      email, password, redirect: false 
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/"); // Redirect to home
    }
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] font-manrope px-4 relative overflow-hidden">
      
      {/* Background Decor (Subtle Gradients) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-100/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-gray-200/40 rounded-full blur-[100px]" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-white/50 backdrop-blur-xl w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <span className="font-tenor text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 block">ANAQA Member</span>
          <h1 className="text-3xl md:text-4xl font-bodoni font-medium text-gray-900">Welcome Back</h1>
        </motion.div>
        
        {/* Error Message Animation */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 24 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className="bg-red-50 text-red-600 px-4 py-3 text-xs font-medium rounded-lg flex items-center gap-2 overflow-hidden"
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleCredentialsLogin} className="space-y-5">
          
          {/* Email Input */}
          <motion.div variants={itemVariants} className="space-y-1">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
              <input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-gray-300 focus:ring-0 transition-all placeholder:text-gray-400" 
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:border-gray-300 focus:ring-0 transition-all placeholder:text-gray-400" 
              />
            </div>
            <div className="flex justify-end mt-1">
              <Link href="#" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                Forgot Password?
              </Link>
            </div>
          </motion.div>

          {/* Sign In Button */}
          <motion.div variants={itemVariants} className="pt-2">
            <button 
              disabled={loading} 
              className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  Sign In <ArrowRight size={14} className="text-gray-400" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Divider */}
        <motion.div variants={itemVariants} className="relative my-8 text-center">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100"></div>
          <span className="bg-white px-3 relative z-10 text-[10px] text-gray-400 uppercase tracking-widest font-medium">Or continue with</span>
        </motion.div>

        {/* Google Button */}
        <motion.div variants={itemVariants}>
          <button 
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full bg-white border border-gray-200 py-3.5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>
        </motion.div>

        {/* Footer Link */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-black font-bold uppercase tracking-wider border-b border-black/20 hover:border-black transition-all pb-0.5 ml-1">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
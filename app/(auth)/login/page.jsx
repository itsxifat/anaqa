'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/"); // Redirect to home
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-manrope">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h1 className="text-3xl font-playfair font-bold text-center mb-6">Welcome Back</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 text-sm rounded mb-4">{error}</div>}

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <input name="email" type="email" placeholder="Email Address" required className="w-full border p-3 rounded-lg text-sm" />
          <input name="password" type="password" placeholder="Password" required className="w-full border p-3 rounded-lg text-sm" />
          <button disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-gray-800 disabled:opacity-50 flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="relative my-6 text-center text-xs text-gray-400 uppercase tracking-widest">
          <span className="bg-white px-2 relative z-10">Or continue with</span>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100 -z-0"></div>
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full border border-gray-200 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          {/* Use a Google SVG icon here */}
          <span>Google</span>
        </button>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don't have an account? <Link href="/signup" className="text-black font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
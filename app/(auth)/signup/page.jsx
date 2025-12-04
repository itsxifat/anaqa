'use client';

import { signupAction } from "@/app/authActions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    
    const res = await signupAction(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Redirect to verification page with email
      router.push(`/verify?email=${encodeURIComponent(res.email)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-manrope">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <h1 className="text-3xl font-playfair font-bold text-center mb-6">Create Account</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 text-sm rounded mb-4">{error}</div>}

        <form action={handleSubmit} className="space-y-4">
          <input name="name" type="text" placeholder="Full Name" required className="w-full border p-3 rounded-lg text-sm" />
          <input name="email" type="email" placeholder="Email Address" required className="w-full border p-3 rounded-lg text-sm" />
          <input name="phone" type="tel" placeholder="Phone Number" required className="w-full border p-3 rounded-lg text-sm" />
          <input name="password" type="password" placeholder="Password" required className="w-full border p-3 rounded-lg text-sm" />
          
          <button disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-gray-800 disabled:opacity-50 flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Already have an account? <Link href="/login" className="text-black font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
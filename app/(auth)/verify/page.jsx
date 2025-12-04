'use client';

import { verifyOtpAction } from "@/app/authActions";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Wrap in Suspense for useSearchParams
function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    const res = await verifyOtpAction(email, otp);
    if (res.error) {
      setMessage(res.error);
      setLoading(false);
    } else {
      router.push('/login?verified=true');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm text-center">
      <h1 className="text-2xl font-playfair font-bold mb-2">Verify Email</h1>
      <p className="text-gray-500 text-xs mb-6">Enter the code sent to {email}</p>

      {message && <p className="text-red-500 text-xs mb-4">{message}</p>}

      <input 
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full text-center text-2xl tracking-[0.5em] font-bold border-b-2 border-gray-200 focus:border-black outline-none py-2 mb-6" 
        maxLength={6}
        placeholder="000000"
      />

      <button onClick={handleVerify} disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-gray-800 disabled:opacity-50 flex justify-center">
        {loading ? <Loader2 className="animate-spin" /> : "Verify"}
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-manrope">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
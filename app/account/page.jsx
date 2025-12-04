'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen pt-32 px-6 max-w-4xl mx-auto font-manrope">
      <h1 className="text-4xl font-playfair font-bold mb-2">My Account</h1>
      <p className="text-gray-500 mb-8">Welcome back, {session?.user?.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-4">Profile</h3>
          <p className="font-bold">{session?.user?.name}</p>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-4">Orders</h3>
          <p className="text-sm text-gray-500">No recent orders.</p>
        </div>
      </div>

      <button 
        onClick={() => signOut({ callbackUrl: '/' })} 
        className="mt-8 px-6 py-3 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800"
      >
        Sign Out
      </button>
    </div>
  );
}
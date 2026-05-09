import AdminSidebar from './components/AdminSidebar';
import AdminLoginPage from './login/page'; 
import { verifyAdminToken, authOptions } from '@/lib/auth';
import { getServerSession } from "next-auth";
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

export default async function AdminLayout({ children }) {
  // 1. Check Legacy Master Key
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  let isLegacyAdmin = false;
  
  if (token) {
    const verified = await verifyAdminToken(token);
    if (verified) isLegacyAdmin = true;
  }

  // 2. Check User Account (NextAuth) - DEEP VERIFICATION
  let isAccountAdmin = false;
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    // If session says admin, trust it
    if (session.user.role === 'admin') {
      isAccountAdmin = true;
    } 
    // FALLBACK: If session is stale (says 'user'), check DB directly to see if they were promoted
    else {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email }).select('role');
      if (dbUser && dbUser.role === 'admin') {
        isAccountAdmin = true;
      }
    }
  }

  // 3. Authenticate
  const isAuthenticated = isLegacyAdmin || isAccountAdmin;

  // 4. Render Login if failed (Render-in-Place, prevents redirect loops)
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  // 5. Render Dashboard
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* main is the sole scroll container — keeps the fixed sidebar composited separately
          so the browser can GPU-accelerate scroll without repainting the sidebar */}
      <main className="flex-1 lg:ml-[280px] h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
import { cookies } from 'next/headers';
import LoginForm from './LoginForm';
import AdminSidebar from './components/AdminSidebar';
import { verifyAdminToken } from '@/lib/auth'; // IMPORT SECURITY CHECK

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  // UPDATED: Verify the secure token instead of checking for "true"
  const isLoggedIn = token && (await verifyAdminToken(token));

  // If validation fails, show Login Form
  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-manrope">
      <AdminSidebar />
      <main className="flex-1 transition-all duration-300 pt-16 lg:pt-0 lg:ml-72">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
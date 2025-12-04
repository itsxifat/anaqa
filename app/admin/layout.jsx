import { cookies } from 'next/headers';
import LoginForm from './LoginForm';
import AdminSidebar from './components/AdminSidebar';

export default async function AdminLayout({ children }) {
  // Await cookies in Next.js 15+
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

  // If not logged in, show Login Form immediately blocking all child routes
  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-modern">
      <AdminSidebar />
      <main className="flex-1 transition-all duration-300 pt-16 lg:pt-0 lg:ml-72">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
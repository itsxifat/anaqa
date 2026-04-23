import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react';
import AdminPageWrapper from '../components/AdminPageWrapper';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await connectDB();

  const [totalOrders, pendingOrders, totalProducts, totalUsers] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'Pending' }),
    Product.countDocuments(),
    User.countDocuments({ role: 'user' }),
  ]);

  const stats = [
    { label: 'Total Orders',   value: totalOrders,    icon: Package,        color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Orders', value: pendingOrders,  icon: LayoutDashboard,color: 'bg-amber-50 text-amber-600' },
    { label: 'Products',       value: totalProducts,  icon: ShoppingBag,    color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Customers',      value: totalUsers,     icon: Users,          color: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <AdminPageWrapper title="Dashboard" subtitle="Overview of your store">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${color} p-4 rounded-xl shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{label}</p>
              <p className="text-3xl font-bodoni font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminPageWrapper>
  );
}

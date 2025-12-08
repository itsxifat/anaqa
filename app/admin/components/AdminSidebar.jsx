'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Images, 
  Settings, 
  Monitor, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  Layers, 
  Users, 
  ShoppingBag // Imported ShoppingBag icon
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarContent = ({ activePath, onClickItem }) => {
 const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag }, // Added Products Tab
  { href: '/admin/carousel', label: 'Carousel Studio', icon: Images },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/navbar', label: 'Navigation', icon: Monitor },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white border-r border-white/10">
      {/* Brand */}
      <div className="p-8 pb-10 flex justify-between items-center">
        <div>
          <h1 className="font-classic text-3xl font-bold tracking-widest text-[#D4AF37]">ANAQA</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mt-1">Admin Suite</p>
        </div>
        {onClickItem && (
          <button onClick={onClickItem} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Check if path starts with the href (for sub-routes like /admin/products/new)
          const isActive = activePath === item.href || (item.href !== '/admin/dashboard' && activePath.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClickItem}
              className={`relative flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 group
                ${isActive 
                  ? 'bg-white/5 text-[#D4AF37]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon size={18} className={isActive ? "text-[#D4AF37]" : "group-hover:text-white transition-colors"} />
              <span className="font-modern text-sm font-medium tracking-wide flex-1">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5">
        <button className="flex items-center gap-3 text-gray-500 hover:text-red-400 transition-colors w-full px-4 py-2 hover:bg-red-500/10 rounded-lg group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-black z-40 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <span className="font-classic text-xl font-bold text-[#D4AF37]">ANAQA</span>
        <button onClick={() => setIsOpen(true)} className="text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              variants={sidebarVariants}
              initial="closed" animate="open" exit="closed"
              className="fixed top-0 left-0 z-50 h-screen w-72 lg:hidden"
            >
              <SidebarContent activePath={pathname} onClickItem={() => setIsOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-screen w-72">
        <SidebarContent activePath={pathname} />
      </aside>
    </>
  );
}
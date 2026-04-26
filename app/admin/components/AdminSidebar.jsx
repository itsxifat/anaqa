'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Images,
  Settings,
  Monitor,
  X,
  Layers,
  Users,
  ShoppingBag,
  Package,
  Ticket,
  Tag,
  LogOut,
  Menu,
  Star,
  Video,
  FileText,
  Info,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders',    label: 'Orders',    icon: Package },
      { href: '/admin/users',     label: 'Users',     icon: Users },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/products',   label: 'Products',   icon: ShoppingBag },
      { href: '/admin/categories', label: 'Categories', icon: Layers },
      { href: '/admin/tags',       label: 'Tags',       icon: Tag },
      { href: '/admin/sizes',      label: 'Sizes',      icon: Settings },
      { href: '/admin/coupons',    label: 'Coupons',    icon: Ticket },
    ],
  },
  {
    label: 'Homepage',
    items: [
      { href: '/admin/carousel',           label: 'Carousel',         icon: Images },
      { href: '/admin/homepage/featured',  label: 'Featured Section', icon: Star },
      { href: '/admin/homepage/video',     label: 'Video Section',    icon: Video },
    ],
  },
  {
    label: 'Pages',
    items: [
      { href: '/admin/pages',     label: 'All Pages',  icon: FileText },
      { href: '/admin/pages/new', label: 'New Page',   icon: Info },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/navbar',          label: 'Navigation',  icon: Monitor },
      { href: '/admin/settings',        label: 'Settings',    icon: Settings },
      { href: '/admin/settings/cookies',label: 'Cookies',     icon: Settings },
    ],
  },
];

const SidebarContent = ({ activePath, onClickItem }) => {
  const [collapsed, setCollapsed] = useState({});

  const toggle = (label) => setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white border-r border-white/5 shadow-2xl">
      {/* Brand */}
      <div className="p-8 pb-6 flex justify-between items-center">
        <div>
          <h1 className="font-bodoni text-3xl font-bold tracking-widest text-white">ANAQA</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-8 bg-[#D4AF37]" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]">Admin Suite</p>
          </div>
        </div>
        {onClickItem && (
          <button onClick={onClickItem} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-none space-y-1 pb-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {/* Group header */}
            <button
              onClick={() => toggle(group.label)}
              className="w-full flex items-center justify-between px-4 py-2 mt-3 first:mt-0"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-600">
                {group.label}
              </span>
              <ChevronDown
                size={12}
                className={`text-gray-600 transition-transform duration-300 ${collapsed[group.label] ? '-rotate-90' : ''}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {!collapsed[group.label] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-0.5"
                >
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive =
                      activePath === item.href ||
                      (item.href !== '/admin/dashboard' && activePath.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClickItem}
                        className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden
                          ${isActive
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D4AF37] rounded-r-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        <Icon
                          size={16}
                          className={`relative z-10 shrink-0 transition-colors ${isActive ? 'text-[#D4AF37]' : 'group-hover:text-white'}`}
                        />
                        <span className="font-manrope text-[11px] font-bold tracking-widest uppercase flex-1 relative z-10">
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button className="flex items-center justify-center gap-3 text-gray-500 hover:text-red-400 transition-all duration-300 w-full px-4 py-3 hover:bg-red-500/10 rounded-xl group border border-transparent hover:border-red-500/20">
          <LogOut size={15} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const sidebarVariants = {
    open:   { x: 0,      opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%',opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-[#050505]/90 backdrop-blur-md z-40 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <span className="font-bodoni text-xl font-bold text-white tracking-widest">ANAQA</span>
        <button onClick={() => setIsOpen(true)} className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/90 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              variants={sidebarVariants}
              initial="closed" animate="open" exit="closed"
              className="fixed top-0 left-0 z-50 h-screen w-[280px] lg:hidden shadow-2xl"
            >
              <SidebarContent activePath={pathname} onClickItem={() => setIsOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-screen w-[280px]">
        <SidebarContent activePath={pathname} />
      </aside>
    </>
  );
}

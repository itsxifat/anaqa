"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, User, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from "next-auth/react"; // Import Session Hook

const Navbar = ({ navData }) => {
  const { data: session } = useSession(); // Check login status
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const leaveTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (link) => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    setActiveCategory(link);
  };

  const handleMouseLeave = () => {
    leaveTimeout.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  if (!navData) return null;

  return (
    <>
      <nav 
        className={`fixed w-full z-[100] transition-all duration-500 border-b ${
          isScrolled || mobileMenuOpen || activeCategory 
            ? 'bg-white text-black border-gray-100 shadow-sm' 
            : 'bg-white/90 backdrop-blur-md text-black border-white/10 hover:bg-white'
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12">
          
          <div className="flex justify-between items-center h-20 relative">
            
            {/* Left */}
            <div className="flex items-center gap-6 flex-1">
              <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} strokeWidth={1} />
              </button>
              <div className="hidden lg:flex items-center gap-3 cursor-pointer group opacity-60 hover:opacity-100">
                <Search size={18} strokeWidth={1} />
                <span className="font-tenor text-[11px] uppercase tracking-[0.2em] pt-1">Search</span>
              </div>
            </div>

            {/* Center */}
            <div className="flex-1 text-center">
              <Link href="/" className="inline-block group">
                {navData.logoImage ? (
                  <img src={navData.logoImage} alt="Logo" className="h-10 object-contain" />
                ) : (
                  <h1 className="font-bodoni font-bold text-3xl md:text-4xl tracking-[0.15em] uppercase">
                    {navData.logoText}
                  </h1>
                )}
              </Link>
            </div>

            {/* Right: Smart Account Link */}
            <div className="flex items-center justify-end gap-6 flex-1">
              {session ? (
                // LOGGED IN STATE
                <div className="hidden lg:flex items-center gap-4">
                  <Link href="/account" className="font-tenor text-[11px] uppercase tracking-[0.2em] hover:text-gold-500 transition">
                    My Account
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    className="font-tenor text-[11px] uppercase tracking-[0.2em] text-red-500 hover:text-red-700 transition"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                // LOGGED OUT STATE
                <Link href="/login" className="hidden lg:block opacity-60 hover:opacity-100 transition">
                  <span className="font-tenor text-[11px] uppercase tracking-[0.2em]">Sign In</span>
                </Link>
              )}

              <button className="relative p-1 opacity-60 hover:opacity-100 transition">
                <ShoppingBag size={20} strokeWidth={1} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* ... (Keep the rest of the Desktop Menu logic exactly the same) ... */}
          {/* Bottom Row Navigation Code goes here (refer to previous Navbar file for the list loop) */}
          <div className="hidden lg:flex justify-center border-t border-gray-100/50">
            <div className="flex gap-12">
              {navData.links?.map((link) => (
                <div key={link._id || link.label} className="relative group/link py-5" onMouseEnter={() => link.children?.length > 0 && handleMouseEnter(link)}>
                  <Link href={link.href || '#'} className="font-tenor text-[11px] font-bold uppercase tracking-[0.15em] transition-colors text-gray-900 hover:text-gold-600">
                    {link.label}
                  </Link>
                  <span className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gold-500 transition-all duration-300 ${activeCategory?._id === link._id ? 'w-full' : 'group-hover/link:w-1/2'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ... (Keep the Mega Menu Dropdown Code) ... */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden"
              onMouseEnter={() => handleMouseEnter(activeCategory)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-12 py-16">
                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-3 border-r border-gray-100 pr-8">
                    <h2 className="font-bodoni text-4xl text-gray-900 mb-4">{activeCategory.label}</h2>
                    <Link href={activeCategory.href || '#'} className="inline-flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-widest text-gold-600 hover:text-black transition-colors">
                      View All <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-x-12 gap-y-10">
                    {activeCategory.children?.map((child) => (
                      <div key={child._id || child.label}>
                        <Link href={child.href || '#'} className="block font-playfair text-lg font-medium text-gray-900 mb-4 hover:text-gold-600 transition-colors">
                          {child.label}
                        </Link>
                        <div className="flex flex-col gap-2.5">
                          {child.children?.map((grandchild) => (
                            <Link key={grandchild._id || grandchild.label} href={grandchild.href || '#'} className="font-manrope text-[13px] text-gray-500 hover:text-black transition-all block">
                              {grandchild.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} links={navData.links || []} session={session} />
    </>
  );
};

// ... (MobileMenu component - Update the Footer part)
const MobileMenu = ({ isOpen, onClose, links, session }) => {
  // ... (keep accordion logic)
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" onClick={onClose} />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.4 }} className="fixed top-0 left-0 h-full w-[90%] max-w-[360px] bg-white z-[120] shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-8 flex justify-between items-center border-b border-gray-100">
              <span className="font-bodoni text-2xl tracking-widest text-black">MENU</span>
              <button onClick={onClose}><X size={24} /></button>
            </div>

            {/* Links Loop (Same as before) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-2">
               {/* ... (Copy loop logic from previous response) ... */}
               {links.map((link) => {
                  const hasChildren = link.children && link.children.length > 0;
                  const id = link._id || link.label;
                  return (
                    <div key={id} className="border-b border-gray-50 last:border-0">
                      <div className="flex justify-between items-center py-4 cursor-pointer" onClick={() => hasChildren ? toggleExpand(id) : onClose()}>
                        <Link href={link.href || '#'} className="font-tenor text-sm font-bold uppercase tracking-[0.2em] text-black">{link.label}</Link>
                        {hasChildren && <ChevronDown size={16} className={`transition ${expanded[id] ? 'rotate-180' : ''}`} />}
                      </div>
                      {/* Accordion Content */}
                      {hasChildren && expanded[id] && (
                        <div className="pb-4 pl-4 space-y-4">
                          {link.children.map(child => (
                            <div key={child._id || child.label}>
                              <Link href={child.href} className="block font-playfair text-base mb-2" onClick={onClose}>{child.label}</Link>
                              <div className="pl-3 border-l border-gray-100 space-y-2">
                                {child.children?.map(gc => <Link key={gc.label} href={gc.href} className="block font-manrope text-xs text-gray-500" onClick={onClose}>{gc.label}</Link>)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
               })}
            </div>

            {/* Footer with Auth Logic */}
            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col gap-4">
                {session ? (
                  <>
                    <Link href="/account" className="flex items-center gap-3 font-tenor text-xs uppercase tracking-widest text-black">
                      <User size={16} /> My Account ({session.user.name})
                    </Link>
                    <button onClick={() => signOut()} className="text-left font-tenor text-xs uppercase tracking-widest text-red-500">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-3 font-tenor text-xs uppercase tracking-widest text-black">
                    <User size={16} /> Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Navbar;
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Menu, Search, User, LogOut, ArrowRight, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from "next-auth/react";
import { useCart } from '@/lib/context/CartContext'; 
import { usePathname } from 'next/navigation';

// --- MOBILE MENU DRAWER ---
const MobileMenu = ({ isOpen, onClose, navData, session }) => {
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden"
          />
          <motion.div 
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[160] shadow-2xl overflow-y-auto lg:hidden font-manrope flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <span className="font-bodoni text-xl font-medium tracking-widest uppercase text-gray-900">
                {navData?.logoText || 'MENU'}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {navData?.links?.map((link) => (
                <div key={link.label}>
                  <div className="flex justify-between items-center group cursor-pointer" onClick={() => setActiveSub(activeSub === link.label ? null : link.label)}>
                     <Link href={link.href || '#'} onClick={(e) => { if(link.children?.length === 0) onClose(); }} className="font-tenor text-sm font-medium uppercase tracking-widest text-gray-900 group-hover:text-[#D4AF37] transition">
                       {link.label}
                     </Link>
                     {link.children?.length > 0 && (
                       <ChevronDown size={16} strokeWidth={1.5} className={`text-gray-400 transition-transform duration-300 ${activeSub === link.label ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                     )}
                  </div>
                  <AnimatePresence>
                    {activeSub === link.label && link.children && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pl-4 border-l border-gray-100 mt-3 space-y-4 py-2">
                          {link.children.map(child => (
                            <div key={child.label}>
                               <p className="font-playfair text-sm font-semibold text-gray-800 mb-2">{child.label}</p>
                               <div className="pl-2 space-y-2 flex flex-col">
                                 {child.children?.map(grandchild => (
                                   <Link key={grandchild.label} href={grandchild.href || '#'} onClick={onClose} className="text-xs font-medium text-gray-500 hover:text-[#D4AF37] uppercase tracking-wide transition-colors">
                                     {grandchild.label}
                                   </Link>
                                 ))}
                               </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-medium font-bodoni text-lg shadow-md">
                        {session.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bodoni font-medium text-gray-900 truncate">{session.user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/account" onClick={onClose} className="flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"><User size={14} /> Account</Link>
                    <Link href="/orders" onClick={onClose} className="flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"><ShoppingBag size={14} /> Orders</Link>
                  </div>
                  <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors"><LogOut size={14} /> Sign Out</button>
                </div>
              ) : (
                <Link href="/login" onClick={onClose} className="block w-full py-3 bg-black text-white text-center text-xs font-medium uppercase tracking-widest hover:bg-[#D4AF37] transition-colors shadow-md rounded-sm">Sign In / Register</Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- MAIN NAVBAR ---
const Navbar = ({ navData }) => {
  const pathname = usePathname(); 
  const { data: session } = useSession();
  const { cartCount } = useCart();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false); 
  const leaveTimeout = useRef(null);
  const profileRef = useRef(null); 
  const [mounted, setMounted] = useState(false);

  // LOGIC: Check if on Product Page for split-sticky behavior
  const isProductPage = pathname === '/products';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  if (pathname === '/login' || pathname === '/signup') return null;
  if (!navData) return null;

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`z-[100] bg-white text-black transition-all duration-300 border-b border-gray-100 ${
          isProductPage 
            ? 'relative' // Scroll away on products page
            : 'sticky top-0 shadow-sm' // Stick on other pages
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12">
          
          {/* TOP ROW: Sticky ONLY on Product Page */}
          <div className={`flex justify-between items-center h-16 relative z-[101] transition-all duration-300 ${
             isProductPage ? 'sticky top-0 bg-white/95 backdrop-blur-sm' : ''
          }`}>
            
            {/* Left */}
            <div className="flex items-center gap-6 flex-1">
              <button className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-full transition" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={22} strokeWidth={1.5} />
              </button>
              <div className="hidden lg:flex items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <Search size={16} strokeWidth={1.5} />
                <span className="font-tenor text-[10px] uppercase tracking-[0.2em] pt-0.5">Search</span>
              </div>
            </div>

            {/* Center */}
            <div className="flex-1 text-center">
              <Link href="/" className="inline-block group relative">
                {navData.logoImage ? (
                  <img src={navData.logoImage} alt="Logo" className="h-8 object-contain transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <h1 className="font-bodoni font-semibold text-2xl md:text-3xl tracking-[0.15em] uppercase text-gray-900">
                    {navData.logoText}
                  </h1>
                )}
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center justify-end gap-5 flex-1">
              <div className="hidden lg:block relative" ref={profileRef}>
                {session ? (
                   <div className="flex items-center gap-3 cursor-pointer py-1.5 px-2 pr-3 rounded-full hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group" onClick={() => setProfileOpen(!profileOpen)}>
                     {session.user?.image ? (
                        <img src={session.user.image} alt="User" className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-sm" />
                     ) : (
                        <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bodoni font-medium text-sm shadow-sm">
                           {session.user?.name?.charAt(0).toUpperCase()}
                        </div>
                     )}
                     <span className="font-bodoni text-sm font-medium text-gray-900 leading-none hidden xl:block group-hover:text-[#D4AF37] transition-colors">{session.user?.name?.split(' ')[0]}</span>
                     <ChevronDown size={12} className={`text-gray-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                   </div>
                ) : (
                   <Link href="/login" className="flex items-center h-full opacity-60 hover:opacity-100 transition px-2">
                     <User size={18} className="mr-2 mb-0.5" strokeWidth={1.5} />
                     <span className="font-tenor text-[10px] uppercase tracking-[0.2em]">Sign In</span>
                   </Link>
                )}
                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && session && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[150]">
                      <div className="p-5 border-b border-gray-50 bg-gray-50/30">
                        <p className="font-bodoni font-semibold text-gray-900 text-lg leading-tight">{session.user?.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 truncate">{session.user?.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link href="/account" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-[#D4AF37] rounded-lg transition-colors"><User size={14} strokeWidth={1.5} /> My Account</Link>
                        <Link href="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-[#D4AF37] rounded-lg transition-colors"><ShoppingBag size={14} strokeWidth={1.5} /> My Orders</Link>
                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-left"><LogOut size={14} strokeWidth={1.5} /> Sign Out</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="/cart" className="relative p-2 transition group hover:bg-gray-50 rounded-full">
                <ShoppingBag size={20} strokeWidth={1.5} className="text-gray-900 transition-transform group-hover:scale-110" />
                {mounted && cartCount > 0 && (
                   <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-[#D4AF37] text-white text-[9px] font-bold flex items-center justify-center rounded-full px-1 shadow-sm ring-2 ring-white animate-in zoom-in">
                     {cartCount > 99 ? '99+' : cartCount}
                   </span>
                )}
              </Link>
            </div>
          </div>

          {/* --- BOTTOM ROW (Links) --- */}
          {/* This part scrolls away on product page */}
          <div className="hidden lg:flex justify-center border-t border-gray-100/50">
            <div className="flex gap-10">
              {navData.links?.map((link, i) => {
                const isActive = activeCategory?._id === link._id;
                const hasChildren = link.children && link.children.length > 0;
                return (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }} key={link._id || link.label} className="relative group/link py-3" onMouseEnter={() => hasChildren && handleMouseEnter(link)}>
                    <Link href={link.href || '#'} className={`font-tenor text-[10px] font-medium uppercase tracking-[0.15em] transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-gray-900 hover:text-[#D4AF37]'}`}>
                      {link.label}
                    </Link>
                    <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 ${isActive ? 'w-full' : 'group-hover/link:w-1/2'}`} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- MEGA MENU DROPDOWN --- */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden z-50" onMouseEnter={() => handleMouseEnter(activeCategory)} onMouseLeave={handleMouseLeave}>
              <div className="max-w-7xl mx-auto px-12 py-10">
                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-3 border-r border-gray-100 pr-8">
                    <h2 className="font-bodoni text-3xl text-gray-900 mb-4 italic font-medium">{activeCategory.label}</h2>
                    <Link href={activeCategory.href || '#'} className="inline-flex items-center gap-2 mt-2 text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors group">Explore All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/></Link>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-x-12 gap-y-8">
                    {activeCategory.children?.map((child) => (
                      <div key={child._id || child.label} className="group/child">
                        <Link href={child.href || '#'} className="block font-playfair text-base font-semibold text-gray-900 mb-3 hover:text-[#D4AF37] transition-colors">{child.label}</Link>
                        <div className="flex flex-col gap-2">
                          {child.children?.map((grandchild) => (
                            <Link key={grandchild._id || grandchild.label} href={grandchild.href || '#'} className="font-manrope text-xs font-normal text-gray-500 hover:text-black hover:translate-x-1 transition-all duration-300 block">{grandchild.label}</Link>
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
      </motion.nav>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} navData={navData} session={session} />
    </>
  );
};

export default Navbar;
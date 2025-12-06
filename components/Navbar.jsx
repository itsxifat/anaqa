"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, User, ChevronDown, ArrowRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from "next-auth/react";

const Navbar = ({ navData }) => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const leaveTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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
        className={`sticky top-0 z-[100] transition-all duration-300 border-b bg-white text-black ${
          isScrolled ? 'shadow-sm border-gray-200' : 'border-gray-100'
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12">
          
          {/* --- TOP ROW --- */}
          <div className="flex justify-between items-center h-20 relative">
            
            {/* Left */}
            <div className="flex items-center gap-6 flex-1">
              <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} strokeWidth={1} />
              </button>
              <div className="hidden lg:flex items-center gap-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <Search size={18} strokeWidth={1} />
                <span className="font-tenor text-[11px] uppercase tracking-[0.2em] pt-1">Search</span>
              </div>
            </div>

            {/* Center */}
            <div className="flex-1 text-center">
              <Link href="/" className="inline-block group">
                {navData.logoImage ? (
                  <img src={navData.logoImage} alt="Logo" className="h-10 object-contain transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <h1 className="font-bodoni font-bold text-3xl md:text-4xl tracking-[0.15em] uppercase">
                    {navData.logoText}
                  </h1>
                )}
              </Link>
            </div>

            {/* Right: User Profile & Cart */}
            <div className="flex items-center justify-end gap-8 flex-1">
              
              {/* User Info (Desktop) */}
              <div className="hidden lg:block relative group/profile h-full">
                {session ? (
                  <div className="flex items-center gap-3 cursor-pointer py-2">
                    {/* Avatar */}
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-gray-200 object-cover" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-600 font-bodoni font-bold">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Name */}
                    <div className="flex flex-col items-start">
                      <span className="font-tenor text-[9px] uppercase tracking-widest text-gray-400 leading-none mb-1">Hello</span>
                      <span className="font-bodoni text-sm font-medium text-gray-900 leading-none">
                        {session.user?.name?.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" className="flex items-center h-full opacity-60 hover:opacity-100 transition">
                    <span className="font-tenor text-[11px] uppercase tracking-[0.2em]">Sign In</span>
                  </Link>
                )}

                {/* Dropdown Menu (Only if logged in) */}
                {session && (
                  <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 z-50">
                    <div className="bg-white border border-gray-100 shadow-xl p-4 min-w-[180px] flex flex-col gap-3">
                      <Link href="/account" className="font-tenor text-xs uppercase tracking-widest hover:text-gold-600 transition flex items-center gap-2">
                        <User size={14} /> My Account
                      </Link>
                      <button 
                        onClick={() => signOut()} 
                        className="font-tenor text-xs uppercase tracking-widest text-red-500 text-left hover:text-red-700 transition flex items-center gap-2"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <button className="relative p-1 opacity-60 hover:opacity-100 transition">
                <ShoppingBag size={20} strokeWidth={1} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* --- BOTTOM ROW (Desktop Links) --- */}
          <div className="hidden lg:flex justify-center border-t border-gray-100/50">
            <div className="flex gap-12">
              {navData.links?.map((link) => {
                const isActive = activeCategory?._id === link._id;
                const hasChildren = link.children && link.children.length > 0;
                return (
                  <div 
                    key={link._id || link.label}
                    className="relative group/link py-5"
                    onMouseEnter={() => hasChildren && handleMouseEnter(link)}
                  >
                    <Link 
                      href={link.href || '#'} 
                      className={`
                        font-tenor text-[11px] font-bold uppercase tracking-[0.15em] transition-colors
                        ${isActive ? 'text-gold-600' : 'text-gray-900 hover:text-gold-600'}
                      `}
                    >
                      {link.label}
                    </Link>
                    <span className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gold-500 transition-all duration-300 ${isActive ? 'w-full' : 'group-hover/link:w-1/2'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- MEGA MENU DROPDOWN --- */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden z-50"
              onMouseEnter={() => handleMouseEnter(activeCategory)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-12 py-12">
                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-3 border-r border-gray-100 pr-8">
                    <h2 className="font-bodoni text-3xl text-gray-900 mb-4">{activeCategory.label}</h2>
                    <Link href={activeCategory.href || '#'} className="inline-flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-gold-600 hover:text-black transition-colors">
                      View All <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-x-12 gap-y-8">
                    {activeCategory.children?.map((child) => (
                      <div key={child._id || child.label}>
                        <Link href={child.href || '#'} className="block font-playfair text-lg font-medium text-gray-900 mb-3 hover:text-gold-600 transition-colors">
                          {child.label}
                        </Link>
                        <div className="flex flex-col gap-2">
                          {child.children?.map((grandchild) => (
                            <Link 
                              key={grandchild._id || grandchild.label} 
                              href={grandchild.href || '#'}
                              className="font-manrope text-[12px] text-gray-500 hover:text-black hover:translate-x-1 transition-all duration-300 block"
                            >
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

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} links={navData.links || []} session={session} />
    </>
  );
};

// --- MOBILE MENU COMPONENT ---
const MobileMenu = ({ isOpen, onClose, links, session }) => {
  const [expanded, setExpanded] = useState({});
  useEffect(() => { if(!isOpen) setExpanded({}); }, [isOpen]);
  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" onClick={onClose} />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.4 }} className="fixed top-0 left-0 h-full w-[90%] max-w-[360px] bg-white z-[120] shadow-2xl flex flex-col">
            
            {/* Mobile Header */}
            <div className="p-8 flex justify-between items-center border-b border-gray-100">
              <span className="font-bodoni text-2xl tracking-widest text-black">MENU</span>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full"><X size={24} strokeWidth={1} /></button>
            </div>

            {/* Mobile Links */}
            <div className="flex-1 overflow-y-auto p-8 space-y-2">
              {links.map((link) => {
                const hasChildren = link.children && link.children.length > 0;
                const id = link._id || link.label;
                const isExpanded = expanded[id];
                return (
                  <div key={id} className="border-b border-gray-50 last:border-0">
                    <div className={`flex justify-between items-center py-4 cursor-pointer ${isExpanded ? 'text-gold-600' : 'text-black'}`} onClick={() => hasChildren ? toggleExpand(id) : onClose()}>
                      <Link href={link.href || '#'} onClick={!hasChildren ? onClose : undefined} className="font-tenor text-sm font-bold uppercase tracking-[0.2em]">{link.label}</Link>
                      {hasChildren && <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />}
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pb-6 pl-4 space-y-6">
                            {link.children?.map(child => (
                              <div key={child._id || child.label}>
                                <Link href={child.href} className="block font-playfair text-base text-gray-800 mb-3" onClick={onClose}>{child.label}</Link>
                                <div className="pl-3 space-y-3 border-l border-gray-100">
                                  {child.children?.map(grandchild => (
                                    <Link key={grandchild._id || grandchild.label} href={grandchild.href || '#'} className="block font-manrope text-xs text-gray-500 uppercase tracking-wider hover:text-black" onClick={onClose}>{grandchild.label}</Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Mobile Footer (User Account) */}
            <div className="p-8 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col gap-4">
                {session ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {session.user?.image ? (
                        <img src={session.user.image} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bodoni font-bold text-lg">
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-tenor text-xs uppercase text-gray-500">Signed in as</p>
                        <p className="font-bodoni text-lg">{session.user.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                        <Link href="/account" className="flex items-center gap-2 font-tenor text-xs uppercase tracking-widest text-black hover:text-gold-600">
                            <User size={14}/> My Account
                        </Link>
                        <button onClick={() => signOut()} className="flex items-center gap-2 font-tenor text-xs uppercase tracking-widest text-red-500 text-left hover:text-red-700">
                            <LogOut size={14}/> Sign Out
                        </button>
                    </div>
                  </div>
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
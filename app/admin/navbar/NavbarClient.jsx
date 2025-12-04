'use client';

import { saveNavbarConfig } from '@/app/actions';
import { useState } from 'react';
import { Plus, Save, Trash2, ArrowRight, CornerDownRight, Layers, Layout, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavbarClient({ categories, currentLinks }) {
  const [navbarLinks, setNavbarLinks] = useState(currentLinks);
  const [isSaving, setIsSaving] = useState(false);

  // Flatten tree for the "Picker"
  const flatCategories = [];
  const flatten = (cats, depth = 0) => {
    cats.forEach(c => {
      flatCategories.push({ ...c, depth });
      if (c.children) flatten(c.children, depth + 1);
    });
  };
  flatten(categories);

  const addToNavbar = (categoryId) => {
    const findCat = (nodes, id) => {
      for (const node of nodes) {
        if (node._id === id) return node;
        if (node.children) {
          const found = findCat(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const cat = findCat(categories, categoryId);
    if (!cat) return;

    const mapToLink = (c) => ({
      label: c.name,
      href: `/category/${c.slug}`,
      children: c.children ? c.children.map(mapToLink) : []
    });

    setNavbarLinks([...navbarLinks, mapToLink(cat)]);
  };

  const removeLink = (index) => {
    setNavbarLinks(navbarLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveNavbarConfig(navbarLinks);
    setIsSaving(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden font-manrope text-gray-800">
      
      {/* LEFT: CATEGORY PICKER */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-playfair font-bold text-gray-900 flex items-center gap-2">
            <Layers size={18} className="text-gold-500" /> Categories
          </h2>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Available to Add</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {flatCategories.map(cat => (
            <button 
              key={cat._id}
              onClick={() => addToNavbar(cat._id)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 group transition-all text-left border border-transparent hover:border-gray-100"
              style={{ paddingLeft: `${cat.depth * 16 + 12}px` }}
            >
              <div className="flex items-center gap-3">
                {cat.depth > 0 && <CornerDownRight size={12} className="text-gray-300" />}
                <span className={`text-xs ${cat.depth === 0 ? 'font-bold text-gray-800 uppercase tracking-wide' : 'text-gray-600 font-medium'}`}>
                  {cat.name}
                </span>
              </div>
              <Plus size={14} className="text-gray-300 group-hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
          {flatCategories.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">
              No categories found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: STRUCTURE EDITOR */}
      <div className="flex-1 flex flex-col bg-[#f8f9fa] relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-xl font-playfair font-bold text-gray-900 flex items-center gap-3">
              <Layout size={20} className="text-gold-500" /> Active Menu Structure
            </h2>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg hover:shadow-xl"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {navbarLinks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <Layout size={48} className="mb-4 stroke-1"/>
              <p className="text-sm font-medium uppercase tracking-widest">Menu is Empty</p>
              <p className="text-xs mt-2">Select categories from the left to build your menu.</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              <AnimatePresence>
                {navbarLinks.map((link, i) => (
                  <motion.div 
                    key={link.label + i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:border-gold-500/30 transition-all"
                  >
                    {/* Top Level Item */}
                    <div className="p-5 flex justify-between items-center bg-white z-10 relative">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100">
                          {i + 1}
                        </div>
                        <div>
                          <span className="font-playfair font-bold text-lg text-gray-900 block">{link.label}</span>
                          <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">{link.href}</span>
                        </div>
                      </div>
                      <button onClick={() => removeLink(i)} className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                    
                    {/* Visual Tree of Children */}
                    {link.children && link.children.length > 0 && (
                      <div className="bg-gray-50/50 p-5 pt-0 border-t border-gray-50">
                        <div className="pt-4 pl-4 space-y-4 relative">
                          {/* Vertical Line */}
                          <div className="absolute left-[27px] top-0 bottom-4 w-[1px] bg-gray-200"></div>

                          {link.children.map((child, j) => (
                            <div key={j} className="relative pl-8">
                              {/* Horizontal Line */}
                              <div className="absolute left-[12px] top-[14px] w-4 h-[1px] bg-gray-200"></div>
                              
                              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-800">{child.label}</span>
                                
                                {/* Grandchildren Badges */}
                                {child.children && child.children.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {child.children.map((grand, k) => (
                                      <span key={k} className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-gold-500"></div>
                                        {grand.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
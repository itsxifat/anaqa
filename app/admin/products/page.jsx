'use client';

import Link from 'next/link';
import {
  Plus, Trash2, Package, Search, Edit3,
  Filter, X, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getAdminProducts, deleteProduct, getCategories, getTags, updateProductTags } from '@/app/actions';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 50;

const flattenCategories = (categories, depth = 0) => {
  let flat = [];
  categories.forEach(cat => {
    flat.push({ _id: cat._id, name: cat.name, label: `${'  '.repeat(depth * 2)}${cat.name}` });
    if (cat.children?.length > 0) flat = flat.concat(flattenCategories(cat.children, depth + 1));
  });
  return flat;
};

const QuickTagModal = ({ product, availableTags, onClose, onUpdate }) => {
  const [selectedTags, setSelectedTags] = useState(product.tags ? product.tags.map(t => t._id) : []);
  const [saving, setSaving] = useState(false);

  const toggleTag = (id) =>
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const handleSave = async () => {
    setSaving(true);
    await updateProductTags(product._id, selectedTags);
    await onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bodoni text-lg text-black">Manage Tags</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-black" /></button>
        </div>
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">Tags for "{product.name}"</p>
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
            {availableTags.map(tag => {
              const isActive = selectedTags.includes(tag._id);
              return (
                <button key={tag._id} onClick={() => toggleTag(tag._id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${isActive ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-black text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Tags'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // All filter state — single source of truth
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [tagModalProduct, setTagModalProduct] = useState(null);

  const searchDebounce = useRef(null);
  // Track whether we're in a manual refresh (e.g. after delete/tag save)
  const refreshTick = useRef(0);
  const [refresh, setRefresh] = useState(0);

  // Load categories & tags once
  useEffect(() => {
    Promise.all([getCategories(), getTags()]).then(([cats, tgs]) => {
      setCategories(flattenCategories(cats));
      setTags(tgs);
    });
  }, []);

  // Single effect drives all product fetches — no double-fetch possible
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAdminProducts({
      search: debouncedSearch,
      category: filterCat,
      tag: filterTag,
      stock: filterStock,
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    }).then(result => {
      if (!cancelled) {
        setProducts(result.products);
        setTotal(result.total);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [debouncedSearch, filterCat, filterTag, filterStock, page, refresh]);

  const triggerRefresh = () => {
    refreshTick.current += 1;
    setRefresh(refreshTick.current);
  };

  const handleDelete = async (id) => {
    if (confirm('Permanently delete this product?')) {
      await deleteProduct(id);
      triggerRefresh();
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-gray-50 text-gray-900 font-manrope pt-16 lg:pt-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-10 py-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-bodoni text-2xl lg:text-3xl font-bold text-gray-900 tracking-wide">Products</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
              {loading ? 'Loading…' : `${total.toLocaleString()} product${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors shadow-sm">
            <Plus size={15} /> Create Product
          </Link>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={search}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearch(val);
                    clearTimeout(searchDebounce.current);
                    searchDebounce.current = setTimeout(() => {
                      setDebouncedSearch(val);
                      setPage(0);
                    }, 300);
                  }}
                  placeholder="Search by Name, SKU, Barcode…"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`w-full md:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${showFilters ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-black'}`}
              >
                <Filter size={16} /> Filters
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-6 mt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                      <div className="relative">
                        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(0); }}
                          className="w-full p-2.5 bg-gray-50 rounded-lg text-sm border-transparent focus:border-black border outline-none appearance-none cursor-pointer">
                          <option value="">All Categories</option>
                          {categories.map(c => <option key={c._id} value={c._id}>{c.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tag</label>
                      <div className="relative">
                        <select value={filterTag} onChange={(e) => { setFilterTag(e.target.value); setPage(0); }}
                          className="w-full p-2.5 bg-gray-50 rounded-lg text-sm border-transparent focus:border-black border outline-none appearance-none cursor-pointer">
                          <option value="">All Tags</option>
                          {tags.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock Status</label>
                      <div className="relative">
                        <select value={filterStock} onChange={(e) => { setFilterStock(e.target.value); setPage(0); }}
                          className="w-full p-2.5 bg-gray-50 rounded-lg text-sm border-transparent focus:border-black border outline-none appearance-none cursor-pointer">
                          <option value="all">All Items</option>
                          <option value="in">In Stock Only</option>
                          <option value="out">Out of Stock</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product List */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: 400 }}>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {loading
                ? <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
                : products.map(product => (
                  <div key={product._id} className="p-4 flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img src={product.images?.[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-black truncate pr-2">{product.name}</h3>
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${product._id}`} className="text-gray-400 hover:text-black"><Edit3 size={16} /></Link>
                          <button onClick={() => handleDelete(product._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-black">৳{product.price}</span>
                        {product.stock > 0
                          ? <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">In Stock ({product.stock})</span>
                          : <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">Out of Stock</span>
                        }
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                    <th className="p-6 pl-8">Product</th>
                    <th className="p-6">Details</th>
                    <th className="p-6">Inventory</th>
                    <th className="p-6">Price</th>
                    <th className="p-6 text-right pr-8">Manage</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className="animate-pulse border-b border-gray-50">
                        <td className="p-6 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-gray-100 rounded" />
                            <div className="space-y-2">
                              <div className="h-4 w-40 bg-gray-100 rounded" />
                              <div className="h-3 w-24 bg-gray-100 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="p-6"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                        <td className="p-6"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                        <td className="p-6"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                        <td className="p-6"><div className="h-8 w-16 bg-gray-100 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-gray-400">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <span className="uppercase tracking-widest text-xs font-bold block">No products found</span>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="group hover:bg-[#faf9f6] transition-colors">
                        <td className="p-6 pl-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-16 rounded overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} width={48} height={64} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                            <div>
                              <p className="font-bodoni text-lg text-gray-900 line-clamp-1">{product.name}</p>
                              <div className="flex gap-3 text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                                <span className="font-mono bg-gray-100 px-1.5 rounded">{product.sku || 'NO SKU'}</span>
                                {product.barcode && <span className="font-mono bg-gray-100 px-1.5 rounded">{product.barcode}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="space-y-2">
                            <span className="inline-block px-2 py-0.5 rounded border border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider bg-white">
                              {product.category?.name || 'Uncategorized'}
                            </span>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {product.tags?.length > 0 ? (
                                product.tags.map(tag => (
                                  <span key={tag._id} className="text-[9px] font-bold uppercase tracking-wide text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: tag.color || '#000' }}>{tag.name}</span>
                                ))
                              ) : <span className="text-gray-300 text-[10px] italic">No Tags</span>}
                              <button onClick={() => setTagModalProduct(product)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-gray-200 rounded hover:bg-[#D4AF37] hover:text-white" title="Manage Tags">
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="space-y-1">
                            {product.stock > 0 ? (
                              <span className="text-green-600 text-xs font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> {product.stock} Total
                              </span>
                            ) : (
                              <span className="text-red-500 text-xs font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> Out of Stock
                              </span>
                            )}
                            {product.variants?.length > 0 && (
                              <div className="text-[9px] text-gray-400 font-mono mt-1">
                                {product.variants.slice(0, 3).map(v => `${v.size}:${v.stock}`).join(' | ')}
                                {product.variants.length > 3 && '…'}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="font-bold text-black">৳{product.price?.toLocaleString()}</div>
                          {product.discountPrice && (
                            <div className="text-xs text-red-500 font-bold">Offer: ৳{product.discountPrice.toLocaleString()}</div>
                          )}
                        </td>

                        <td className="p-6 pr-8 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/products/${product._id}`} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-black hover:border-black transition-all bg-white"><Edit3 size={14} /></Link>
                            <button onClick={() => handleDelete(product._id)} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all bg-white"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Page {page + 1} of {totalPages} &nbsp;·&nbsp; {total.toLocaleString()} total
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0 || loading}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1 || loading}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {tagModalProduct && (
        <QuickTagModal
          product={tagModalProduct}
          availableTags={tags}
          onClose={() => setTagModalProduct(null)}
          onUpdate={triggerRefresh}
        />
      )}
    </div>
  );
}

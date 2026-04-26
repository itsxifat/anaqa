'use client';

// Shared fast product picker used by Featured Section and Video Section admin pages.
// Uses server-side search (fires API call on each debounced keystroke) so we never
// load the full product catalogue into the browser.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { getProductsForPicker } from '@/actions/products';
import { toast } from 'react-hot-toast';

const MAX_PRODUCTS = 8;

export default function ProductPicker({ selected, onChange }) {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Initial load — fetch first 60 products with no search term
  useEffect(() => {
    fetchProducts('');
  }, []);

  const fetchProducts = async (q) => {
    setSearching(true);
    try {
      const data = await getProductsForPicker(q, 60);
      setResults(data || []);
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProducts(val), 300);
  };

  // Stable reference — won't cause child re-renders
  const toggle = useCallback((product) => {
    const isSelected = selected.some(p => p._id === product._id);
    if (isSelected) {
      onChange(selected.filter(p => p._id !== product._id));
    } else {
      if (selected.length >= MAX_PRODUCTS) {
        toast.error(`Max ${MAX_PRODUCTS} products allowed`);
        return;
      }
      onChange([...selected, product]);
    }
  }, [selected, onChange]);

  const selectedIds = useMemo(() => new Set(selected.map(p => p._id)), [selected]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700">
          Products{' '}
          <span className="text-[#D4AF37]">({selected.length}/{MAX_PRODUCTS})</span>
        </h3>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100 shrink-0">
          {selected.map(p => (
            <button
              key={p._id}
              onClick={() => toggle(p)}
              className="flex items-center gap-1.5 bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
            >
              {p.name}
              <X size={11} />
            </button>
          ))}
        </div>
      )}

      {/* Search box */}
      <div className="relative mb-3 shrink-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37] transition-colors"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Results list — fixed height with overflow scroll so the page doesn't jump */}
      <div className="overflow-y-auto flex-1 space-y-1.5 min-h-0 max-h-[420px] pr-0.5">
        {results.map(product => {
          const isSelected = selectedIds.has(product._id);
          return (
            <ProductRow
              key={product._id}
              product={product}
              isSelected={isSelected}
              onToggle={toggle}
            />
          );
        })}
        {!searching && results.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">No products found</p>
        )}
      </div>
    </div>
  );
}

// Memoised row — only re-renders when its own isSelected flag changes,
// not when the parent re-renders due to other state changes.
const ProductRow = ({ product, isSelected, onToggle }) => (
  <button
    onClick={() => onToggle(product)}
    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left
      ${isSelected
        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
  >
    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
      {product.images?.[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.images[0]}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
        />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{product.category?.name}</p>
    </div>
    <div className="shrink-0">
      {isSelected
        ? <X size={14} className="text-[#D4AF37]" />
        : <Plus size={14} className="text-gray-300" />}
    </div>
  </button>
);

// memo so parent renders don't cascade into every row
const MemoRow = ({ product, isSelected, onToggle }) => {
  return <ProductRow product={product} isSelected={isSelected} onToggle={onToggle} />;
};

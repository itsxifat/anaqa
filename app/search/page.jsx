'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import SiteContent from '@/models/SiteContent';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';

  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const debounceRef = useRef(null);

  const doSearch = async (searchQuery, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=20`
      );
      const data = await res.json();
      if (pageNum === 1) {
        setProducts(data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.products || [])]);
      }
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // Run search when URL query changes
  useEffect(() => {
    setPage(1);
    doSearch(q, 1);
    setQuery(q);
  }, [q]);

  // Debounced search as user types in box
  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.replace(`/search?q=${encodeURIComponent(val)}`, { scroll: false });
    }, 350);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    doSearch(q, next);
  };

  return (
    <div className="min-h-screen bg-white font-manrope">
      {/* Search Bar */}
      <div className="border-b border-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center border border-gray-200 rounded-full shadow-sm overflow-hidden focus-within:border-[#D4AF37] focus-within:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] transition-all duration-300">
            <Search size={18} className="absolute left-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-12 py-4 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              autoFocus
            />
            {query && (
              <button
                onClick={() => handleInput('')}
                className="absolute right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Result count */}
          {!loading && q && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              {total === 0
                ? `No results for "${q}"`
                : `${total} result${total !== 1 ? 's' : ''} for "${q}"`}
            </p>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4 text-[#D4AF37]" />
            <p className="text-sm uppercase tracking-widest">Searching...</p>
          </div>
        ) : products.length === 0 && q ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Search size={48} className="mb-6 opacity-20" />
            <p className="text-lg font-bold text-gray-700 mb-2">No products found</p>
            <p className="text-sm text-gray-400">Try different keywords or check the spelling</p>
          </div>
        ) : products.length === 0 && !q ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Search size={48} className="mb-6 opacity-20" />
            <p className="text-sm uppercase tracking-widest">Start typing to search products</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Load more */}
            {page < pages && (
              <div className="mt-16 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

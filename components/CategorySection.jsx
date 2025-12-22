import { getTopCategories } from '@/app/actions';
import CategoryGridAnimated from './CategoryGridAnimated';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function CategorySection() {
  const allCategories = await getTopCategories();

  if (!allCategories || allCategories.length === 0) return null;

  // Logic: Show max 10 items (2 rows x 5 columns)
  const displayCategories = allCategories.slice(0, 10);
  const hasMore = allCategories.length > 10;

  return (
    <section className="py-24 md:py-32 bg-white relative font-manrope">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* CENTERED HEADER: More Editorial & Clean */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <h2 className="font-bodoni text-4xl md:text-5xl text-gray-900 mb-4">
                Shop by Category
            </h2>
            <div className="w-12 h-0.5 bg-black mx-auto mb-4"></div>
            <p className="text-gray-500 text-xs md:text-sm tracking-wide leading-relaxed">
                Explore our essential collections, crafted for the modern wardrobe.
            </p>
        </div>

        {/* The Animated Grid */}
        <CategoryGridAnimated categories={displayCategories} />

        {/* 'View All' Button (Centered & Minimal) */}
        {hasMore && (
            <div className="mt-16 text-center">
                <Link 
                  href="/categories" 
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-gray-600 hover:border-gray-400 transition-all"
                >
                    View All Categories <ArrowRight size={14} />
                </Link>
            </div>
        )}

      </div>
    </section>
  );
}
import { getTopCategories } from '@/app/actions';
import CategoryGridAnimated from './CategoryGridAnimated';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function CategorySection() {
  const allCategories = await getTopCategories();

  if (!allCategories || allCategories.length === 0) return null;

  // Logic: Show max 10 items
  const displayCategories = allCategories.slice(0, 10);
  const hasMore = allCategories.length > 10;

  return (
    <section className="py-24 md:py-32 bg-white relative font-manrope">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* PREMIUM HEADER: Playfair Display + Montserrat */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="font-playfair text-5xl md:text-6xl text-gray-900 mb-6 italic leading-tight">
                Shop by Category
            </h2>
            
            {/* Minimal Golden Divider */}
            <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mb-6"></div>
            
            <p className="font-montserrat text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] leading-relaxed">
                Refined Collections for the Modern Soul
            </p>
        </div>

        {/* The Animated Grid */}
        <CategoryGridAnimated categories={displayCategories} />

        {/* 'View All' Button */}
        {hasMore && (
            <div className="mt-20 text-center">
                <Link 
                  href="/categories" 
                  className="group inline-flex items-center gap-3 text-[11px] font-montserrat font-bold uppercase tracking-[0.25em] pb-2 border-b border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-500"
                >
                    View All Categories <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300"/>
                </Link>
            </div>
        )}

      </div>
    </section>
  );
}
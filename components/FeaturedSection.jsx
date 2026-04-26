import Image from 'next/image';
import ProductCard from './ProductCard';

export default function FeaturedSection({ data }) {
  if (!data || !data.isActive || !data.products?.length) return null;

  return (
    <section className="py-20 md:py-32 bg-[#F9F7F4] font-manrope border-t border-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">

        {/* Two-column layout: image left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">

          {/* Left: Image */}
          {data.image && (
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={data.image}
                alt={data.heading || 'Featured Collection'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Right: Text */}
          <div className={data.image ? '' : 'lg:col-span-2 text-center'}>
            <span className="text-[#D4AF37] font-bold uppercase tracking-[0.3em] text-xs">
              Featured
            </span>
            <h2 className="font-bodoni text-4xl md:text-5xl text-black mt-4 leading-tight">
              {data.heading}
            </h2>
            {data.subheading && (
              <p className="text-gray-500 text-sm mt-4 leading-relaxed max-w-md">
                {data.subheading}
              </p>
            )}
            <div className="w-12 h-0.5 bg-[#D4AF37] mt-6" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {data.products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}

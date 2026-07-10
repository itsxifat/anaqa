'use client';

import Image from 'next/image';

// A soft light-grey 1px blur. next/image paints this while the real image loads,
// so an unloaded image shows a grey box instead of a white flash on fast scroll.
const BLUR =
  'data:image/gif;base64,R0lGODlhAQABAPAAAO3t7f///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

/**
 * Optimized storefront image built on next/image.
 *  - Emits AVIF/WebP at the right responsive size (see next.config `images`).
 *  - `fill` by default — drop it into any `position:relative` sized box, exactly
 *    like the `absolute inset-0 w-full h-full object-cover` <img>s it replaces.
 *  - Always shows a grey blur placeholder, never a white gap.
 *
 * Pass `sizes` so the optimizer picks the smallest source that fits (big win on
 * grids). Pass `priority` for above-the-fold/LCP images (e.g. the hero).
 */
export default function SmartImage({
  src,
  alt = '',
  fill = true,
  sizes = '100vw',
  priority = false,
  className = '',
  ...rest
}) {
  return (
    <Image
      src={src || '/placeholder.jpg'}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="blur"
      blurDataURL={BLUR}
      className={className}
      {...rest}
    />
  );
}

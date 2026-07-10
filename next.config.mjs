/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        // HTML pages: browser must always ask the server for fresh data.
        // Excludes Next.js static chunks (/_next/static/) which are content-hashed
        // and safe to cache forever, and uploaded images.
        source: '/((?!_next/static|_next/image|uploads|favicon\\.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        // Uploaded images: 1-day cache. Browser revalidates after 24h so
        // deleted images stop showing quickly without hammering the server.
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      // Config must be here for bodySizeLimit in many Next.js versions
      bodySizeLimit: '50mb',
    },
  },

  images: {
    // Serve modern formats — far smaller than the original JPEG/PNG.
    formats: ['image/avif', 'image/webp'],
    // Each CDN asset has a unique (UUID) URL, so an optimized variant never goes
    // stale. Cache it for a year: the browser/optimizer stop re-fetching &
    // re-optimizing the same image on every scroll-back (the "white then loads
    // with a delay" symptom).
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
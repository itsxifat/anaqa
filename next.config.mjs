/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this line to ensure source maps are hidden in production
  productionBrowserSourceMaps: false, 

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
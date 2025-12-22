/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,

 
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://[2400:3dc0:6a:5:ddab:92e:646e:28c7]:3000',
    'https://yourdomain.com',
    'https://www.yourdomain.com',
  ],

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

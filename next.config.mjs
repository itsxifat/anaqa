/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increased from default 1mb
    },
  },
  // Ensure mongoose doesn't cause bundling issues
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
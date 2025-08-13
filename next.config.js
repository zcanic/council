/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  experimental: {
    // Enable server actions if needed
    serverActions: true,
  },
  // Ensure proper static file handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
}

module.exports = nextConfig
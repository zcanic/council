/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Experimental features
  experimental: {
    // Enable server components by default
    serverComponentsExternalPackages: ['prisma', '@prisma/client']
  },

  // Environment variables to be available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Webpack configuration
  webpack: (config) => {
    config.externals.push({
      'prisma': 'commonjs prisma',
      '@prisma/client': 'commonjs @prisma/client'
    });
    return config;
  },
};

export default nextConfig;

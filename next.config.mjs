/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for web deployment
  // output: 'standalone',
  
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side specific configs
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    config.externals.push({
      'prisma': 'commonjs prisma',
      '@prisma/client': 'commonjs @prisma/client'
    });
    return config;
  },
};

export default nextConfig;

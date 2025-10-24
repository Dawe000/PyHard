/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Simplified webpack config that works with Turbopack
  webpack: (config, { isServer, dev }) => {
    // Only apply webpack config when not using Turbopack
    if (!dev || process.env.TURBOPACK) {
      return config;
    }
    
    if (!isServer) {
      config.resolve.fallback = { 
        fs: false, 
        net: false, 
        tls: false,
        '@react-native-async-storage/async-storage': false
      };
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      
      // Ignore React Native dependencies in web environment
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Turbopack to use webpack
  experimental: {
    turbo: false,
  },
  // Simple webpack config for React Native dependencies
  webpack: (config, { isServer }) => {
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack configuration for Next.js 16
  turbopack: {
    rules: {
      '*.node': {
        loaders: ['ignore-loader'],
      },
    },
    resolveAlias: {
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    },
  },
  // Webpack fallback for non-Turbopack builds
  webpack: (config, { isServer, dev }) => {
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

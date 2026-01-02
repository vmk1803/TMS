/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable production optimizations
    compress: true,

    // Optimize images
    images: {
        formats: ['image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
            remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      }]
    },

    // Optimize bundle
    swcMinify: true,

    // Production optimizations
    productionBrowserSourceMaps: false,

    // Optimize fonts
    optimizeFonts: true,

    // Compiler options
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Transpile packages
    transpilePackages: ['antd'],

    // Enable experimental features for better performance
    experimental: {
        optimizePackageImports: ['recharts', 'leaflet', 'react-leaflet', 'lucide-react'],
    },
}

module.exports = nextConfig

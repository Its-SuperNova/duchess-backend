/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false, // ✅ Enable ESLint checking during builds
  },
  typescript: {
    ignoreBuildErrors: false, // ✅ Enable TypeScript error checking
  },
  compress: true, // ✅ Enable gzip compression
  poweredByHeader: false, // ✅ Remove X-Powered-By header for security
  generateEtags: false, // ✅ Disable default ETags (we handle manually in API routes)
  
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // ✅ Add image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // ✅ Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // ✅ Add specific CSP for API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self';",
          },
        ],
      },
      {
        // ✅ Add CSP for main app with necessary allowances
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com",
              "style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com",
              "img-src 'self' data: blob: https: *.supabase.co *.unsplash.com",
              "font-src 'self' data: fonts.gstatic.com",
              "connect-src 'self' *.supabase.co *.googleapis.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb',
    },
    // ✅ Enable optimizations
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // ✅ Webpack optimizations for production
  webpack: (config, { dev, isServer }) => {
    // Remove console.log in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimizer: config.optimization.minimizer.map((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: true, // ✅ Remove console.log in production
                drop_debugger: true,
              },
            };
          }
          return minimizer;
        }),
      };
      
      // ✅ Optimize bundle splitting
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // ✅ Framework chunk (React, Next.js core)
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // ✅ UI library chunk
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            // ✅ Other libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 20,
              chunks: 'all',
              minChunks: 1,
            },
            // ✅ Common components
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              chunks: 'all',
              enforce: true,
            },
          },
        };
      }
    }
    
    return config;
  },
};

export default nextConfig;

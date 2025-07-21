/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // Keep flexible if needed
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days for fresher updates
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self';",
          },
        ],
      },
      {
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com blob:",
              "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com blob:",
              "style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.unsplash.com https://*.googleusercontent.com",
              "font-src 'self' data: fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.googleapis.com",
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
    serverActions: { bodySizeLimit: '3mb' },
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Enhanced Terser configuration for better minification
      config.optimization = {
        ...config.optimization,
        minimizer: config.optimization.minimizer.map((minimizer) => {
          if (minimizer?.options?.terserOptions) {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                passes: 2,
              },
              mangle: {
                safari10: true, // Better Safari compatibility
              },
            };
          }
          return minimizer;
        }),
      };

      if (!isServer) {
        // Enhanced chunk splitting for better mobile performance
        config.optimization.splitChunks = {
          chunks: 'all',
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          cacheGroups: {
            // Core React chunks
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 50,
              enforce: true,
            },
            // Next.js chunks
            next: {
              test: /[\\/]node_modules[\\/]next[\\/]/,
              name: 'next',
              chunks: 'all',
              priority: 45,
              enforce: true,
            },
            // UI library chunks
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            // Other libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              chunks: 'all',
              priority: 20,
              minChunks: 1,
            },
            // Common components
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
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

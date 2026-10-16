import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Production build validation: prevent accidental builds without API URL or with mock enabled
  if (mode === 'production') {
    const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error(
        "🚨 BUILD XATOSI: Production rejimida 'VITE_API_URL' environment o'zgaruvchisi kiritilishi shart! " +
        "Masalan: VITE_API_URL=https://dentuz.onrender.com/api"
      );
    }
    const mockVal = env.VITE_USE_MOCK || process.env.VITE_USE_MOCK;
    if (mockVal === 'true') {
      throw new Error("🚨 BUILD XATOSI: Production rejimida 'VITE_USE_MOCK=true' bo'lishi mumkin emas!");
    }
  }

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml'],
        manifest: {
          name: 'DentUz - Dental Clinic Management OS',
          short_name: 'DentUz',
          description: "O'zbekistondagi zamonaviy stomatologiya klinikasi boshqaruv tizimi",
          theme_color: '#0F172A',
          background_color: '#F8FAFC',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'uz',
          icons: [
            {
              src: '/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          globIgnores: ['**/excel-vendor-*.js'],
          maximumFileSizeToCacheInBytes: 3000000,
          // Never intercept or cache API calls with the SPA fallback
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            // CRITICAL HIPAA/GDPR: Medical records & API endpoints must NEVER be cached
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api') || url.hostname.includes('onrender.com'),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    server: {
      host: true,
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          // Manual chunk splitting for isolated heavy libraries
          manualChunks: (id) => {
            if (id.includes('node_modules/exceljs') || id.includes('node_modules/file-saver')) {
              return 'excel-vendor';
            }
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'i18n-vendor';
            }
            if (id.includes('node_modules/react-window')) {
              return 'virtualization-vendor';
            }
          },
          // Consistent file naming with content hash
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            if (ext === 'css') {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  };
});

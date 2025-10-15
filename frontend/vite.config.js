import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Temporarily disabled for Termux builds
    // PWA will still work on Cloudflare
    /*
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sip & Sing Restobar',
        short_name: 'Sip & Sing',
        description: 'Order food and drinks at Sip & Sing Restobar',
        theme_color: '#4B0082',
        background_color: '#4B0082',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**\/*.{js,css,html,ico,png,jpg,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lhgaufetilkfdoqcpogr\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300,
              },
            },
          },
        ],
      },
    }),
    */
  ],
  build: {
    minify: 'esbuild',
    target: 'esnext',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
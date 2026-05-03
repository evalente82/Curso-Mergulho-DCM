import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ── Configuração do Vite ────────────────────────────────────────────────────
// BASE_URL em produção: /Curso-Mergulho-DCM/
// BASE_URL em dev:      /
// A pasta public/admin/ é copiada como estático (Decap CMS não precisa do
// pipeline Vite — ele carrega seu próprio JS via CDN).
// ────────────────────────────────────────────────────────────────────────────
export default defineConfig({
  base: '/Curso-Mergulho-DCM/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Curso de Mergulho DCM',
        short_name: 'Mergulho DCM',
        description: 'Manual de Mergulho Autônomo Desportivo — Guarda-Vidas Maricá',
        theme_color: '#0c4a6e',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/Curso-Mergulho-DCM/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Cacheia os capítulos e imagens para offline-first
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        runtimeCaching: [
          {
            // Capítulos markdown
            urlPattern: /\/content\/chapters\/.+\.md$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'chapters-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Imagens do curso
            urlPattern: /\/assets\/content\/.+\.(jpg|jpeg|png|webp|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
    }),
  ],

  server: {
    port: 5174,
  },

  build: {
    outDir: 'dist',
    // A pasta public/admin é copiada automaticamente — não precisa de entrada
    // manual aqui. O Vite copia tudo de /public para /dist por padrão.
    rollupOptions: {
      output: {
        // Code splitting por rota para melhor LCP
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'remark-gfm'],
          motion: ['framer-motion'],
          search: ['flexsearch'],
        },
      },
    },
  },
})

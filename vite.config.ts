import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import type { Connect } from 'vite'
import fs from 'fs'
import path from 'path'

// ── Configuração do Vite ────────────────────────────────────────────────────
// BASE_URL em produção: /Curso-Mergulho-DCM/
// BASE_URL em dev:      /
// Plugin customizado: intercepta /admin/ e serve public/admin/index.html
// diretamente, impedindo que o React SPA capture essa rota.
// ────────────────────────────────────────────────────────────────────────────

function adminStaticPlugin() {
  return {
    name: 'admin-static',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use((req, _res, next) => {
        // Normaliza a URL removendo query string
        const url = req.url?.split('?')[0] ?? ''

        // Serve arquivos estáticos de /admin/ (config.yml, etc.) sem interceptar
        if (/\/(Curso-Mergulho-DCM\/)?admin\/(.+)$/.test(url)) {
          // É um subarquivo do admin (ex: config.yml) — deixa o Vite servir normalmente
          return next()
        }

        // Se a rota for exatamente /admin ou /admin/ — serve o index.html do CMS
        if (/\/(Curso-Mergulho-DCM\/)?admin\/?$/.test(url)) {
          const adminHtml = path.resolve(process.cwd(), 'public', 'admin', 'index.html')
          if (fs.existsSync(adminHtml)) {
            req.url = '/Curso-Mergulho-DCM/admin/index.html'
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  base: '/Curso-Mergulho-DCM/',

  plugins: [
    adminStaticPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/Icone_fundo_Cinza.png', 'icons/vcorpLogo.png', 'icons/logo_sem_fundo.png'],
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
            src: 'icons/Icone_fundo_Cinza.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        runtimeCaching: [
          {
            // Capítulos markdown: NetworkFirst — busca sempre a versão mais
            // recente da rede; só usa cache se estiver offline.
            urlPattern: /\/content\/chapters\/.+\.md$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'chapters-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // index.json (estrutura do curso): NetworkFirst pelo mesmo motivo
            urlPattern: /\/content\/index\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'index-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Imagens do curso: StaleWhileRevalidate — serve do cache
            // imediatamente mas atualiza em segundo plano para o próximo F5.
            urlPattern: /\/assets\/content\/.+\.(jpg|jpeg|png|webp|svg)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
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

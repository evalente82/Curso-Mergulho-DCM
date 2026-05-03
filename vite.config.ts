import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Em produção (GitHub Pages) o app vive em /Curso-Mergulho-DCM/
// Em dev (localhost) vive na raiz /
const isProd = process.env.NODE_ENV === 'production'
const BASE = isProd ? '/Curso-Mergulho-DCM/' : '/'

export default defineConfig(async () => {
  // Carregamento dinâmico para compatibilidade com pacotes ESM-only
  const reactPlugin = (await import('@vitejs/plugin-react')).default

  return {
    base: BASE,
    plugins: [
      reactPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png', 'offline.html'],
        workbox: {
          // Incrementar a versão força o SW a descartar o cache antigo
          cacheId: 'dcm-mergulho-v3',
          globPatterns: ['**/*.{js,css,html,png,jpg,json,md}'],
          runtimeCaching: [
            {
              urlPattern: /\/content\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'content-cache-v3' }
            },
            {
              urlPattern: /\/assets\/content\//,
              handler: 'CacheFirst',
              options: { cacheName: 'content-images-v3', expiration: { maxEntries: 300 } }
            }
          ]
        },
        manifest: {
          name: 'Curso Mergulho DCM',
          short_name: 'Mergulho DCM',
          description: 'Manual de Mergulho - Defesa Civil Maricá',
          theme_color: '#0ea5a4',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: BASE,
          icons: [
            { src: 'icons/192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/512.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      })
    ]
  }
})

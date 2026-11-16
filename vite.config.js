import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5190,
    /* Solo desarrollo: el CORS del ERP de produccion acepta controlred.com.ar,
       no localhost. Con VITE_CATALOGO_URL=/erp/storefront/controlred/catalog
       en .env.development.local, Vite pide el catalogo real del lado del servidor. */
    proxy: {
      '/erp': {
        target: 'https://api-erp.redvision.com.ar',
        changeOrigin: true,
        rewrite: (ruta) => ruta.replace(/^\/erp/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        /* three y gsap solo los pide el inicio (chunk diferido de la vitrina).
           React va en su propio chunk: si Rollup lo metiera dentro de "three",
           toda página descargaría WebGL aunque no lo muestre. */
        manualChunks(id) {
          if (/[\/]node_modules[\/]three[\/]/.test(id)) return 'three'
          if (/[\/]node_modules[\/]gsap[\/]/.test(id)) return 'gsap'
          if (/[\/]node_modules[\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\/]/.test(id)) return 'react'
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'react'
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})

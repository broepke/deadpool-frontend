import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        'top-level-await': true
      },
      // This ensures "use client" directives are handled properly
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1MB
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore "use client" directive warnings
        if (warning.message.includes('use client')) return
        warn(warning)
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@headlessui/react', '@heroicons/react'],
          'vendor-charts': ['recharts'],
          'vendor-auth': ['oidc-client-ts', 'react-oidc-context'],
          'vendor-analytics': ['mixpanel-browser']
        }
      }
    }
  }
})

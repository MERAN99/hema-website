import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works from any folder or host.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Libraries change rarely, so keeping them in their own files lets browsers reuse them from cache.
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          vendor: ['lenis', 'lucide-react'],
        },
      },
    },
  },
});

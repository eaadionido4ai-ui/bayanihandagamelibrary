import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build runs from file:// and inside the Capacitor WebView.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2019', chunkSizeWarningLimit: 1200 },
});

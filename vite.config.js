import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Short commit id shown in Settings, so it's easy to tell which version a device runs.
function buildId() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try { return execSync('git rev-parse --short=7 HEAD').toString().trim(); } catch (e) { return 'dev'; }
}

// Relative base so the build runs from file:// and inside the Capacitor WebView.
export default defineConfig({
  base: './',
  plugins: [react()],
  define: { __BUILD_ID__: JSON.stringify(buildId()) },
  build: { target: 'es2019', chunkSizeWarningLimit: 1200 },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom plugin to copy specific files from root to dist
function copyRootAssets() {
  return {
    name: 'copy-root-assets',
    closeBundle() {
      const files = ['sitemap.xml', 'robots.txt', '_redirects', 'sw.js'];
      
      files.forEach(file => {
        const src = resolve(__dirname, file);
        const dest = resolve(__dirname, 'dist', file);
        
        // Ensure dist directory exists (it should after build)
        if (existsSync(src)) {
            try {
                copyFileSync(src, dest);
                console.log(`[copy-root-assets] Copied ${file} to dist root`);
            } catch (e) {
                console.error(`[copy-root-assets] Failed to copy ${file}:`, e);
            }
        } else {
            console.warn(`[copy-root-assets] Warning: ${file} not found in root`);
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyRootAssets()
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  publicDir: 'public', 
});
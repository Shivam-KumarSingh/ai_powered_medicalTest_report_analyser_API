import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Ensure development server serves files from the correct path
  root: path.resolve(__dirname),
  base: './',

  build: {
    // Output into the root of the 'frontend' directory (where this vite.config.js is located)
    outDir: path.resolve(__dirname),
    
    // Crucial: Keep the main bundle filename consistent
    rollupOptions: {
        output: {
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: `assets/[name].[ext]`
        }
    },
    // Don't clear the directory, as that might delete the node_modules
    emptyOutDir: false, 
  }
});

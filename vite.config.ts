import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves the Beta from the repository sub-path.
  // Ordinary local/production builds keep the root base unchanged.
  base: mode === 'beta' ? '/CurManLight_arena/' : '/',
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100000000, // force inline of all assets
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
}));

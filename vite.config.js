import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist', // output folder at WEBPROJECT/dist
    rollupOptions: {
      input: {
        // root entry
        main: resolve(__dirname, 'index.html'),
        // if you add more HTML entry points later, list them here
      },
    },
  },
});

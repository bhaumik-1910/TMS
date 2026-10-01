import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/css/quasar-variables.sass'
    })
  ],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      sass: {
        includePaths: [path.resolve(__dirname, '.')],
      },
      scss: {
        includePaths: [path.resolve(__dirname, '.')],
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        ws: true
      }
    }
  }
});

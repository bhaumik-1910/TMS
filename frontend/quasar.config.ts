// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app';
import path from 'node:path';

export default defineConfig((/* ctx */) => {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'axios',
      'echarts',
      'framework',
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: [
      'tokens.css',
      'tailwind.css',
      'app.scss',
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'roboto-font',
      'material-icons',
      'material-icons-outlined',
      'material-icons-round',
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
        node: 'node20',
      },

      typescript: {
        strict: false,
        vueShim: true,
      },

      vueRouterMode: 'history',

      extendViteConf(viteConf) {
        viteConf.resolve = viteConf.resolve || {};
        viteConf.resolve.alias = {
          ...(viteConf.resolve.alias || {}),
          '@': path.resolve(__dirname, './src'),
          'src': path.resolve(__dirname, './src'),
        };
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://127.0.0.1:3000',
          ws: true,
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {
        dark: false,
        notify: {
          position: 'top-right',
          timeout: 3500,
        },
      },

      plugins: [
        'Notify',
        'Dialog',
        'Loading',
        'Dark',
      ],
    },

    animations: [],
  };
});

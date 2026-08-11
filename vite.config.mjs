import { defineConfig } from 'vite';

// translations.jsx is also evaluated by the CommonJS server and legacy test
// harness. Keep its source as a plain data declaration; expose it as ESM only
// while Vite transforms the browser module.
const translationsAsEsm = {
  name: 'translations-as-esm',
  transform(code, id) {
    if (id.replace(/\\/g, '/').endsWith('/src/i18n/translations.jsx')) {
      return `${code}\nexport { __i18nTranslations };`;
    }
    return null;
  },
};

export default defineConfig({
  plugins: [translationsAsEsm],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          contentSeed: ['./src/lib/contentSeedData.js'],
        },
      },
    },
  },
});

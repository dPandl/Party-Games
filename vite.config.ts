import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Setzt die Basis-URL für die App.
    // Dies ist entscheidend, damit die Assets von GitHub Pages korrekt geladen werden.
    base: '/Party-Games/',
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          // Erzwingt einen festen Namen für die Haupt-JS-Datei, damit der Service Worker sie finden kann.
          // Andere Chunks behalten ihre Hashes, was für das Caching in Ordnung ist.
          entryFileNames: 'assets/index.js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  };
});
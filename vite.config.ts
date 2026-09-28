import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import path from 'node:path';

const here = import.meta.dirname;

/**
 * Default mode builds the Cloudflare Worker (API + site). `--mode pages` builds only the static
 * site for GitHub Pages, which calls the deployed Worker (see .env.pages).
 */
export default defineConfig(({ mode }) => {
  const pages = mode === 'pages';
  return {
    root: 'client',
    envDir: here,
    base: pages ? '/quizme/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      // Runs the Worker (API + local D1) inside the Vite dev server, and builds it for deploy.
      !pages &&
        cloudflare({
          configPath: path.join(here, 'wrangler.jsonc'),
          persistState: { path: path.join(here, '.wrangler/state') },
        }),
    ],
    resolve: {
      alias: {
        '@shared': path.resolve(here, 'shared'),
        '@': path.resolve(here, 'client/src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      fs: { allow: ['..'] },
    },
    build: {
      outDir: path.join(here, pages ? 'dist-pages' : 'dist'),
      emptyOutDir: true,
    },
  };
});

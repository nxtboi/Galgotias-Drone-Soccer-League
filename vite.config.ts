import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import {
  GCDIS_LOGO_B64,
  GALGOTIAS_LOGO_B64,
  HERO_VIDEO_B64,
} from './src/data/logoAssets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function restoreMediaAssetsToRoot(rootDir: string, forceWrite = false) {
  try {
    const outDir = path.join(rootDir, 'assets/aistudio');
    fs.mkdirSync(outDir, { recursive: true });

    const entries: Array<[string, string]> = [
      ['GCDIS_HD_Logo_aeb80099.png', GCDIS_LOGO_B64],
      ['Galgotias-University-Logo_6fa7e960.jpg', GALGOTIAS_LOGO_B64],
      ['hero-drone-soccer_5297df9b.mp4', HERO_VIDEO_B64],
    ];

    for (const [fileName, b64] of entries) {
      const targetPath = path.join(outDir, fileName);
      if (forceWrite || !fs.existsSync(targetPath)) {
        fs.writeFileSync(targetPath, Buffer.from(b64, 'base64'));
      }
    }
  } catch (err) {
    console.warn('Warning restoring media assets:', err);
  }
}

function restoreStaticAssetsPlugin(): Plugin {
  return {
    name: 'restore-static-assets',
    buildStart() {
      restoreMediaAssetsToRoot(path.resolve(__dirname, 'public'), false);
    },
    closeBundle() {
      restoreMediaAssetsToRoot(path.resolve(__dirname, 'dist'), false);
    },
  };
}

export default defineConfig({
  plugins: [restoreStaticAssetsPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
    // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  preview: {
    port: Number(process.env.PORT) || 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});

import path from 'path';
import { fileURLToPath } from 'url';
import type { NextConfig } from 'next';

/** Cartella del repo (dove stanno package.json e node_modules), non la cartella “ONLINE” padre. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Percorsi assoluti sotto questo repo (no require.resolve su package.json: molti pacchetti non lo esportano).
 * Serve quando Turbopack usa come contesto una cartella padre a causa di ~/package-lock.json.
 */
const tailwindRoot = path.join(projectRoot, 'node_modules', 'tailwindcss');
const tailwindPostcssRoot = path.join(projectRoot, 'node_modules', '@tailwindcss', 'postcss');

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: tailwindRoot,
      '@tailwindcss/postcss': tailwindPostcssRoot,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

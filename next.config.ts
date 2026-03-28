import path from 'path';
import { fileURLToPath } from 'url';
import type { NextConfig } from 'next';

/** Cartella del repo (dove stanno package.json e node_modules), non la cartella “ONLINE” padre. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
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

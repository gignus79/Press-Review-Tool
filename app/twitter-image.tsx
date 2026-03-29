import { ImageResponse } from 'next/og';
import { OgBrandImageMarkup } from '@/lib/og-brand-image';

export const runtime = 'edge';

export const alt = 'Press Review Tool — LabelTools suite';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(<OgBrandImageMarkup />, {
    ...size,
  });
}

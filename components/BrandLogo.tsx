'use client';

import type { SVGProps } from 'react';

/** Monocolore (`currentColor`), trasparente: mark + wordmark “LabelTools”. */
export function BrandLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 260 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <g fill="currentColor">
        <rect x="2" y="6" width="11" height="36" rx="5.5" />
        <rect x="19" y="6" width="11" height="36" rx="5.5" opacity="0.85" />
        <rect x="36" y="6" width="11" height="36" rx="5.5" opacity="0.68" />
        <text
          x="58"
          y="33"
          fill="currentColor"
          style={{ font: '700 26px ui-sans-serif, system-ui, sans-serif' }}
        >
          LabelTools
        </text>
      </g>
    </svg>
  );
}

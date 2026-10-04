/**
 * Freight silhouettes drawn pointing right (+x), centred on 0,0,
 * so MotionPathPlugin can rotate them along a route.
 */
export function PlaneGlyph() {
  return (
    <path d="M9 0 L6.5 -1 L1.5 -1 L-2.5 -6.5 L-4.5 -6.5 L-2 -1 L-6.5 -1 L-8.5 -3.2 L-9.8 -3.2 L-8.6 0 L-9.8 3.2 L-8.5 3.2 L-6.5 1 L-2 1 L-4.5 6.5 L-2.5 6.5 L1.5 1 L6.5 1 Z" />
  );
}

export function ShipGlyph() {
  return (
    <g>
      <path d="M10 0 L7 -2.6 L-9 -2.6 L-9 2.6 L7 2.6 Z" />
      <rect x="-6" y="-1.8" width="2.6" height="3.6" fill="var(--color-navy)" opacity=".55" />
      <rect x="-2.6" y="-1.8" width="2.6" height="3.6" fill="var(--color-navy)" opacity=".35" />
      <rect x="0.8" y="-1.8" width="2.6" height="3.6" fill="var(--color-navy)" opacity=".55" />
    </g>
  );
}

export function TrainGlyph() {
  return (
    <g>
      <rect x="-10" y="-1.8" width="5.4" height="3.6" rx=".6" />
      <rect x="-4" y="-1.8" width="5.4" height="3.6" rx=".6" />
      <path d="M2 -1.8 L7.5 -1.8 L9.5 0 L7.5 1.8 L2 1.8 Z" />
    </g>
  );
}

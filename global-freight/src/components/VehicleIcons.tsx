/**
 * Freight silhouettes drawn pointing right (+x), centred on 0,0.
 */
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

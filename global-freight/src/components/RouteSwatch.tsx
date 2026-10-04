import type { Mode } from '../sections/heroRoutes';

/** Line sample for a route legend: air dashed, ocean solid, rail dotted. */
export function RouteSwatch({ mode }: { mode: Mode }) {
  const dash = mode === 'air' ? '6 4' : mode === 'land' ? '2 3' : undefined;
  return (
    <svg width="28" height="6" viewBox="0 0 28 6" aria-hidden="true" className="shrink-0">
      <line x1="1" y1="3" x2="27" y2="3" stroke="var(--color-signal)" strokeWidth={mode === 'ocean' ? 2.4 : 2} strokeDasharray={dash} strokeLinecap="round" />
    </svg>
  );
}

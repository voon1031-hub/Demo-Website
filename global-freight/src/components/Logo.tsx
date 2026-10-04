import { brand } from '../config/brand';

/** Uses brand.logo.src when set; otherwise a placeholder route mark + name. */
export function Logo({ compact = false }: { compact?: boolean }) {
  if (brand.logo.src) {
    return <img src={brand.logo.src} alt={brand.logo.alt} width={brand.logo.width} height={brand.logo.height} />;
  }
  return (
    <span className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="currentColor" opacity=".12" />
        <path d="M6 22 C12 8, 20 8, 26 22" fill="none" stroke="var(--color-signal)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="type-heading text-base">{compact ? brand.shortName : brand.name}</span>
    </span>
  );
}

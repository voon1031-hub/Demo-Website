import { brand } from '../config/brand';

/** Logo mark from brand.logo plus the company name in the site font. */
export function Logo({ compact = false }: { compact?: boolean }) {
  const { mark, showName } = brand.logo;
  return (
    <span className="flex items-center gap-2.5">
      {/* The name next to it carries the accessible label, so the mark is decorative. */}
      <img src={mark} alt={showName ? '' : brand.name} width={28} height={28} className="h-7 w-7" />
      {showName && <span className="type-heading text-base">{compact ? brand.shortName : brand.name}</span>}
    </span>
  );
}

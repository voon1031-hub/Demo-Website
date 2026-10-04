import { brand } from '../config/brand';
import { useContent } from '../content';
import { scrollToId } from '../lib/lenis';
import { Logo } from './Logo';

export function Footer() {
  const t = useContent();
  return (
    <footer className="border-t border-chart/20 bg-navy-deep px-4 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-[36ch] text-sm text-chart-light">{brand.slogan}</p>
        </div>
        <nav aria-label={t.nav.label}>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {t.nav.links.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={(e) => (e.preventDefault(), scrollToId(l.id))} className="text-chart-light transition-colors hover:text-fog">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2 text-sm">
          <a href={`https://wa.me/${brand.contact.whatsapp.intl}`} target="_blank" rel="noopener noreferrer" className="text-fog hover:text-signal-text">
            WhatsApp {brand.contact.whatsapp.display}
          </a>
          <a href={`mailto:${brand.contact.email}`} className="text-fog hover:text-signal-text">
            {brand.contact.email}
          </a>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-chart/15 pt-6 text-sm text-chart-light">
        <p>
          © {new Date().getFullYear()} {brand.name}. {t.footer.rights}
        </p>
        <a href="#hero" onClick={(e) => (e.preventDefault(), scrollToId('hero'))} className="hover:text-fog">
          {t.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}

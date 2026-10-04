import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { scrollToId } from '../lib/lenis';
import { useContent, type SectionId } from '../content';
import { useActiveSection } from '../hooks/useActiveSection';
import { Logo } from './Logo';

export function Nav({ ready }: { ready: boolean }) {
  const t = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const ids = useRef(t.nav.links.map((l) => l.id)).current;
  const active = useActiveSection(ids, ready);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Transparent over the hero, frosted glass once the page moves.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 48,
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: SectionId) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled || open
          ? 'bg-navy/92 shadow-[0_1px_0_rgb(126_147_168/0.18)]'
          : 'bg-transparent'
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-signal focus:px-3 focus:py-2 focus:text-navy">
        {t.meta.skipToContent}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
        <a href="#hero" onClick={go('hero')} className="shrink-0">
          <Logo />
        </a>

        <nav aria-label={t.nav.label} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {t.nav.links.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={go(link.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`relative block px-3 py-2 text-sm transition-colors duration-200 ${
                      isActive ? 'text-fog' : 'text-chart hover:text-fog'
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-signal transition-transform duration-300 ease-[var(--ease-cargo)] ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contact" onClick={go('contact')} className="btn btn-primary hidden sm:inline-flex">
            {t.nav.cta}
          </a>
          <button
            ref={menuButton}
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.meta.closeMenu : t.meta.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M5 5l12 12M17 5L5 17" />
              ) : (
                <path d="M3 7h16M3 15h10" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={t.nav.label} className="h-[calc(100svh-4rem)] overflow-y-auto border-t border-chart/15 px-4 pb-10 pt-4 lg:hidden">
          <ul className="flex flex-col">
            {t.nav.links.map((link, i) => (
              <li key={link.id}>
                <a
                  ref={i === 0 ? firstLink : undefined}
                  href={`#${link.id}`}
                  onClick={go(link.id)}
                  aria-current={active === link.id ? 'location' : undefined}
                  className={`type-heading flex min-h-14 items-center border-b border-chart/10 text-xl ${
                    active === link.id ? 'text-signal' : 'text-fog'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" onClick={go('contact')} className="btn btn-primary mt-8 w-full justify-center">
            {t.nav.cta}
          </a>
        </nav>
      )}
    </header>
  );
}

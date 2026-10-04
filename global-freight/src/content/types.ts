/**
 * Shape of all on-page copy. Each locale file (en.ts, zh.ts, …) must
 * satisfy this type, so a missing string is a compile error.
 * Brand name, slogan and numbers live in config/brand.ts, not here.
 */
export type SectionId =
  | 'hero'
  | 'about'
  | 'air'
  | 'ocean'
  | 'land'
  | 'network'
  | 'process'
  | 'why'
  | 'contact';

export type Content = {
  meta: { skipToContent: string; openMenu: string; closeMenu: string };
  nav: {
    label: string;
    links: { id: SectionId; label: string }[];
    cta: string;
  };
  hero: {
    lede: string;
    primaryCta: string;
    secondaryCta: string;
    legendTitle: string;
    legend: { mode: 'air' | 'ocean' | 'land'; route: string; transit: string }[];
    scrollHint: string;
    mapLabel: string;
  };
  ocean: {
    heading: string;
    intro: string;
    facts: { term: string; detail: string }[];
    panels: { heading: string; body: string }[];
    handoff: { heading: string; body: string };
    ports: string[];
  };
  contact: { heading: string; email: string; whatsapp: string };
  pending: { title: string; note: string };
};

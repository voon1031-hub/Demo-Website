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
    scrollHint: string;
  };
  air: {
    heading: string;
    intro: string;
    facts: { term: string; detail: string }[];
    globeLabel: string;
    routeLabel: string;
  };
  land: {
    heading: string;
    intro: string;
    facts: { term: string; detail: string }[];
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
  about: {
    heading: string;
    intro: string;
    stats: { key: 'countries' | 'annualTonnes' | 'onTimeRate'; label: string }[];
  };
  network: {
    heading: string;
    intro: string;
    regions: { name: string; hubs: string[] }[];
    hubsLabel: string;
    mapLabel: string;
  };
  process: {
    heading: string;
    intro: string;
    steps: { title: string; body: string }[];
  };
  why: {
    heading: string;
    items: { title: string; body: string; figure?: string }[];
  };
  form: {
    heading: string;
    intro: string;
    responseTime: string;
    fields: {
      name: string;
      company: string;
      email: string;
      from: string;
      to: string;
      mode: string;
      modes: string[];
      details: string;
      detailsHint: string;
    };
    sendWhatsApp: string;
    sendEmail: string;
    sendNote: string;
    errors: { required: string; email: string };
    messageIntro: string;
  };
  footer: { rights: string; backToTop: string };
};

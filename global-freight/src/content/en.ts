import type { Content } from './types';

export const en: Content = {
  meta: {
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  nav: {
    label: 'Main',
    links: [
      { id: 'about', label: 'About' },
      { id: 'air', label: 'Air' },
      { id: 'ocean', label: 'Ocean' },
      { id: 'land', label: 'Land' },
      { id: 'network', label: 'Network' },
      { id: 'process', label: 'How it works' },
      { id: 'why', label: 'Why us' },
    ],
    cta: 'Get a quote',
  },
  hero: {
    lede: 'Air, ocean and land freight, booked and tracked as one shipment from pickup to delivery.',
    primaryCta: 'Get a quote',
    secondaryCta: 'See how it moves',
    scrollHint: 'Scroll to open',
  },
  air: {
    heading: 'By air',
    intro:
      'Space on scheduled freighters and passenger bellies between the main hubs, for cargo that cannot wait for a ship.',
    facts: [
      { term: 'Airport to airport', detail: '1–2 days' },
      { term: 'Options', detail: 'Consolidated, direct and charter' },
      { term: 'Special cargo', detail: 'Temperature-controlled and dangerous goods' },
    ],
    globeLabel: 'Globe zooming in from orbit to a cargo flight between Hong Kong and Frankfurt',
    routeLabel: 'Hong Kong to Frankfurt',
  },
  ocean: {
    heading: 'By sea',
    intro:
      'Full and shared container loads on the main trade lanes, with weekly sailings and space confirmed when you book.',
    facts: [
      { term: 'Ports served', detail: '{oceanPorts}' },
      { term: 'Loads', detail: 'Full (FCL) and shared (LCL)' },
      { term: 'Sailings', detail: 'Weekly on main lanes' },
    ],
    panels: [
      {
        heading: 'Space held before the ship arrives',
        body: 'We keep allocations with the major carriers, so your container is on the vessel you booked, even in peak season.',
      },
      {
        heading: 'Every box visible at sea',
        body: 'Position updates every six hours, and an alert the moment an arrival date moves.',
      },
    ],
    handoff: {
      heading: 'The truck is booked before the ship docks',
      body: 'Customs papers are filed in transit, so your container leaves the quay on the day it lands.',
    },
    ports: ['Shanghai', 'Singapore', 'Colombo', 'Suez', 'Rotterdam'],
  },
  contact: {
    heading: 'Contact',
    email: 'Email',
    whatsapp: 'WhatsApp',
  },
  pending: {
    title: 'Built in the next round',
    note: 'This section follows once the Hero and Ocean style are approved.',
  },
};

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
  land: {
    heading: 'By land',
    intro:
      'Trucks and rail from the port to the door, booked together with the sea or air leg so the hand-off is planned before the cargo lands.',
    facts: [
      { term: 'Road', detail: 'Full and part truckloads' },
      { term: 'Rail', detail: 'China–Europe in 14–18 days' },
      { term: 'Borders', detail: 'Customs filed in transit' },
    ],
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
  about: {
    heading: 'Freight at the scale of trade',
    intro:
      '{name} moves cargo for manufacturers, retailers and distributors, with our own teams at the main hubs and trusted partners everywhere else.',
    stats: [
      { key: 'countries', label: 'Countries served' },
      { key: 'annualTonnes', label: 'Tonnes moved a year' },
      { key: 'onTimeRate', label: 'Delivered on the promised day' },
    ],
  },
  network: {
    heading: 'One network, every lane',
    intro: 'Our own offices at {hubs} hubs, connected so a shipment changes mode without changing hands.',
    regions: [
      { name: 'Asia Pacific', hubs: ['Shanghai', 'Hong Kong', 'Singapore', 'Tokyo', 'Sydney'] },
      { name: 'Middle East', hubs: ['Dubai', 'Jeddah'] },
      { name: 'Europe', hubs: ['Rotterdam', 'Frankfurt', 'Duisburg', 'Warsaw'] },
      { name: 'Americas', hubs: ['New York', 'Chicago', 'Los Angeles', 'Santos'] },
    ],
    hubsLabel: 'hubs',
    mapLabel: 'World map with the company’s hubs and the lanes between them',
  },
  process: {
    heading: 'How a shipment moves',
    intro: 'Five steps, one booking, and one place to see where your cargo is.',
    steps: [
      { title: 'Book', body: 'Get a price and book in minutes. One booking covers every leg.' },
      { title: 'Pickup', body: 'We collect from your door or warehouse at the time you choose.' },
      { title: 'Transit', body: 'Air, ocean or land, tracked in one view with an alert when anything changes.' },
      { title: 'Customs', body: 'Papers are filed before arrival, so cargo clears without waiting at the border.' },
      { title: 'Delivery', body: 'Delivered to the door, with proof of delivery in your account.' },
    ],
  },
  why: {
    heading: 'Why shippers stay with us',
    items: [
      { title: 'On time, measured', body: 'Shipments delivered on the day we promised, across every mode last year.', figure: '{onTimeRate}%' },
      { title: 'One contact for every leg', body: 'Your account manager handles air, ocean and land, and answers on WhatsApp.' },
      { title: 'Space in peak season', body: 'Allocations with the major carriers keep your cargo moving when space runs out.' },
      { title: 'Quotes that match the invoice', body: 'Every leg and fee is in the price up front.' },
    ],
  },
  form: {
    heading: 'Get a quote',
    intro: 'Tell us what you are shipping. We reply within one business day, usually sooner.',
    responseTime: 'Mon–Sat, 9:00–18:00 (GMT+8)',
    fields: {
      name: 'Your name',
      company: 'Company',
      email: 'Email',
      from: 'From (city or port)',
      to: 'To (city or port)',
      mode: 'Mode',
      modes: ['Not sure yet', 'Air', 'Ocean', 'Land'],
      details: 'What are you shipping?',
      detailsHint: 'Goods, weight or volume, and when it needs to arrive',
    },
    sendWhatsApp: 'Send on WhatsApp',
    sendEmail: 'Send by email',
    sendNote: 'Opens WhatsApp or your email app with your details filled in, ready to send.',
    errors: { required: 'Fill in this field.', email: 'Enter an email address like name@company.com.' },
    messageIntro: 'Quote request',
  },
  footer: { rights: 'All rights reserved.', backToTop: 'Back to top' },
};

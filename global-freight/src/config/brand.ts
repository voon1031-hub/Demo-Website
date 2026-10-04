/**
 * Brand settings — the one file to edit when the real name, slogan,
 * logo and contact details are ready. Nothing else in src/ hard-codes these.
 */
export const brand = {
  name: '[Company Name]',
  /** Short form used in the nav on small screens. */
  shortName: '[Co.]',
  slogan: '[Slogan]',
  /**
   * Logo: leave `src` empty to show the placeholder mark + name.
   * Set it to e.g. '/media/logo.svg' (file in public/media/) to use your logo.
   */
  logo: {
    src: '',
    alt: '[Company Name] logo',
    width: 140,
    height: 32,
  },
  contact: {
    email: 'hello@example.com',
    phone: '+00 000 000 0000',
    address: '[Street address], [City], [Country]',
  },
  /** Headline numbers. Values are placeholders until you have audited figures. */
  stats: {
    countries: 160,
    annualTonnes: 4_200_000,
    onTimeRate: 98.6,
    oceanPorts: 40,
  },
  /** Default UI language. Add a matching file in src/content/ to add another. */
  locale: 'en' as const,
} as const;

export type Brand = typeof brand;

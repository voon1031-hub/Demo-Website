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
   * Logo. `mark` is the symbol (path inside public/, e.g. 'media/logo-mark.svg'); the company name is
   * set next to it in the site font, so it updates with `name` above.
   * Set `showName: false` if you swap in a full logo that already contains the name.
   */
  logo: {
    mark: 'media/logo-mark.svg',
    showName: true,
  },
  contact: {
    email: 'voon1031@gmail.com',
    /**
     * `display` is what the page shows; `intl` is the full number in digits
     * with country code and no '+', used for the wa.me chat link.
     */
    whatsapp: { display: '+65 9048 7168', intl: '6590487168' },
    /** Leave empty to hide the address line. */
    address: '',
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

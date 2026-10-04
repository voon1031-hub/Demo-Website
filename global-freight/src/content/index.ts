import { brand } from '../config/brand';
import type { Content } from './types';
import { en } from './en';

/**
 * Locale registry. To add Chinese: create zh.ts exporting `zh: Content`,
 * add it here, and set `locale` in config/brand.ts (or wire a switcher).
 */
const locales = { en } satisfies Record<string, Content>;
export type Locale = keyof typeof locales;

export function useContent(locale: Locale = brand.locale): Content {
  return locales[locale];
}

/** Replaces {name} with the company name and {statKey} with values from brand.stats. */
export function fillStats(text: string, locale: Locale = brand.locale): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (key === 'name') return brand.name;
    const value = (brand.stats as Record<string, number>)[key];
    return value === undefined ? match : value.toLocaleString(locale);
  });
}

export type { Content, SectionId } from './types';

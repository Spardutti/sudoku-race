import { locales } from '@/i18n';
import { SITE_URL } from '@/lib/config';

export function generateHreflangLinks(pathname: string) {
  const alternates: { languages: Record<string, string> } = {
    languages: {},
  };

  locales.forEach((locale) => {
    alternates.languages[locale] = `${SITE_URL}/${locale}${pathname}`;
  });

  alternates.languages['x-default'] = `${SITE_URL}/en${pathname}`;

  return alternates;
}

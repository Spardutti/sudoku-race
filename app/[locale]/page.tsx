import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL } from "@/lib/config";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateHreflangLinks(''),
  };
}

export default async function Home() {
  const t = await getTranslations('home');

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t('title'),
    description: t('description'),
    url: SITE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 font-serif text-5xl font-bold text-black md:text-6xl">
            {t('title')}
          </h1>
          <h2 className="mb-6 font-serif text-2xl text-black md:text-3xl">
            {t('subtitle')}
          </h2>
          <p className="text-lg text-gray-700">
            {t('description')}
          </p>
        </div>
      </div>
    </>
  );
}

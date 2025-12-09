import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.landing' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: "website",
    },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });

  return (
    <div className="flex flex-col justify-center items-center bg-white px-6 py-12 min-h-full">
      <div className="max-w-2xl w-full space-y-6 text-center">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="font-serif text-black leading-tight">
            <span className="block text-5xl md:text-7xl">
              {t('headlinePart1')}
            </span>
            <span className="block text-3xl md:text-5xl mt-2 text-gray-700">
              {t('headlinePart2')}
            </span>
            <span className="block text-5xl md:text-7xl mt-2">
              {t('headlinePart3')}
            </span>
          </h1>
          <div className="text-lg md:text-xl text-gray-700 leading-relaxed space-y-1">
            <p>{t('subheadlineLine1')}</p>
            <p>{t('subheadlineLine2')}</p>
          </div>
        </div>

        {/* Value Props */}
        <div className="space-y-4 text-left max-w-xl mx-auto">
          <ul className="space-y-3 text-base md:text-lg text-gray-800">
            <li className="flex items-start gap-3">
              <span className="text-black mt-1">•</span>
              <span>{t('valueProp1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black mt-1">•</span>
              <span>{t('valueProp2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black mt-1">•</span>
              <span>{t('valueProp3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black mt-1">•</span>
              <span>{t('valueProp4')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black mt-1">•</span>
              <span>{t('valueProp5')}</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-4 space-y-2">
          <Button variant="primary" size="lg" asChild className="w-full md:w-auto md:min-w-[300px]">
            <Link href={`/${locale}/puzzle`}>
              {t('cta')}
            </Link>
          </Button>
          <p className="text-sm text-gray-600">
            {t('ctaMicroLine')}
          </p>
        </div>
      </div>
    </div>
  );
}

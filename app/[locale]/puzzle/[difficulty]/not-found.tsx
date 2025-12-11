"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function DifficultyNotFound() {
  const t = useTranslations("errors.difficultyNotFound");
  const params = useParams();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="text-6xl font-serif font-bold text-black">404</div>
          <h1 className="text-3xl font-serif font-bold text-black">
            {t("title")}
          </h1>
          <p className="text-gray-600">
            {t("description")}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href={`/${params.locale}/puzzle`}
            className="inline-block w-full px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors border-2 border-black"
          >
            {t("backButton")}
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          {t("availableDifficulties")}
        </p>
      </div>
    </div>
  );
}

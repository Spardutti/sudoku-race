import { useTranslations } from "next-intl";

export function PuzzleLoadingView() {
  const t = useTranslations("puzzle");

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-gray-600">{t("loading")}</div>
      </div>
    </div>
  );
}

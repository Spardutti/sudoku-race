"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

interface LockToggleProps {
  lockMode: boolean;
  onToggle: () => void;
}

export const LockToggle = ({ lockMode, onToggle }: LockToggleProps) => {
  const t = useTranslations('puzzle');

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center justify-center
        min-w-[44px] min-h-[44px]
        border-2 rounded
        transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-offset-2
        ${
          lockMode
            ? "bg-gray-200 border-black text-black hover:bg-gray-300 focus-visible:ring-gray-500"
            : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 focus-visible:ring-gray-400"
        }
      `}
      aria-label={lockMode ? t('lockModeActive') : t('lockMode')}
      aria-pressed={lockMode}
      type="button"
    >
      <Lock
        className="w-5 h-5"
        aria-hidden="true"
      />
    </button>
  );
};

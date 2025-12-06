"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

interface NoteModeToggleProps {
  noteMode: boolean;
  onToggle: () => void;
}

export function NoteModeToggle({ noteMode, onToggle }: NoteModeToggleProps) {
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
          noteMode
            ? "bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-500"
            : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 focus-visible:ring-gray-400"
        }
      `}
      aria-label={noteMode ? t('noteModeActive') : t('noteMode')}
      aria-pressed={noteMode}
      type="button"
    >
      <Pencil
        className={`w-5 h-5 ${noteMode ? 'fill-current' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}

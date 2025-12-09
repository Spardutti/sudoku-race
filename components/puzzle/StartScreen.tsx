'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface StartScreenProps {
  puzzleNumber: number;
  onStart: () => void;
}

export function StartScreen({ puzzleNumber, onStart }: StartScreenProps) {
  const t = useTranslations('puzzle');

  return (
    <div className="flex flex-col min-h-full p-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Daily Sudoku #{puzzleNumber}
        </h2>
        <p className="text-gray-600 mb-8">
          Press Start when you&apos;re ready to begin. The timer will start immediately.
        </p>
        <Button
          onClick={onStart}
          size="lg"
          aria-label="Start puzzle timer"
        >
          {t('startButton')}
        </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Button } from "@/components/ui/button";
import { Pause } from "lucide-react";
import { useTranslations } from "next-intl";

interface PauseButtonProps {
  onPause: () => void;
  disabled?: boolean;
}

export function PauseButton({ onPause, disabled = false }: PauseButtonProps) {
  const t = useTranslations('puzzle');

  return (
    <Button
      onClick={onPause}
      disabled={disabled}
      variant="ghost"
      size="sm"
      aria-label="Pause puzzle"
      className="gap-2"
    >
      <Pause className="h-4 w-4" />
      {t('pauseButton')}
    </Button>
  );
}

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Twitter, MessageCircle, Clipboard, Check } from "lucide-react";
import type { StreakData } from "@/lib/types/streak";
import { useTranslations, useLocale } from "next-intl";
import { useShareHandlers } from "@/components/puzzle/useShareHandlers";

interface ShareButtonsProps {
  puzzleId: string;
  puzzleNumber: number;
  completionTime: number;
  emojiGrid: string;
  rank?: number;
  streakData?: StreakData;
  difficulty?: 'easy' | 'medium' | 'hard';
  className?: string;
}

export const ShareButtons = ({
  puzzleId,
  puzzleNumber,
  completionTime,
  emojiGrid,
  rank,
  streakData,
  difficulty,
  className,
}: ShareButtonsProps) => {
  const t = useTranslations('puzzle');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const {
    handleCopyToClipboard,
    handleTwitterShare,
    handleWhatsAppShare,
    copied,
    copyError,
  } = useShareHandlers({
    puzzleId,
    puzzleNumber,
    completionTime,
    emojiGrid,
    rank,
    streakData,
    difficulty,
    locale,
  });

  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${className || ''}`}>
      <Button
        onClick={handleTwitterShare}
        className="flex-1 h-9 sm:h-10"
        aria-label="Share puzzle results on Twitter"
        data-testid="twitter-share-button"
      >
        <Twitter className="mr-2 h-4 w-4" />
        Twitter
      </Button>
      <Button
        onClick={handleWhatsAppShare}
        className="flex-1 h-9 sm:h-10"
        aria-label="Share puzzle results via WhatsApp"
        data-testid="whatsapp-share-button"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
      <Button
        onClick={handleCopyToClipboard}
        className="flex-1 h-9 sm:h-10"
        aria-label="Copy puzzle results to clipboard"
        data-testid="copy-clipboard-button"
      >
        {copyError ? (
          <>
            <span className="mr-2 text-red-500">✗</span>
            {t('failed')}
          </>
        ) : copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            {t('copied')}
          </>
        ) : (
          <>
            <Clipboard className="mr-2 h-4 w-4" />
            {tCommon('copy')}
          </>
        )}
      </Button>
    </div>
  );
};

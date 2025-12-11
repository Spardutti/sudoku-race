"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getHypotheticalRank } from "@/actions/leaderboard";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { generateEmojiGrid } from "@/lib/utils/emoji-grid";
import type { SolvePath } from "@/lib/types/solve-path";
import { generateEmojiShareText, getPuzzleUrl } from "@/lib/utils/share-text";
import { openTwitterShare, openWhatsAppShare, detectPopupBlocked } from "@/lib/utils/share";
import { logShareEvent } from "@/actions/share";
import { toast } from "sonner";
import { Twitter, MessageCircle, Clipboard, Check } from "lucide-react";
import type { StreakData } from "@/lib/types/streak";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations, useLocale } from "next-intl";

interface CompletionModalProps {
  isOpen: boolean;
  completionTime: number;
  puzzleId: string;
  rank?: number;
  isAuthenticated: boolean;
  onClose: () => void;
  puzzle: number[][];
  solvePath: SolvePath;
  puzzleNumber: number;
  streakData?: StreakData;
  difficulty?: 'easy' | 'medium' | 'hard';
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function CompletionModal({
  isOpen,
  completionTime,
  puzzleId,
  rank,
  isAuthenticated,
  onClose,
  puzzle,
  solvePath,
  puzzleNumber,
  streakData,
  difficulty,
}: CompletionModalProps) {
  const t = useTranslations('puzzle');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [hypotheticalRank, setHypotheticalRank] = React.useState<number | null>(null);
  const [isLoadingRank, setIsLoadingRank] = React.useState(false);
  const [showAuthButtons, setShowAuthButtons] = React.useState(false);
  const [emojiGrid, setEmojiGrid] = React.useState<string | null>(null);
  const [shareText, setShareText] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState(false);
  const copyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated && isOpen && !hypotheticalRank) {
      setIsLoadingRank(true);
      getHypotheticalRank(puzzleId, completionTime)
        .then((result) => {
          if (result.success) {
            setHypotheticalRank(result.data);
          }
        })
        .finally(() => setIsLoadingRank(false));
    }
  }, [isOpen, isAuthenticated, puzzleId, completionTime, hypotheticalRank]);

  React.useEffect(() => {
    if (isOpen && puzzle && solvePath && !emojiGrid) {
      try {
        const grid = generateEmojiGrid(puzzle, solvePath);
        setEmojiGrid(grid);
      } catch (error) {
        console.error("[CompletionModal] Failed to generate emoji grid:", error);
        setEmojiGrid(null);
      }
    }
  }, [isOpen, puzzle, solvePath, emojiGrid]);

  React.useEffect(() => {
    if (emojiGrid && !shareText) {
      const puzzleUrl = getPuzzleUrl();
      const text = generateEmojiShareText(
        puzzleNumber,
        completionTime,
        emojiGrid,
        puzzleUrl,
        'clipboard',
        locale,
        streakData?.currentStreak,
        difficulty
      );
      setShareText(text);
    }
  }, [emojiGrid, shareText, puzzleNumber, completionTime, locale, streakData, difficulty]);

  const guestRank = hypotheticalRank ?? null;

  const handleCopyToClipboard = async () => {
    if (!shareText || !emojiGrid) return;

    setCopyError(false);

    const clipboardShareText = generateEmojiShareText(
      puzzleNumber,
      completionTime,
      emojiGrid,
      getPuzzleUrl(),
      'clipboard',
      locale,
      streakData?.currentStreak,
      difficulty
    );

    try {
      await navigator.clipboard.writeText(clipboardShareText);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);

      logShareEvent({
        puzzleId,
        channel: 'clipboard',
        rankAtShare: rank,
      }).catch(() => {});
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = clipboardShareText;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);

        logShareEvent({
          puzzleId,
          channel: 'clipboard',
          rankAtShare: rank,
        }).catch(() => {});
      } else {
        setCopyError(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopyError(false), 2000);
      }
    }
  };

  const handleTwitterShare = () => {
    if (!emojiGrid) return;

    const twitterShareText = generateEmojiShareText(
      puzzleNumber,
      completionTime,
      emojiGrid,
      getPuzzleUrl(),
      'twitter',
      locale,
      streakData?.currentStreak,
      difficulty
    );

    logShareEvent({
      puzzleId,
      channel: 'twitter',
      rankAtShare: rank,
    }).catch(() => {});

    const popup = openTwitterShare(twitterShareText);

    if (detectPopupBlocked(popup)) {
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterShareText)}`;
      toast.error("Popup blocked", {
        description: `Click here to share on Twitter: ${shareUrl}`,
        duration: 5000,
      });
    }
  };

  const handleWhatsAppShare = () => {
    if (!emojiGrid) return;

    const whatsappShareText = generateEmojiShareText(
      puzzleNumber,
      completionTime,
      emojiGrid,
      getPuzzleUrl(),
      'whatsapp',
      locale,
      streakData?.currentStreak,
      difficulty
    );

    logShareEvent({
      puzzleId,
      channel: 'whatsapp',
      rankAtShare: rank,
    }).catch(() => {});

    const isDesktop = typeof navigator !== 'undefined' &&
      !/Mobile|Android|iPhone/i.test(navigator.userAgent);
    const isFirefox = typeof navigator !== 'undefined' &&
      /Firefox/i.test(navigator.userAgent);

    if (isDesktop && isFirefox && !navigator.share) {
      toast.info("Emoji Tip", {
        description: "For best emoji support on Firefox, use the Copy to Clipboard button instead",
        duration: 4000,
      });
    }

    const popup = openWhatsAppShare(whatsappShareText);

    if (detectPopupBlocked(popup)) {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`;
      toast.error("Popup blocked", {
        description: `Click here to share on WhatsApp: ${shareUrl}`,
        duration: 5000,
      });
    }
  };

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {t('congratulations')}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center mb-1 sm:mb-6">
          <p className="mb-0 sm:mb-2 text-sm sm:text-base text-gray-600">{t('yourTime')}</p>
          <p className="font-mono text-3xl sm:text-4xl font-bold text-gray-900">
            {formatTime(completionTime)}
          </p>
        </div>

        {shareText && (
          <div className="mb-1 sm:mb-6">
            <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-600">{t('previewShareText')}</p>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-2 sm:p-3">
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-gray-700">
                {shareText}
              </pre>
            </div>
          </div>
        )}

        {shareText && (
          <div className="mb-1 sm:mb-6 flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleTwitterShare}
              className="flex-1 h-9 sm:h-10"
              aria-label="Share puzzle results on Twitter"
            >
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button
              onClick={handleWhatsAppShare}
              className="flex-1 h-9 sm:h-10"
              aria-label="Share puzzle results via WhatsApp"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              onClick={handleCopyToClipboard}
              className="flex-1 h-9 sm:h-10"
              aria-label="Copy puzzle results to clipboard"
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
        )}

        {isAuthenticated ? (
          <div className="rounded-md bg-gray-50 p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600">{t('yourRankLabel')}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {typeof rank === 'number' && rank > 0 ? `#${rank}` : t('calculating')}
            </p>
            {process.env.NODE_ENV !== 'production' && (
              <p className="text-xs text-gray-500 mt-1">
                Debug: rank={JSON.stringify(rank)}, type={typeof rank}
              </p>
            )}
            {streakData && streakData.currentStreak > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 cursor-help">
                      {t('dayStreak', { count: streakData.currentStreak })} 🔥
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {streakData.freezeWasUsed
                        ? t('freezeUsedProtect')
                        : streakData.freezeAvailable
                          ? t('freezeReady')
                          : t('completeTomorrow')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : (
          <div className="rounded-md border-2 border-gray-200 bg-gray-50 p-3 sm:p-4">
            <p className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-gray-900">
              {isLoadingRank
                ? t('calculatingRank')
                : guestRank !== null
                  ? t('niceTime', { rank: guestRank })
                  : t('signInToClaim')}
            </p>
            <p className="mb-3 sm:mb-4 text-xs text-gray-500">
              {t('withoutSignIn')}
            </p>
            {showAuthButtons ? (
              <div className="flex flex-col gap-2">
                <AuthButtons returnUrl="/puzzle?showCompletion=true" />
                <Button onClick={() => setShowAuthButtons(false)} variant="secondary" className="w-full">
                  {t('back')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button onClick={() => setShowAuthButtons(true)} className="w-full">{t('signIn')}</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">
                  {t('maybeLater')}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

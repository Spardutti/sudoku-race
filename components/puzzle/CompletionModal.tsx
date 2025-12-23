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
import { ShareButtons } from "@/components/puzzle/ShareButtons";
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

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const CompletionModal = ({
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
}: CompletionModalProps) => {
  const t = useTranslations('puzzle');
  const locale = useLocale();
  const [hypotheticalRank, setHypotheticalRank] = React.useState<number | null>(null);
  const [isLoadingRank, setIsLoadingRank] = React.useState(false);
  const [showAuthButtons, setShowAuthButtons] = React.useState(false);
  const [emojiGrid, setEmojiGrid] = React.useState<string | null>(null);
  const [shareText, setShareText] = React.useState<string | null>(null);
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="completion-modal">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {t('congratulations')}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center mb-1 sm:mb-6">
          <p className="mb-0 sm:mb-2 text-sm sm:text-base text-gray-600">{t('yourTime')}</p>
          <p className="font-mono text-3xl sm:text-4xl font-bold text-gray-900" data-testid="completion-time">
            {formatTime(completionTime)}
          </p>
        </div>
        {shareText && (
          <div className="mb-1 sm:mb-6">
            <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-600">{t('previewShareText')}</p>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-2 sm:p-3" data-testid="share-preview">
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-gray-700">
                {shareText}
              </pre>
            </div>
          </div>
        )}
        {shareText && emojiGrid && (
          <ShareButtons
            puzzleId={puzzleId}
            puzzleNumber={puzzleNumber}
            completionTime={completionTime}
            emojiGrid={emojiGrid}
            rank={rank}
            streakData={streakData}
            difficulty={difficulty}
            className="mb-1 sm:mb-6"
          />
        )}
        {isAuthenticated ? (
          <div className="rounded-md bg-gray-50 p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600">{t('yourRankLabel')}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900" data-testid="user-rank">
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
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 cursor-help" data-testid="streak-display">
                      {t('dayStreak', { count: streakData.currentStreak })} 🔥
                    </p>
                  </TooltipTrigger>
                  <TooltipContent data-testid="freeze-tooltip">
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
          <div className="rounded-md border-2 border-gray-200 bg-gray-50 p-3 sm:p-4" data-testid="sign-in-prompt">
            <p className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-gray-900" data-testid="hypothetical-rank-message">
              {isLoadingRank
                ? t('calculatingRank')
                : hypotheticalRank !== null
                  ? t('niceTime', { rank: hypotheticalRank })
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
                <Button onClick={() => setShowAuthButtons(true)} className="w-full" data-testid="sign-in-button">{t('signIn')}</Button>
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
};

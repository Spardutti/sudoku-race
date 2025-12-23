import * as React from "react";
import { generateEmojiShareText, getPuzzleUrl } from "@/lib/utils/share-text";
import { openTwitterShare, openWhatsAppShare, detectPopupBlocked } from "@/lib/utils/share";
import { logShareEvent } from "@/actions/share";
import { toast } from "sonner";
import type { StreakData } from "@/lib/types/streak";

interface UseShareHandlersProps {
  puzzleId: string;
  puzzleNumber: number;
  completionTime: number;
  emojiGrid: string;
  rank?: number;
  streakData?: StreakData;
  difficulty?: 'easy' | 'medium' | 'hard';
  locale: string;
}

export const useShareHandlers = ({
  puzzleId,
  puzzleNumber,
  completionTime,
  emojiGrid,
  rank,
  streakData,
  difficulty,
  locale,
}: UseShareHandlersProps) => {
  const [copied, setCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState(false);
  const copyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyToClipboard = React.useCallback(async () => {
    if (!emojiGrid) return;

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
  }, [puzzleId, puzzleNumber, completionTime, emojiGrid, rank, streakData, difficulty, locale]);

  const handleTwitterShare = React.useCallback(() => {
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
  }, [puzzleId, puzzleNumber, completionTime, emojiGrid, rank, streakData, difficulty, locale]);

  const handleWhatsAppShare = React.useCallback(() => {
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
  }, [puzzleId, puzzleNumber, completionTime, emojiGrid, rank, streakData, difficulty, locale]);

  return {
    handleCopyToClipboard,
    handleTwitterShare,
    handleWhatsAppShare,
    copied,
    copyError,
  };
};

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
import { Twitter, MessageCircle, Clipboard, Check } from "lucide-react";

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
}: CompletionModalProps) {
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
        puzzleUrl
      );
      setShareText(text);
    }
  }, [emojiGrid, shareText, puzzleNumber, completionTime]);

  const guestRank = hypotheticalRank ?? null;

  const handleCopyToClipboard = async () => {
    if (!shareText) return;

    setCopyError(false);

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
      } else {
        setCopyError(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopyError(false), 2000);
      }
    }
  };

  const handleTwitterShare = () => {
    console.log("[CompletionModal] Twitter share clicked - Story 5.4 will implement");
  };

  const handleWhatsAppShare = () => {
    console.log("[CompletionModal] WhatsApp share clicked - Story 5.4 will implement");
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
          <DialogTitle className="text-center font-serif text-3xl font-bold text-gray-900">
            Congratulations!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center mb-6">
          <p className="mb-2 text-gray-600">Your time:</p>
          <p className="font-mono text-4xl font-bold text-gray-900">
            {formatTime(completionTime)}
          </p>
        </div>

        {shareText && (
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-600">Preview share text:</p>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-gray-700">
                {shareText}
              </pre>
            </div>
          </div>
        )}

        {shareText && (
          <div className="mb-6 flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleTwitterShare}
              className="flex-1"
              aria-label="Share puzzle results on Twitter"
            >
              <Twitter className="mr-2 h-4 w-4" />
              Share on X
            </Button>
            <Button
              onClick={handleWhatsAppShare}
              className="flex-1"
              aria-label="Share puzzle results via WhatsApp"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              onClick={handleCopyToClipboard}
              className="flex-1"
              aria-label="Copy puzzle results to clipboard"
            >
              {copyError ? (
                <>
                  <span className="mr-2 text-red-500">✗</span>
                  Failed
                </>
              ) : copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}

        {isAuthenticated ? (
          <div className="mb-6 rounded-md bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">Your rank:</p>
            <p className="text-2xl font-bold text-gray-900">
              {rank !== undefined ? `#${rank}` : "Calculating..."}
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-md border-2 border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-lg font-semibold text-gray-900">
              {isLoadingRank
                ? "Calculating your rank..."
                : guestRank !== null
                  ? `Nice time! You'd be #${guestRank}! Sign in to claim your rank on the leaderboard.`
                  : "Sign in to claim your rank on the leaderboard!"}
            </p>
            <p className="mb-4 text-xs text-gray-500">
              Without signing in: No leaderboard rank • No streaks • No stats
            </p>
            {showAuthButtons ? (
              <div className="flex flex-col gap-2">
                <AuthButtons />
                <Button onClick={() => setShowAuthButtons(false)} variant="secondary" className="w-full">
                  Back
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button onClick={() => setShowAuthButtons(true)} className="w-full">Sign In</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">
                  Maybe Later
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

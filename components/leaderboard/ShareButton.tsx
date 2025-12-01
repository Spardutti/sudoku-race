"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Share2, Twitter, MessageCircle, Link2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  generateShareText,
  buildShareUrl,
} from "@/lib/utils/share-text";
import {
  shareToTwitter,
  shareToWhatsApp,
  copyToClipboard,
} from "@/lib/utils/share-handlers";
import { logShareEvent } from "@/actions/share";

interface ShareButtonProps {
  rank: number;
  time: number;
  puzzleNumber: number;
  puzzleId: string;
  onShare?: (channel: "twitter" | "whatsapp" | "clipboard") => void;
  isGuest?: boolean;
}

export function ShareButton({
  rank,
  time,
  puzzleNumber,
  puzzleId,
  onShare,
  isGuest = false,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  const handleShare = async (channel: "twitter" | "whatsapp" | "clipboard") => {
    if (isGuest) {
      return;
    }

    const url = buildShareUrl(channel);
    const shareText = generateShareText({ rank, time, puzzleNumber, url });

    logShareEvent({
      puzzleId,
      channel,
      rankAtShare: rank,
    }).catch((error) => {
      console.error("Failed to log share event:", error);
    });

    if (channel === "twitter") {
      shareToTwitter(shareText);
    } else if (channel === "whatsapp") {
      shareToWhatsApp(shareText);
    } else if (channel === "clipboard") {
      copyToClipboard(shareText).then((success) => {
        if (success) {
          toast.success("Copied to clipboard!", {
            duration: 2000,
          });
        } else {
          toast.error("Could not copy. Try again.", {
            duration: 2000,
          });
        }
      });
    }

    if (onShare) {
      onShare(channel);
    }

    setOpen(false);
  };

  const handleSignInClick = () => {
    window.location.href = "/auth/login";
  };

  const url = buildShareUrl("clipboard");
  const shareText = generateShareText({ rank, time, puzzleNumber, url });

  const previewLines = shareText.split("\n");
  const displayPreview =
    previewLines.length > 3
      ? previewLines.slice(0, 3).join("\n") + "..."
      : shareText;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="font-sans"
          aria-label="Share your rank"
        >
          <Share2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Share Rank</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 border border-gray-300 bg-white p-4 shadow-lg"
        align="end"
      >
        {isGuest ? (
          <div className="space-y-4 text-center">
            <div>
              <h3 className="mb-2 font-serif text-sm font-bold uppercase">
                Sign in to Share
              </h3>
              <p className="mb-4 text-sm text-gray-700">
                Create an account to share your rank and compete on the
                leaderboard.
              </p>
            </div>
            <Button
              onClick={handleSignInClick}
              className="w-full font-sans"
              aria-label="Sign in to share your rank"
            >
              Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-serif text-sm font-bold uppercase">
                Share Preview
              </h3>
              <p className="whitespace-pre-wrap break-words font-mono text-xs text-gray-700">
                {displayPreview}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleShare("twitter")}
                variant="secondary"
                className="w-full justify-start gap-2 font-sans"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
                Share on Twitter
              </Button>
              <Button
                onClick={() => handleShare("whatsapp")}
                variant="secondary"
                className="w-full justify-start gap-2 font-sans"
                aria-label="Share on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                Share on WhatsApp
              </Button>
              <Button
                onClick={() => handleShare("clipboard")}
                variant="secondary"
                className="w-full justify-start gap-2 font-sans"
                aria-label="Copy to clipboard"
              >
                <Link2 className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

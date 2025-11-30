"use client";

import { useState } from "react";
import { toast } from "sonner";
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
          <ShareIcon className="h-4 w-4 sm:mr-2" />
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
                <TwitterIcon className="h-4 w-4" />
                Share on Twitter
              </Button>
              <Button
                onClick={() => handleShare("whatsapp")}
                variant="secondary"
                className="w-full justify-start gap-2 font-sans"
                aria-label="Share on WhatsApp"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Share on WhatsApp
              </Button>
              <Button
                onClick={() => handleShare("clipboard")}
                variant="secondary"
                className="w-full justify-start gap-2 font-sans"
                aria-label="Copy to clipboard"
              >
                <CopyIcon className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

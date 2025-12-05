const ENCOURAGEMENT_PHRASES = [
  "Think you can beat me?",
  "Can you solve it faster?",
  "Challenge accepted?",
] as const;

let phraseIndex = 0;

export interface ShareTextParams {
  rank: number;
  time: number;
  puzzleNumber: number;
  url: string;
}

export function formatTimeForShare(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Generates rank-based share text (for authenticated users with leaderboard rank).
 * Used in legacy share flows. For emoji grid-based sharing, use generateEmojiShareText.
 */
export function generateShareText({
  rank,
  time,
  puzzleNumber,
  url,
}: ShareTextParams): string {
  const formattedTime = formatTimeForShare(time);
  const encouragement = ENCOURAGEMENT_PHRASES[phraseIndex];

  phraseIndex = (phraseIndex + 1) % ENCOURAGEMENT_PHRASES.length;

  const shareText = `I ranked #${rank} on Sudoku Daily #${puzzleNumber}! ⏱️ ${formattedTime}. ${encouragement} ${url}`;

  if (shareText.length > 280) {
    const truncatedUrl = url.split("?")[0];
    return `I ranked #${rank} on Sudoku Daily #${puzzleNumber}! ⏱️ ${formattedTime}. ${encouragement} ${truncatedUrl}`;
  }

  return shareText;
}

export function buildShareUrl(channel: "twitter" | "whatsapp" | "clipboard"): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://sudokurace.com";
  return `${baseUrl}?utm_source=share&utm_medium=${channel}`;
}

/**
 * Generates emoji grid-based share text (Story 5.3 - viral social mechanics).
 * Includes puzzle number, completion time, emoji grid visualization, and CTA.
 * This is the primary share text format for the viral sharing feature.
 */
export function generateEmojiShareText(
  puzzleNumber: number,
  completionTime: number,
  emojiGrid: string,
  puzzleUrl: string,
  channel?: 'twitter' | 'whatsapp' | 'clipboard',
  locale?: string
): string {
  const timeStr = formatTimeForShare(completionTime);

  const url = channel
    ? getPuzzleUrlWithUTM(channel)
    : puzzleUrl;

  const playText = locale === 'es' ? 'Juega el puzzle de hoy:' : 'Play today\'s puzzle:';

  return `Sudoku Race #${puzzleNumber}\n⏱️ ${timeStr}\n\n${emojiGrid}\n\n${playText} ${url}`;
}

export function getPuzzleUrlWithUTM(channel: 'twitter' | 'whatsapp' | 'clipboard'): string {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/puzzle`
    : '/puzzle';

  return `${baseUrl}?utm_source=share&utm_medium=${channel}`;
}

/**
 * Calculates puzzle number from puzzle_date field (YYYY-MM-DD format).
 * Pass puzzle.puzzle_date, NOT puzzle.id (which is a UUID).
 * Returns sequential puzzle number starting from Jan 1, 2025 = #1.
 */
export function calculatePuzzleNumber(puzzleDateStr: string): number {
  const puzzleDate = new Date(puzzleDateStr);

  if (isNaN(puzzleDate.getTime())) {
    console.error(`[calculatePuzzleNumber] Invalid date format: ${puzzleDateStr}. Expected YYYY-MM-DD, got: ${typeof puzzleDateStr}`);
    return 1;
  }

  const epochDate = new Date("2025-01-01");
  const daysSinceEpoch = Math.floor(
    (puzzleDate.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(1, daysSinceEpoch + 1);
}

export function getPuzzleUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/puzzle`;
  }
  return "/puzzle";
}

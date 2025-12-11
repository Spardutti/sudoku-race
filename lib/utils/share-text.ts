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
  difficulty?: 'easy' | 'medium' | 'hard';
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
  difficulty = 'medium',
}: ShareTextParams): string {
  const formattedTime = formatTimeForShare(time);
  const encouragement = ENCOURAGEMENT_PHRASES[phraseIndex];

  phraseIndex = (phraseIndex + 1) % ENCOURAGEMENT_PHRASES.length;

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const shareText = `I ranked #${rank} on Sudoku Race ${difficultyLabel} #${puzzleNumber}! ⏱️ ${formattedTime}. ${encouragement} ${url}`;

  if (shareText.length > 280) {
    const truncatedUrl = url.split("?")[0];
    return `I ranked #${rank} on Sudoku Race ${difficultyLabel} #${puzzleNumber}! ⏱️ ${formattedTime}. ${encouragement} ${truncatedUrl}`;
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
  locale?: string,
  streak?: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): string {
  const timeStr = formatTimeForShare(completionTime);

  const url = channel
    ? getPuzzleUrlWithUTM(channel)
    : puzzleUrl;

  const playText = locale === 'es' ? 'Juega el puzzle de hoy:' : 'Play today\'s puzzle:';
  const streakText = streak && streak > 0
    ? (locale === 'es' ? `\n🔥 Racha de ${streak} días` : `\n🔥 ${streak} day streak`)
    : '';

  const difficultyLabel = difficulty
    ? (locale === 'es'
        ? (difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil')
        : difficulty.charAt(0).toUpperCase() + difficulty.slice(1))
    : '';
  const difficultyText = difficultyLabel ? ` ${difficultyLabel}` : '';

  return `Sudoku Race${difficultyText} #${puzzleNumber}\n⏱️ ${timeStr}${streakText}\n\n${emojiGrid}\n\n${playText} ${url}`;
}

export function getPuzzleUrlWithUTM(channel: 'twitter' | 'whatsapp' | 'clipboard'): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : '/';

  return `${baseUrl}?utm_source=share&utm_medium=${channel}`;
}


export function getPuzzleUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "/";
}

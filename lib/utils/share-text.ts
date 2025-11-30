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

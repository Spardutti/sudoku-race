export type ShareChannel = 'twitter' | 'whatsapp' | 'clipboard';

export function getPuzzleUrlWithUTM(channel: ShareChannel): string {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/puzzle`
    : 'https://sudoku-race.com/puzzle';

  return `${baseUrl}?utm_source=share&utm_medium=${channel}`;
}

export function openTwitterShare(shareText: string): Window | null {
  const tweetText = encodeURIComponent(shareText);
  const shareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return window.open(
    shareUrl,
    '_blank',
    'width=550,height=420,noopener,noreferrer'
  );
}

export function openWhatsAppShare(shareText: string): Window | null {
  const isMobile = typeof navigator !== 'undefined' &&
    /Mobile|Android|iPhone/i.test(navigator.userAgent);

  if (typeof navigator !== 'undefined' && navigator.share && isMobile) {
    navigator.share({ text: shareText }).catch(() => {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
    return null;
  }

  if (isMobile) {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    return window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ text: shareText }).catch(() => {
      const encodedText = encodeURIComponent(shareText);
      const shareUrl = `https://wa.me/?text=${encodedText}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    });
    return null;
  }

  const encodedText = encodeURIComponent(shareText);
  const shareUrl = `https://wa.me/?text=${encodedText}`;

  return window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export function detectPopupBlocked(windowRef: Window | null): boolean {
  if (!windowRef || windowRef.closed || typeof windowRef.closed === 'undefined') {
    return true;
  }
  return false;
}

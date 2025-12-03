import {
  getPuzzleUrlWithUTM,
  openTwitterShare,
  openWhatsAppShare,
  detectPopupBlocked,
} from '../share';

describe('share utilities', () => {
  describe('getPuzzleUrlWithUTM', () => {
    it('generates Twitter URL with UTM parameters', () => {
      const url = getPuzzleUrlWithUTM('twitter');
      expect(url).toContain('/puzzle?utm_source=share&utm_medium=twitter');
    });

    it('generates WhatsApp URL with UTM parameters', () => {
      const url = getPuzzleUrlWithUTM('whatsapp');
      expect(url).toContain('/puzzle?utm_source=share&utm_medium=whatsapp');
    });

    it('generates clipboard URL with UTM parameters', () => {
      const url = getPuzzleUrlWithUTM('clipboard');
      expect(url).toContain('/puzzle?utm_source=share&utm_medium=clipboard');
    });
  });

  describe('openTwitterShare', () => {
    let windowOpenSpy: jest.SpyInstance;

    beforeEach(() => {
      windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue({} as Window);
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
    });

    it('opens Twitter intent with encoded share text', () => {
      const shareText = 'Sudoku Race #42\n⏱️ 12:34\n\n🟩🟩⬜';

      openTwitterShare(shareText);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        '_blank',
        'width=550,height=420,noopener,noreferrer'
      );
    });

    it('handles special characters in share text', () => {
      const shareText = 'Test & Share <tag>';

      openTwitterShare(shareText);

      const expectedUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expectedUrl,
        '_blank',
        'width=550,height=420,noopener,noreferrer'
      );
    });
  });

  describe('openWhatsAppShare', () => {
    let windowOpenSpy: jest.SpyInstance;
    let navigatorShareSpy: jest.SpyInstance | undefined;
    const originalUserAgent = navigator.userAgent;
    const originalShare = navigator.share;

    beforeEach(() => {
      windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue({} as Window);
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
      if (navigatorShareSpy) {
        navigatorShareSpy.mockRestore();
        navigatorShareSpy = undefined;
      }
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
      if (originalShare) {
        Object.defineProperty(navigator, 'share', {
          value: originalShare,
          configurable: true
        });
      } else {
        delete (navigator as Partial<Navigator>).share;
      }
    });

    it('uses Web Share API on mobile when available', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });

      const mockShare = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        configurable: true
      });
      navigatorShareSpy = jest.spyOn(navigator, 'share');

      const shareText = 'Sudoku Race #42\n⏱️ 12:34\n\n🟩🟩⬜';
      const result = openWhatsAppShare(shareText);

      expect(result).toBeNull();
      expect(mockShare).toHaveBeenCalledWith({ text: shareText });
      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    it('uses whatsapp:// protocol on mobile when Web Share API fails', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });

      const mockShare = jest.fn().mockRejectedValue(new Error('Share cancelled'));
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        configurable: true
      });

      const shareText = 'Test message';
      openWhatsAppShare(shareText);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `whatsapp://send?text=${encodeURIComponent(shareText)}`,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('uses whatsapp:// protocol on Android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        configurable: true
      });
      delete (navigator as Partial<Navigator>).share;

      const shareText = 'Test message';
      openWhatsAppShare(shareText);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `whatsapp://send?text=${encodeURIComponent(shareText)}`,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('uses Web Share API on desktop Chrome/Edge when available', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });

      const mockShare = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        configurable: true
      });
      navigatorShareSpy = jest.spyOn(navigator, 'share');

      const shareText = 'Sudoku Race #42\n⏱️ 12:34\n\n🟩🟩⬜';
      const result = openWhatsAppShare(shareText);

      expect(result).toBeNull();
      expect(mockShare).toHaveBeenCalledWith({ text: shareText });
      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    it('falls back to wa.me on desktop when Web Share API is cancelled', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });

      const mockShare = jest.fn().mockRejectedValue(new Error('Share cancelled'));
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        configurable: true
      });

      const shareText = 'Test message';
      openWhatsAppShare(shareText);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('uses wa.me URL on desktop Firefox without Web Share API', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      delete (navigator as Partial<Navigator>).share;

      const shareText = 'Sudoku Race #42\n⏱️ 12:34\n\n🟩🟩⬜';
      openWhatsAppShare(shareText);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('handles emoji characters with wa.me URL', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      delete (navigator as Partial<Navigator>).share;

      const shareText = '🟩🟨⬜🟦';
      openWhatsAppShare(shareText);

      const expectedUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expectedUrl,
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('detectPopupBlocked', () => {
    it('returns true if window reference is null', () => {
      expect(detectPopupBlocked(null)).toBe(true);
    });

    it('returns true if window is closed', () => {
      const mockWindow = { closed: true } as Window;
      expect(detectPopupBlocked(mockWindow)).toBe(true);
    });

    it('returns true if window.closed is undefined', () => {
      const mockWindow = { closed: undefined } as unknown as Window;
      expect(detectPopupBlocked(mockWindow)).toBe(true);
    });

    it('returns false if window is open and valid', () => {
      const mockWindow = { closed: false } as Window;
      expect(detectPopupBlocked(mockWindow)).toBe(false);
    });
  });
});

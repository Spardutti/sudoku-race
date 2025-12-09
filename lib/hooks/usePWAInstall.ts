"use client";

import { useEffect, useState, useCallback } from "react";

const INSTALL_PROMPT_DISMISSED_KEY = "pwa-install-dismissed";
const INSTALL_PROMPT_DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const VISIT_COUNT_KEY = "visit-count";
const FIRST_PUZZLE_COMPLETED_KEY = "first-puzzle-completed";

function checkInstallPromptEligibility(): boolean {
    if (typeof window === "undefined") return false;

    const dismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < INSTALL_PROMPT_DISMISS_DURATION) {
        return false;
      }
    }

    const firstPuzzleCompleted = localStorage.getItem(FIRST_PUZZLE_COMPLETED_KEY);
    if (firstPuzzleCompleted === "true") {
      return true;
    }

    const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
    return visitCount >= 3;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      if (checkInstallPromptEligibility()) {
        setShowInstallButton(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA install accepted");
    } else {
      console.log("PWA install dismissed");
      localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, Date.now().toString());
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  }, [deferredPrompt]);

  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, Date.now().toString());
    setShowInstallButton(false);
  }, []);

  return {
    showInstallButton,
    handleInstall,
    dismissInstallPrompt,
    canInstall: !!deferredPrompt,
  };
}

export function incrementVisitCount() {
  if (typeof window === "undefined") return;

  const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
  localStorage.setItem(VISIT_COUNT_KEY, (visitCount + 1).toString());
}

export function markFirstPuzzleCompleted() {
  if (typeof window === "undefined") return;

  localStorage.setItem(FIRST_PUZZLE_COMPLETED_KEY, "true");
}

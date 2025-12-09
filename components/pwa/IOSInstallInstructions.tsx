"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Share, X } from "lucide-react";

function checkShouldShowInstructions(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;

  if (!isIOSDevice || isInStandaloneMode) {
    return false;
  }

  const dismissed = localStorage.getItem("ios-install-dismissed");
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime < sevenDays) {
      return false;
    }
  }

  const visitCount = parseInt(localStorage.getItem("visit-count") || "0", 10);
  return visitCount >= 2;
}

export function IOSInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(() => checkShouldShowInstructions());

  const handleDismiss = useCallback(() => {
    localStorage.setItem("ios-install-dismissed", Date.now().toString());
    setShowInstructions(false);
  }, []);

  if (!showInstructions) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-black bg-white p-4 shadow-lg sm:left-auto sm:max-w-md">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-serif text-sm font-bold">Install Sudoku Race</h3>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 text-xs text-gray-700">
        <p className="flex items-center gap-2">
          <span>1. Tap the</span>
          <Share className="h-4 w-4" />
          <span>Share button</span>
        </p>
        <p>2. Scroll down and tap &ldquo;Add to Home Screen&rdquo;</p>
        <p>3. Tap &ldquo;Add&rdquo; in the top right corner</p>
      </div>
    </div>
  );
}

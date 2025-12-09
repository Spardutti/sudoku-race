"use client";

import { usePWAInstall } from "@/lib/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function InstallPrompt() {
  const { showInstallButton, handleInstall, dismissInstallPrompt } = usePWAInstall();

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg border border-black bg-white p-4 shadow-lg sm:left-auto sm:max-w-md">
      <div className="flex-1">
        <h3 className="font-serif text-sm font-bold">Install Sudoku Race</h3>
        <p className="text-xs text-gray-600">Get quick access from your home screen</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleInstall}
          size="sm"
          variant="primary"
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Install
        </Button>
        <Button
          onClick={dismissInstallPrompt}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

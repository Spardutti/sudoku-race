"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  autoSolvePuzzle,
  resetClientState,
  clearAllBrowserData,
} from "@/lib/utils/dev-helpers";
import { deleteCompletionRecord } from "@/actions/dev-tools";

type DevToolbarProps = {
  puzzleId: string;
  solution?: number[][];
  userId?: string | null;
};

/**
 * DevToolbar - Comprehensive development testing tools
 *
 * Provides four key testing capabilities:
 * 1. Auto-Solve: Instantly fill grid with solution
 * 2. Reset Client: Clear localStorage + Zustand store
 * 3. Reset Server: Delete completion records from database
 * 4. Clear All Data: Nuclear option (clear everything)
 *
 * Only renders in development mode (process.env.NODE_ENV !== 'production')
 */
export function DevToolbar({ puzzleId, solution, userId }: DevToolbarProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);



  // Persist open/closed state in localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("dev_toolbar_open");
    if (stored !== null) {
      try {
        setIsOpen(JSON.parse(stored));
      } catch {
        // Ignore parse errors, use default
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("dev_toolbar_open", JSON.stringify(isOpen));
  }, [isOpen]);

  /**
   * Auto-solve: Fill grid with solution and trigger completion
   */
  const handleAutoSolve = () => {
    if (!solution) {
      toast.error("Solution not available");
      return;
    }

    autoSolvePuzzle(solution);
    toast.success("Puzzle auto-solved!");
  };

  /**
   * Reset client: Clear localStorage + Zustand, reload page
   */
  const handleResetClient = () => {
    resetClientState();
    toast.success("Client state reset!");
    setTimeout(() => window.location.reload(), 500);
  };

  /**
   * Reset server: Delete completion + leaderboard records from DB
   */
  const handleResetServer = async () => {
    if (!userId) {
      toast.error("Must be authenticated to delete server records");
      return;
    }

    setIsSubmitting(true);
    const result = await deleteCompletionRecord(puzzleId);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Server record deleted!");
      // Reload after short delay to show toast
      setTimeout(() => handleResetClient(), 1000);
    } else {
      toast.error(result.error);
    }
  };

  /**
   * Clear all data: Nuclear option with confirmation
   */
  const handleClearAll = () => {
    const confirmed = window.confirm(
      "⚠️ NUCLEAR OPTION: Clear ALL browser data and reload?\n\nThis will log you out and clear all localStorage."
    );

    if (!confirmed) {
      return;
    }

    clearAllBrowserData();
  };

  // Minimized state: Show only "DEV" pill button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-gray-800 transition-colors border border-red-500"
        aria-label="Open dev toolbar"
      >
        DEV
      </button>
    );
  }

  // Expanded state: Full toolbar with all buttons
  return (
    <div className="fixed top-20 right-4 z-50 bg-gray-900/90 text-white p-4 rounded-md border-2 border-red-500 shadow-2xl w-56">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold tracking-wider">DEV TOOLBAR</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-300 text-lg font-bold leading-none"
          aria-label="Minimize dev toolbar"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleAutoSolve}
          disabled={!solution || isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-sm"
          size="sm"
        >
          ⚡ Auto-Solve
        </Button>

        <Button
          onClick={handleResetClient}
          disabled={isSubmitting}
          className="w-full bg-gray-700 hover:bg-gray-600 text-sm"
          size="sm"
          variant="secondary"
        >
          ↻ Reset Client
        </Button>

        <Button
          onClick={handleResetServer}
          disabled={isSubmitting || !userId}
          className="w-full bg-orange-600 hover:bg-orange-700 text-sm"
          size="sm"
        >
          {isSubmitting ? "Deleting..." : "🗑️ Reset Server"}
        </Button>

        <Button
          onClick={handleClearAll}
          disabled={isSubmitting}
          className="w-full bg-red-800 hover:bg-red-900 text-sm"
          size="sm"
        >
          ☢️ Clear All Data
        </Button>
      </div>

      {!userId && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Sign in to use server reset
        </p>
      )}
    </div>
  );
}

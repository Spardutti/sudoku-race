"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "hasSeenInstructions";

export function InstructionsCard() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const hasSeenInstructions = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenInstructions) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = React.useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">How to Play</DialogTitle>
          <DialogDescription className="text-base pt-4 space-y-3">
            <p>
              Fill the 9×9 grid so that each row, column, and 3×3 box contains
              the numbers 1-9.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Mobile:</strong> Tap a cell, then use the number pad below.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Desktop:</strong> Click a cell, then press 1-9 on your keyboard.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button onClick={handleClose} className="w-full sm:w-auto">
              Got it!
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

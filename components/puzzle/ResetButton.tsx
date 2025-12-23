"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResetButtonProps {
  onReset: () => void;
  hasUnlockedCells: boolean;
}

export const ResetButton = ({ onReset, hasUnlockedCells }: ResetButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const t = useTranslations('puzzle');
  const tc = useTranslations('common');

  const handleClick = () => {
    if (!hasUnlockedCells) {
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    onReset();
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="
          flex items-center justify-center
          min-w-[44px] min-h-[44px]
          border-2 border-gray-300 rounded
          bg-white text-gray-700
          hover:bg-gray-50
          transition-all duration-200
          focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label={t('resetUnlocked')}
        type="button"
        disabled={!hasUnlockedCells}
      >
        <RotateCcw
          className="w-5 h-5"
          aria-hidden="true"
        />
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('resetUnlockedConfirm')}</DialogTitle>
            <DialogDescription>
              {t('resetUnlockedDescription')}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              {tc('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="w-full sm:w-auto"
            >
              {t('reset')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

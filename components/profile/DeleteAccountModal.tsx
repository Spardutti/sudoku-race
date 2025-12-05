"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteAccountModalProps) {
  const t = useTranslations('profile');
  const tc = useTranslations('common');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            {t('deleteAccountConfirm')}
          </DialogTitle>
          <DialogDescription>
            {t('deleteAccountPermanent')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm font-semibold">{t('deleteAccountPermanent')}</p>
          <ul className="text-sm space-y-1 list-disc list-inside pl-2">
            <li>Your puzzle completions</li>
            <li>Your leaderboard entries</li>
            <li>Your streak data</li>
            <li>Your user account</li>
          </ul>
          <p className="text-sm font-bold text-red-600 mt-4">
            {t('deleteAccountCannotUndo')}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {tc('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
          >
            {isDeleting ? t('deleting') : t('deleteAccount')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

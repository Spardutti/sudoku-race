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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Delete Account?
          </DialogTitle>
          <DialogDescription>
            This will permanently delete your account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm font-semibold">This will permanently delete:</p>
          <ul className="text-sm space-y-1 list-disc list-inside pl-2">
            <li>Your puzzle completions</li>
            <li>Your leaderboard entries</li>
            <li>Your streak data</li>
            <li>Your user account</li>
          </ul>
          <p className="text-sm font-bold text-red-600 mt-4">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

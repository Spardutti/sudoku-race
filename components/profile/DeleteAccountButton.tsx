"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { deleteAccount } from "@/actions/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface DeleteAccountButtonProps {
  userId: string;
}

export function DeleteAccountButton({ userId }: DeleteAccountButtonProps) {
  const t = useTranslations('profile');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    const result = await deleteAccount(userId);

    if (result.success) {
      toast.success(t('accountDeleted'));
      router.push("/");
      router.refresh();
    } else {
      toast.error(result.error || t('deletionFailed'));
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="space-y-4">
          <Typography variant="h2" className="text-2xl text-red-900">
            {t('dangerZone')}
          </Typography>
          <p className="text-sm text-red-800">
            {t('dangerZoneWarning')}
          </p>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
          >
            {t('deleteAccount')}
          </Button>
        </div>
      </Card>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}

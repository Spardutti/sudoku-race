"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations('profile');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);

    const result = await signOut();

    if (result.success) {
      toast.success(t('loggedOut'));
      router.push("/");
      router.refresh();
    } else {
      toast.error(result.error || t('logoutFailed'));
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="secondary"
      className="w-full sm:w-auto"
    >
      {isLoading ? t('loggingOut') : t('logout')}
    </Button>
  );
}

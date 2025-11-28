"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { toast } from "sonner";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);

    const result = await signOut();

    if (result.success) {
      toast.success("You've been logged out");
      router.push("/");
      router.refresh();
    } else {
      toast.error(result.error || "Logout failed. Please try again.");
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
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}

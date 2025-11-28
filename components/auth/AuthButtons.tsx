"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function AuthButtons() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (!result.success) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      window.location.href = result.data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        variant="primary"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full max-w-sm bg-[#4285F4] hover:bg-[#357ae8] text-white border-[#4285F4] hover:border-[#357ae8]"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Continue with Google"
        )}
      </Button>
    </div>
  );
}

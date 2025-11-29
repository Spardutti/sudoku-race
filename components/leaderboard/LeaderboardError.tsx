"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "./ErrorState";

interface LeaderboardErrorProps {
  error: string;
}

export function LeaderboardError({ error }: LeaderboardErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  return <ErrorState error={error} onRetry={handleRetry} />;
}

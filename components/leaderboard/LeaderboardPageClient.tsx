"use client";

import { useEffect } from "react";

interface LeaderboardPageClientProps {
  children: React.ReactNode;
  currentUserId?: string;
  shouldScrollToPersonalRank: boolean;
}

export function LeaderboardPageClient({
  children,
  currentUserId,
  shouldScrollToPersonalRank,
}: LeaderboardPageClientProps) {
  useEffect(() => {
    if (!shouldScrollToPersonalRank || !currentUserId) {
      return;
    }

    const timer = setTimeout(() => {
      const personalRow = document.querySelector(
        `tr[data-user-id="${currentUserId}"]`
      );

      if (personalRow) {
        personalRow.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentUserId, shouldScrollToPersonalRank]);

  return <>{children}</>;
}

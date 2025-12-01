import * as React from "react";
import { toast } from "sonner";

export function useMigrationNotification() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const migrated = urlParams.get("migrated");
    const rank = urlParams.get("rank");
    const migrationFailed = urlParams.get("migrationFailed");

    if (migrated === "true" && rank) {
      toast.success(`Your completion time saved! You ranked #${rank} on today's puzzle.`, {
        duration: 5000,
      });
      window.history.replaceState({}, "", "/puzzle");
    } else if (migrationFailed === "true") {
      toast.error("Sign-in successful, but progress sync failed. Please contact support.", {
        duration: 8000,
      });
      window.history.replaceState({}, "", "/puzzle");
    }
  }, []);
}

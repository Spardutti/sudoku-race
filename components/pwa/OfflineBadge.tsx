"use client";

import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export function OfflineBadge() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-2 rounded-full border-2 border-red-600 bg-red-50 px-4 py-2 shadow-lg">
        <WifiOff className="h-4 w-4 text-red-600" />
        <span className="text-sm font-medium text-red-900">Offline Mode</span>
      </div>
    </div>
  );
}

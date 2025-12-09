"use client";

import { useEffect } from "react";
import { incrementVisitCount } from "@/lib/hooks/usePWAInstall";

export function VisitTracker() {
  useEffect(() => {
    incrementVisitCount();
  }, []);

  return null;
}

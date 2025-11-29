"use client";

import { createQueryKeys } from "@lukemorales/query-key-factory";

export const userKeys = createQueryKeys("user", {
  // Future: profile, stats, preferences, etc.
});

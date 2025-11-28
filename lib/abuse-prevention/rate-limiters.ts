import { rateLimit } from "@/lib/utils/rate-limit";

export const validationLimiter = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export const submissionLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

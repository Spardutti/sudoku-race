import type { TimerEvent } from "@/lib/types/timer";
import type { SolvePath } from "@/lib/types/solve-path";

export type CompletionData = {
  userEntries?: number[][];
  pencilMarks?: Record<string, number[]>;
  solvePath?: SolvePath;
  lockedCells?: Record<string, boolean>;
} | null;

export const extractCompletionData = (data: unknown): CompletionData => {
  return data as CompletionData;
};

export const calculateElapsedTime = (
  isComplete: boolean,
  completionTimeSeconds: number | null,
  startedAt: string | null,
  timerEvents: TimerEvent[]
): number => {
  if (isComplete) {
    return completionTimeSeconds || 0;
  }
  if (startedAt) {
    return calculateActiveTimeFromEvents(timerEvents, startedAt);
  }
  return 0;
};

export const getCurrentPauseState = (events: TimerEvent[]): {
  isPaused: boolean;
  pausedAt: string | null;
} => {
  if (!events || events.length === 0) {
    return { isPaused: false, pausedAt: null };
  }

  const lastPauseResumeEvent = [...events].reverse().find(
    (e) => e.type === "pause" || e.type === "resume"
  );

  if (!lastPauseResumeEvent) {
    return { isPaused: false, pausedAt: null };
  }

  return {
    isPaused: lastPauseResumeEvent.type === "pause",
    pausedAt:
      lastPauseResumeEvent.type === "pause"
        ? lastPauseResumeEvent.timestamp
        : null,
  };
};

export const calculateActiveTimeFromEvents = (
  events: TimerEvent[],
  startedAt: string
): number => {
  if (!events || events.length === 0) {
    const start = new Date(startedAt);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  }

  let totalActive = 0;
  let lastStart: Date | null = new Date(startedAt);

  for (const event of events) {
    if (event.type === "start" || event.type === "resume") {
      lastStart = new Date(event.timestamp);
    } else if (event.type === "pause") {
      if (lastStart) {
        totalActive += new Date(event.timestamp).getTime() - lastStart.getTime();
        lastStart = null;
      }
    }
  }

  if (lastStart) {
    const now = new Date();
    totalActive += now.getTime() - lastStart.getTime();
  }

  return Math.floor(totalActive / 1000);
};

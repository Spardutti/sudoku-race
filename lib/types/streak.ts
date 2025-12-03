export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string;
  freezeAvailable: boolean;
  lastFreezeResetDate: string | null;
};

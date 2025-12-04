"use client";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { LogoutButton } from "./LogoutButton";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { StreakFreezeCard } from "./StreakFreezeCard";
import { StatItem } from "./StatItem";
import { formatTime } from "@/lib/utils/formatTime";
import { CompletionCalendar } from "@/components/calendar/CompletionCalendar";

interface ProfilePageClientProps {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    oauthProvider: string;
  };
  stats: {
    totalPuzzlesSolved: number;
    averageTime: number | null;
    bestTime: number | null;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastCompletionDate: string;
    freezeAvailable: boolean;
    lastFreezeResetDate: string | null;
  } | null;
  completionMap: Record<string, { time: number; completed: boolean }>;
  todayISO: string;
}

export function ProfilePageClient({ user, stats, streak, completionMap, todayISO }: ProfilePageClientProps) {
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const providerDisplay: Record<string, { name: string; icon: string }> = {
    google: { name: "Google", icon: "🔵" },
    github: { name: "GitHub", icon: "⚫" },
    apple: { name: "Apple", icon: "🍎" },
  };

  const provider = providerDisplay[user.oauthProvider] || {
    name: user.oauthProvider,
    icon: "🔑",
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Typography variant="h1" className="mb-8">
        Profile
      </Typography>

      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <Typography variant="h2" className="text-2xl">
            Account Information
          </Typography>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">
                Username
              </p>
              <p className="font-medium">
                {user.username}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Email
              </p>
              <p className="font-mono text-sm">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Member Since
              </p>
              <p>{memberSince}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Authentication Provider
              </p>
              <p>
                {provider.icon} {provider.name}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <Typography variant="h2" className="text-2xl">
            Statistics
          </Typography>

          {stats.totalPuzzlesSolved === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Complete your first puzzle to see your stats!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <StatItem
                label="Total Puzzles Solved"
                value={stats.totalPuzzlesSolved}
              />
              <StatItem
                label="Current Streak"
                value={streak?.currentStreak ?? 0}
              />
              <StatItem
                label="Longest Streak"
                value={streak?.longestStreak ?? 0}
              />
              <StatItem
                label="Average Time"
                value={stats.averageTime ? formatTime(stats.averageTime) : "—"}
              />
              <StatItem
                label="Best Time"
                value={stats.bestTime ? formatTime(stats.bestTime) : "—"}
              />
            </div>
          )}
        </Card>

        {streak && (
          <StreakFreezeCard
            freezeAvailable={streak.freezeAvailable}
            lastFreezeResetDate={streak.lastFreezeResetDate}
          />
        )}

        <CompletionCalendar completionMap={completionMap} todayISO={todayISO} />

        <Card className="p-6 space-y-4">
          <Typography variant="h2" className="text-2xl">
            Account Actions
          </Typography>

          <div className="flex flex-col gap-3 sm:flex-row">
            <LogoutButton />
          </div>
        </Card>

        <DeleteAccountButton userId={user.id} />
      </div>
    </div>
  );
}

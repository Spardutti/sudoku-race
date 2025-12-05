'use client';

import { Card } from "@/components/ui/card";
import { getDaysDifference } from "@/lib/utils/date-utils";
import { useTranslations } from "next-intl";

interface StreakFreezeCardProps {
  freezeAvailable: boolean;
  lastFreezeResetDate: string | null;
}

export function StreakFreezeCard({
  freezeAvailable,
  lastFreezeResetDate,
}: StreakFreezeCardProps) {
  const t = useTranslations('profile');
  const daysUntilReset = lastFreezeResetDate
    ? Math.max(0, 7 - getDaysDifference(new Date(lastFreezeResetDate), new Date()))
    : null;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold font-serif">{t('streakFreeze')}</h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">{t('status')}</p>
          <p
            className={`font-semibold text-lg ${freezeAvailable ? "text-green-600" : "text-gray-500"}`}
          >
            {freezeAvailable ? `✓ ${t('available')}` : t('used')}
          </p>
        </div>
        {!freezeAvailable && lastFreezeResetDate && daysUntilReset !== null && (
          <div>
            <p className="text-sm text-gray-600">{t('resetsIn')}</p>
            <p className="font-mono text-sm text-gray-700">{daysUntilReset} {t('days')}</p>
          </div>
        )}
        <p className="text-xs text-gray-500 leading-relaxed">
          {freezeAvailable ? t('freezeAvailableDesc') : t('freezeUsedDesc')}
        </p>
      </div>
    </Card>
  );
}

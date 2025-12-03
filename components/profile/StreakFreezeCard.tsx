import { Card } from "@/components/ui/card";
import { getDaysDifference } from "@/lib/utils/date-utils";

interface StreakFreezeCardProps {
  freezeAvailable: boolean;
  lastFreezeResetDate: string | null;
}

export function StreakFreezeCard({
  freezeAvailable,
  lastFreezeResetDate,
}: StreakFreezeCardProps) {
  const daysUntilReset = lastFreezeResetDate
    ? Math.max(0, 7 - getDaysDifference(new Date(lastFreezeResetDate), new Date()))
    : null;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold font-serif">Streak Freeze</h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p
            className={`font-semibold text-lg ${freezeAvailable ? "text-green-600" : "text-gray-500"}`}
          >
            {freezeAvailable ? "✓ Available" : "Used"}
          </p>
        </div>
        {!freezeAvailable && lastFreezeResetDate && daysUntilReset !== null && (
          <div>
            <p className="text-sm text-gray-600">Resets in</p>
            <p className="font-mono text-sm text-gray-700">{daysUntilReset} days</p>
          </div>
        )}
        <p className="text-xs text-gray-500 leading-relaxed">
          {freezeAvailable
            ? "If you miss a day, your freeze will automatically protect your streak."
            : "Your freeze will be available again in a few days."}
        </p>
      </div>
    </Card>
  );
}

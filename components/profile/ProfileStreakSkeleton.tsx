import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export function ProfileStreakSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <Typography variant="h2" className="text-2xl">
        Streak Freeze
      </Typography>

      <div className="space-y-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
    </Card>
  );
}

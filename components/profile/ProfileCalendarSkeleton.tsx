import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export function ProfileCalendarSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <Typography variant="h2" className="text-2xl">
        Completion History
      </Typography>

      <div className="grid grid-cols-7 gap-2">
        {[...Array(30)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export function ProfileStatsSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <Typography variant="h2" className="text-2xl">
        Statistics
      </Typography>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

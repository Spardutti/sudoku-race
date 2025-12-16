import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function PuzzleLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 md:h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              padding="lg"
              className="relative"
            >
              <div className="space-y-4 min-h-[120px]">
                <div>
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>

                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}

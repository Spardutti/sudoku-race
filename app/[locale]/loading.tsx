import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>

        {/* Timer Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-12 w-32" />
        </div>

        {/* Grid Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="w-[360px] h-[360px] md:w-[450px] md:h-[450px] border-4 border-black" />
        </div>

        {/* Submit Button Skeleton */}
        <div className="max-w-xs mx-auto">
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Number Pad Skeleton (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black p-4">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

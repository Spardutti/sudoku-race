import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-full bg-white p-4">
      <div className="flex-1 flex items-center justify-center">
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
        </div>
      </div>
    </div>
  );
}

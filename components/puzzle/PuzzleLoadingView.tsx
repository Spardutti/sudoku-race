import { Skeleton } from "@/components/ui/skeleton";

export function PuzzleLoadingView() {
  return (
    <div className="flex flex-col min-h-full bg-white p-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="grid grid-cols-9 gap-0 border-2 border-black max-w-md mx-auto aspect-square">
          {Array.from({ length: 81 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square border border-gray-300"
            />
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
        </div>
        </div>
      </div>
    </div>
  );
}

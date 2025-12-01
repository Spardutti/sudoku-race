export function PuzzleLoadingView() {
  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-gray-600">Loading puzzle...</div>
      </div>
    </div>
  );
}

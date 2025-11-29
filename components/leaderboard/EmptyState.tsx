"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 font-serif text-2xl font-bold">
        Be the first to complete today&apos;s puzzle!
      </h2>
      <Link
        href="/puzzle"
        className="rounded-md border-2 border-black bg-white px-6 py-3 font-serif text-lg font-bold transition-colors hover:bg-black hover:text-white"
      >
        Start Today&apos;s Puzzle
      </Link>
    </div>
  );
}

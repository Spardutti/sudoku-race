"use client";

import { Pencil } from "lucide-react";

interface NoteModeToggleProps {
  noteMode: boolean;
  onToggle: () => void;
}

export function NoteModeToggle({ noteMode, onToggle }: NoteModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center justify-center
        min-w-[44px] min-h-[44px]
        border-2 border-black
        rounded
        transition-colors
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black
        ${noteMode ? "bg-gray-200" : "bg-white hover:bg-gray-50"}
      `}
      aria-label={noteMode ? "Note mode active" : "Note mode inactive"}
      type="button"
    >
      <Pencil className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

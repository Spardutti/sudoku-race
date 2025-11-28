/**
 * Timer Component
 *
 * Displays elapsed time in MM:SS format for puzzle solving.
 * Display-only component - actual timing validation happens server-side.
 *
 * @see docs/architecture.md (ADR-005: Server-Side Timer Validation)
 * @see docs/stories/2-5-timer-implementation-auto-start-fair-timing.md
 */

interface TimerProps {
  /**
   * Elapsed time in seconds
   */
  elapsedTime: number;
  /**
   * Whether the puzzle is completed (timer stops when true)
   */
  isCompleted: boolean;
}

/**
 * Format seconds to MM:SS display format
 *
 * @param seconds - Total elapsed seconds
 * @returns Formatted string (e.g., "05:42", "12:08")
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const mm = minutes.toString().padStart(2, "0");
  const ss = remainingSeconds.toString().padStart(2, "0");

  return `${mm}:${ss}`;
}

export function Timer({ elapsedTime, isCompleted }: TimerProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="timer"
      aria-label={`Elapsed time: ${formatTime(elapsedTime)}`}
      aria-live="polite"
    >
      <svg
        className="h-5 w-5 text-gray-600"
        fill="none"
        strokeWidth="2"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <time
        className="font-mono text-lg font-semibold text-gray-900"
        dateTime={`PT${elapsedTime}S`}
      >
        {formatTime(elapsedTime)}
      </time>
      {isCompleted && (
        <span className="text-sm text-gray-500" aria-label="Timer stopped">
          (completed)
        </span>
      )}
    </div>
  );
}

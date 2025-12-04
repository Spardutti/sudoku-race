import { formatTime } from "@/lib/utils/formatTime";
import { cn } from "@/lib/utils";

interface CalendarCellProps {
  date: Date | null;
  isCompleted: boolean;
  completionTime: number | null;
  isToday: boolean;
}

export function CalendarCell({
  date,
  isCompleted,
  completionTime,
  isToday,
}: CalendarCellProps) {
  if (!date) {
    return <div className="w-12 h-12 mobile:w-10 mobile:h-10" />;
  }

  const dayNumber = date.getUTCDate();
  const title =
    isCompleted && completionTime ? formatTime(completionTime) : undefined;

  return (
    <div
      className={cn(
        "w-12 h-12 mobile:w-10 mobile:h-10 border flex items-center justify-center text-sm font-medium",
        isCompleted ? "bg-green-100 border-gray-300" : "bg-gray-50 border-gray-200",
        isToday && "border-2 border-black"
      )}
      role="gridcell"
      aria-label={`${dayNumber}${isCompleted ? " completed" : ""}${isToday ? " today" : ""}`}
      title={title}
    >
      <span className="text-gray-900">
        {dayNumber}
        {isCompleted && (
          <span className="ml-1 text-green-700" aria-hidden="true">
            ✓
          </span>
        )}
      </span>
    </div>
  );
}

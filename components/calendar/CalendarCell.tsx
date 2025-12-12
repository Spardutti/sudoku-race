import { formatTime } from "@/lib/utils/formatTime";
import { cn } from "@/lib/utils";

interface CalendarCellProps {
  date: Date | null;
  hasEasy: boolean;
  hasMedium: boolean;
  easyTime: number | null;
  mediumTime: number | null;
  isToday: boolean;
}

export function CalendarCell({
  date,
  hasEasy,
  hasMedium,
  easyTime,
  mediumTime,
  isToday,
}: CalendarCellProps) {
  if (!date) {
    return <div className="w-12 h-12 mobile:w-10 mobile:h-10" />;
  }

  const dayNumber = date.getUTCDate();
  const isCompleted = hasEasy || hasMedium;
  const isPerfectDay = hasEasy && hasMedium;

  const tooltipParts: string[] = [];
  if (hasEasy && easyTime) {
    tooltipParts.push(`Easy: ${formatTime(easyTime)}`);
  }
  if (hasMedium && mediumTime) {
    tooltipParts.push(`Medium: ${formatTime(mediumTime)}`);
  }
  if (isPerfectDay) {
    tooltipParts.push("Perfect Day! 🎉");
  }
  const title = tooltipParts.length > 0 ? tooltipParts.join(" | ") : undefined;

  const bgColor = isPerfectDay
    ? "bg-purple-100"
    : hasEasy
    ? "bg-green-100"
    : hasMedium
    ? "bg-blue-100"
    : "bg-gray-50";

  const borderColor = isCompleted ? "border-gray-300" : "border-gray-200";

  return (
    <div
      className={cn(
        "w-12 h-12 mobile:w-10 mobile:h-10 border flex flex-col items-center justify-center text-sm font-medium relative",
        bgColor,
        borderColor,
        isToday && "border-2 border-black"
      )}
      role="gridcell"
      aria-label={`${dayNumber}${isCompleted ? " completed" : ""}${isToday ? " today" : ""}${isPerfectDay ? " perfect day" : ""}`}
      title={title}
    >
      <span className="text-gray-900 text-xs">{dayNumber}</span>
      {isCompleted && (
        <div className="flex gap-0.5 mt-0.5">
          {hasEasy && (
            <span className="text-xs" aria-hidden="true">
              🟢
            </span>
          )}
          {hasMedium && (
            <span className="text-xs" aria-hidden="true">
              🔵
            </span>
          )}
        </div>
      )}
    </div>
  );
}

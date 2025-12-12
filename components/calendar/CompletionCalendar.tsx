"use client";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { CalendarCell } from "./CalendarCell";
import { getLast30Days, getCalendarGrid, dateToKey } from "@/lib/utils/calendar-utils";
import { useTranslations, useLocale } from "next-intl";

type CompletionEntry = {
  easy?: { time: number; completed: boolean };
  medium?: { time: number; completed: boolean };
};

interface CompletionCalendarProps {
  completionMap: Record<string, CompletionEntry>;
  todayISO: string;
}

export function CompletionCalendar({
  completionMap,
  todayISO,
}: CompletionCalendarProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();

  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, i);
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  });

  const last30Days = getLast30Days();
  const grid = getCalendarGrid(last30Days);

  const firstDay = last30Days[0];
  const lastDay = last30Days[last30Days.length - 1];

  const monthYear = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(firstDay);

  const isMultiMonth = firstDay.getUTCMonth() !== lastDay.getUTCMonth();
  const header = isMultiMonth
    ? `${new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(firstDay)} - ${new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(lastDay)}`
    : monthYear;

  const hasCompletions = Object.keys(completionMap).length > 0;

  return (
    <Card className="border border-gray-200 bg-white p-6">
      <Typography variant="h2" className="text-2xl mb-4">
        {t("completionHistory")}
      </Typography>

      {!hasCompletions ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{t("startYourHabit")}</p>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <Typography variant="h3" className="text-lg font-serif">
              {header}
            </Typography>
          </div>

          <div role="grid" aria-label="Completion calendar">
            <div className="grid grid-cols-7 gap-2 mobile:gap-1 mb-2">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="w-12 h-8 mobile:w-10 mobile:h-6 flex items-center justify-center text-xs font-medium text-gray-600"
                >
                  {label}
                </div>
              ))}
            </div>

            {grid.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="grid grid-cols-7 gap-2 mobile:gap-1 mb-2"
                role="row"
              >
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={dayIndex} className="w-12 h-12 mobile:w-10 mobile:h-10" />;
                  }

                  const dateKey = dateToKey(date);
                  const completion = completionMap[dateKey];
                  const hasEasy = !!completion?.easy?.completed;
                  const hasMedium = !!completion?.medium?.completed;
                  const isToday = dateKey === todayISO;

                  return (
                    <CalendarCell
                      key={dateKey}
                      date={date}
                      hasEasy={hasEasy}
                      hasMedium={hasMedium}
                      easyTime={completion?.easy?.time ?? null}
                      mediumTime={completion?.medium?.time ?? null}
                      isToday={isToday}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

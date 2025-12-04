export function getLast30Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - i
    ));
    days.push(date);
  }

  return days.reverse();
}

export function getCalendarGrid(days: Date[]): (Date | null)[][] {
  const grid: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  const firstDay = days[0];
  const startDayOfWeek = firstDay.getUTCDay();

  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    grid.push(currentWeek);
  }

  return grid;
}

export function dateToKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

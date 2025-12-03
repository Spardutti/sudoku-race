export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return isSameDay(date, yesterday);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

export function getDaysDifference(date1: Date, date2: Date): number {
  const utc1 = Date.UTC(
    date1.getUTCFullYear(),
    date1.getUTCMonth(),
    date1.getUTCDate()
  );
  const utc2 = Date.UTC(
    date2.getUTCFullYear(),
    date2.getUTCMonth(),
    date2.getUTCDate()
  );
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / msPerDay);
}

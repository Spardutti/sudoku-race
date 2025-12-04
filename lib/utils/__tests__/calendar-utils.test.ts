import { getLast30Days, getCalendarGrid, dateToKey } from '../calendar-utils';

describe('calendar-utils', () => {
  describe('getLast30Days', () => {
    it('should return exactly 30 days', () => {
      const days = getLast30Days();
      expect(days).toHaveLength(30);
    });

    it('should return days in chronological order (oldest to newest)', () => {
      const days = getLast30Days();
      for (let i = 1; i < days.length; i++) {
        expect(days[i].getTime()).toBeGreaterThan(days[i - 1].getTime());
      }
    });

    it('should include today as the last day', () => {
      const days = getLast30Days();
      const lastDay = days[days.length - 1];
      const today = new Date();

      expect(lastDay.getUTCFullYear()).toBe(today.getUTCFullYear());
      expect(lastDay.getUTCMonth()).toBe(today.getUTCMonth());
      expect(lastDay.getUTCDate()).toBe(today.getUTCDate());
    });

    it('should handle month boundaries correctly', () => {
      const days = getLast30Days();
      expect(days).toHaveLength(30);

      for (let i = 1; i < days.length; i++) {
        const diff = days[i].getTime() - days[i - 1].getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        expect(Math.abs(diff - oneDayMs)).toBeLessThan(1000);
      }
    });

    it('should use UTC dates', () => {
      const days = getLast30Days();
      days.forEach(day => {
        expect(day.getUTCHours()).toBe(0);
        expect(day.getUTCMinutes()).toBe(0);
        expect(day.getUTCSeconds()).toBe(0);
        expect(day.getUTCMilliseconds()).toBe(0);
      });
    });
  });

  describe('getCalendarGrid', () => {
    it('should return a 2D array of weeks', () => {
      const days = getLast30Days();
      const grid = getCalendarGrid(days);

      expect(Array.isArray(grid)).toBe(true);
      expect(grid.length).toBeGreaterThan(0);
      grid.forEach(week => {
        expect(week).toHaveLength(7);
      });
    });

    it('should pad first week with nulls based on starting day', () => {
      const testDate = new Date(Date.UTC(2025, 11, 4));
      const days = [testDate];
      const grid = getCalendarGrid(days);

      const dayOfWeek = testDate.getUTCDay();
      const firstWeek = grid[0];

      for (let i = 0; i < dayOfWeek; i++) {
        expect(firstWeek[i]).toBeNull();
      }
      expect(firstWeek[dayOfWeek]).toEqual(testDate);
    });

    it('should pad last week with nulls to complete the week', () => {
      const days = getLast30Days();
      const grid = getCalendarGrid(days);
      const lastWeek = grid[grid.length - 1];

      expect(lastWeek).toHaveLength(7);
    });

    it('should place dates in correct day-of-week columns', () => {
      const days = getLast30Days();
      const grid = getCalendarGrid(days);

      grid.forEach(week => {
        week.forEach((date, dayIndex) => {
          if (date !== null) {
            expect(date.getUTCDay()).toBe(dayIndex);
          }
        });
      });
    });

    it('should handle single day', () => {
      const singleDay = new Date(Date.UTC(2025, 0, 1));
      const grid = getCalendarGrid([singleDay]);

      expect(grid).toHaveLength(1);
      expect(grid[0]).toHaveLength(7);

      const dayOfWeek = singleDay.getUTCDay();
      expect(grid[0][dayOfWeek]).toEqual(singleDay);
    });
  });

  describe('dateToKey', () => {
    it('should return ISO date format YYYY-MM-DD', () => {
      const date = new Date(Date.UTC(2025, 11, 4));
      const key = dateToKey(date);
      expect(key).toBe('2025-12-04');
    });

    it('should pad single-digit months and days with zeros', () => {
      const date = new Date(Date.UTC(2025, 0, 5));
      const key = dateToKey(date);
      expect(key).toBe('2025-01-05');
    });

    it('should use UTC date components', () => {
      const date = new Date('2025-12-04T23:59:59.999Z');
      const key = dateToKey(date);
      expect(key).toBe('2025-12-04');
    });

    it('should handle leap year February', () => {
      const date = new Date(Date.UTC(2024, 1, 29));
      const key = dateToKey(date);
      expect(key).toBe('2024-02-29');
    });

    it('should handle year boundaries', () => {
      const newYear = new Date(Date.UTC(2025, 0, 1));
      expect(dateToKey(newYear)).toBe('2025-01-01');

      const newYearsEve = new Date(Date.UTC(2024, 11, 31));
      expect(dateToKey(newYearsEve)).toBe('2024-12-31');
    });
  });
});

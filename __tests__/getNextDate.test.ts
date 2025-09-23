import { getNextDate } from "../src/utils/financeHelperFunction";
import { FinanceInterval } from "../src/types/settings.types";

describe("getNextDate", () => {
  const toISODate = (d: Date) => new Date(d).toISOString().slice(0, 10);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns start date when today is before start date", () => {
    const today = new Date("2023-01-01T12:00:00Z");
    jest.setSystemTime(today);

    const start = new Date("2023-02-10T00:00:00Z");
    const result = getNextDate("month" as FinanceInterval, start);

    expect(toISODate(result)).toBe(toISODate(start));
  });

  it("returns today when today is exactly on an occurrence day (same day)", () => {
    const today = new Date("2023-03-15T08:30:00Z");
    jest.setSystemTime(today);

    const start = new Date("2023-01-15T00:00:00Z"); // monthly on the 15th
    const result = getNextDate("month" as FinanceInterval, start);

    expect(toISODate(result)).toBe(toISODate(today));
  });

  it("advances by days until reaching today for daily interval", () => {
    const today = new Date("2023-01-10T10:00:00Z");
    jest.setSystemTime(today);

    const start = new Date("2023-01-01T00:00:00Z");
    const result = getNextDate("day" as FinanceInterval, start);

    // Daily should hit today exactly
    expect(toISODate(result)).toBe("2023-01-10");
  });

  it("advances by weeks until the next occurrence on/after today", () => {
    const today = new Date("2023-03-10T09:00:00Z"); // Friday
    jest.setSystemTime(today);

    const start = new Date("2023-02-03T00:00:00Z"); // Friday start
    const result = getNextDate("week" as FinanceInterval, start);

    // Next weekly occurrence landing on a Friday on/after Mar 10 is Mar 10 itself
    expect(toISODate(result)).toBe("2023-03-10");
  });

  it("handles monthly progression to the next date after today", () => {
    const today = new Date("2023-03-10T00:00:00Z");
    jest.setSystemTime(today);

    const start = new Date("2023-01-15T00:00:00Z"); // 15th of each month
    const result = getNextDate("month" as FinanceInterval, start);

    // Next 15th on/after Mar 10 is Mar 15
    expect(toISODate(result)).toBe("2023-03-15");
  });

  it("handles quarterly progression to the next date after today", () => {
    const today = new Date("2023-05-01T00:00:00Z");
    jest.setSystemTime(today);

    const start = new Date("2023-01-01T00:00:00Z"); // quarterly: Jan 1, Apr 1, Jul 1, Oct 1
    const result = getNextDate("1/4 year" as FinanceInterval, start);

    // After May 1, next quarterly from Jan 1 schedule is Jul 1
    expect(toISODate(result)).toBe("2023-07-01");
  });

  it("handles half-year progression to the next date after today", () => {
    const today = new Date("2023-08-20T00:00:00Z");
    jest.setSystemTime(today);

    const start = new Date("2023-02-10T00:00:00Z"); // +6 months => Aug 10, then Feb 10, etc.
    const result = getNextDate("1/2 year" as FinanceInterval, start);

    // Next from Feb 10 is Aug 10, which is before today, so next is Feb 10, 2024
    expect(toISODate(result)).toBe("2024-02-10");
  });

  it("handles yearly progression to the next date after today", () => {
    const today = new Date("2025-09-23T00:00:00Z");
    jest.setSystemTime(today);

    const start = new Date("2023-12-01T00:00:00Z");
    const result = getNextDate("year" as FinanceInterval, start);

    // Yearly on Dec 1, after Sep 23, 2025 the next is Dec 1, 2025
    expect(toISODate(result)).toBe("2025-12-01");
  });
});

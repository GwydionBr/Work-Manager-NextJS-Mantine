import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addQuarters,
  addYears,
  addWeeks,
  isWithinInterval,
} from "date-fns";
import { de } from "date-fns/locale";

/**
 * Convert Date object to ISO date string (YYYY-MM-DD)
 * Uses date-fns for timezone-safe conversion
 */
export function dateToISOString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Convert string to Date object with timezone safety
 * Uses date-fns parseISO for consistent parsing
 */
export function stringToDate(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Create a date at the start of the day (00:00:00)
 * Ensures consistent timezone handling
 */
export function createStartOfDay(date: Date): Date {
  return startOfDay(date);
}

/**
 * Create a date at the end of the day (23:59:59)
 * Ensures consistent timezone handling
 */
export function createEndOfDay(date: Date): Date {
  return endOfDay(date);
}

/**
 * Get the start of a month (first day, 00:00:00)
 */
export function getStartOfMonth(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Get the end of a month (last day, 23:59:59)
 */
export function getEndOfMonth(date: Date): Date {
  return endOfMonth(date);
}

/**
 * Get the start of a week (Monday, 00:00:00)
 */
export function getStartOfWeek(date: Date): Date {
  return startOfWeek(date, { locale: de });
}

/**
 * Get the end of a week (Sunday, 23:59:59)
 */
export function getEndOfWeek(date: Date): Date {
  return endOfWeek(date, { locale: de });
}

/**
 * Get the start of a quarter
 */
export function getStartOfQuarter(date: Date): Date {
  return startOfQuarter(date);
}

/**
 * Get the end of a quarter
 */
export function getEndOfQuarter(date: Date): Date {
  return endOfQuarter(date);
}

/**
 * Get the start of a year
 */
export function getStartOfYear(date: Date): Date {
  return startOfYear(date);
}

/**
 * Get the end of a year
 */
export function getEndOfYear(date: Date): Date {
  return endOfYear(date);
}

/**
 * Check if a date is within a given interval
 * Uses date-fns for accurate interval checking
 */
export function isDateInInterval(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  return isWithinInterval(date, { start: startDate, end: endDate });
}

/**
 * Add days to a date safely
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/**
 * Add weeks to a date safely
 */
export function addWeeksToDate(date: Date, weeks: number): Date {
  return addWeeks(date, weeks);
}

/**
 * Add months to a date safely
 */
export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}

/**
 * Add quarters to a date safely
 */
export function addQuartersToDate(date: Date, quarters: number): Date {
  return addQuarters(date, quarters);
}

/**
 * Add years to a date safely
 */
export function addYearsToDate(date: Date, years: number): Date {
  return addYears(date, years);
}

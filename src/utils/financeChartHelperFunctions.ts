import { FinanceInterval } from "@/types/settings.types";

/**
 * Format currency amounts according to user's locale and currency preference
 */
export function formatCurrency(amount: number, currency: string = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format dates for display based on selected interval
 * Provides user-friendly date representations
 */
export function formatDate(dateString: string, interval: FinanceInterval) {
  const date = new Date(dateString);
  switch (interval) {
    case "day":
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      });
    case "week":
      // Calculate week number manually for German format
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
      );
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      return `KW ${weekNumber}`; // German: Kalenderwoche
    case "month":
      return date.toLocaleDateString("de-DE", {
        month: "short",
        year: "2-digit",
      });
    case "1/4 year":
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case "1/2 year":
      return `H${Math.floor(date.getMonth() / 6) + 1} ${date.getFullYear()}`;
    case "year":
      return date.getFullYear().toString();
    default:
      return dateString;
  }
}

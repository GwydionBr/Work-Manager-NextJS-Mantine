import { Currency, Locale } from "@/types/settings.types";
import { shortCurrencies } from "@/constants/settings";

export function formatDate(date: Date, locale: Locale) {
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatMonth(month: number, locale: Locale) {
  return new Date(2023, month - 1, 1).toLocaleString(locale, {
    month: "long",
  });
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h - ${minutes}min`;
}

export function formatTimeSpan(start: Date, end: Date, locale: Locale): string {
  return `${formatDateTime(start, locale)} - ${formatDateTime(end, locale)}`;
}

export function formatDateTime(date: Date, locale: Locale) {
  return date.toLocaleString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(
  amount: number,
  currency: Currency,
  locale: Locale
): string {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function getCurrencySymbol(currency: Currency): string {
  return shortCurrencies.find((c) => c.value === currency)?.label ?? "$";
}
import { RoundingAmount, RoundingDirection } from "@/types/settings.types";

export function roundTime(
  seconds: number,
  roundingAmount: RoundingAmount,
  roundingMode: RoundingDirection
) {
  if (roundingAmount === "s") {
    return seconds;
  }

  let roundingInterval: number;
  switch (roundingAmount) {
    case "min":
      roundingInterval = 60;
      break;
    case "1/4h":
      roundingInterval = 900; // 15 minutes
      break;
    case "1/2h":
      roundingInterval = 1800; // 30 minutes
      break;
    case "h":
      roundingInterval = 3600; // 1 hour
      break;
    default:
      return seconds;
  }

  switch (roundingMode) {
    case "up":
      return Math.ceil(seconds / roundingInterval) * roundingInterval;
    case "down":
      return Math.floor(seconds / roundingInterval) * roundingInterval;
    case "nearest":
      return Math.round(seconds / roundingInterval) * roundingInterval;
    default:
      return seconds;
  }
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h - ${minutes}min`;
}

export function formatTimeSpan(start: Date, end: Date): string {
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
}

export function formatDateTime(date: Date) {
  return date.toLocaleString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatMoney(amount: number, currency: string): string {
  if (currency === "$") {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatEarningsAmount(amount: number, currency: string) {
  if (currency === "$") {
    return ` ${currency}${amount.toFixed(2)}`;
  }

  return `${amount.toFixed(2)}${currency}`;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatMonth(month: number) {
  return new Date(2023, month - 1, 1).toLocaleString(undefined, {
    month: "long",
  });
}

export function getWeekNumber(date: Date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - firstJan.getTime();
  return Math.ceil((diff / (1000 * 60 * 60 * 24) + firstJan.getDay() + 1) / 7);
}

export function secondsToTimerFormat(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;

  const hoursStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = secondsLeft.toString().padStart(2, '0');

  return `${hoursStr}${minutesStr}:${secondsStr}`;
}

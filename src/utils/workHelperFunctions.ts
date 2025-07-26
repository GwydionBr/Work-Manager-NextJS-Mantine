import {
  RoundingAmount,
  RoundingDirection,
  Currency,
} from "@/types/settings.types";
import { shortCurrencies } from "@/constants/settings";
import { Tables, TablesInsert } from "@/types/db.types";

export function getRoundingInterval(
  roundingAmount: RoundingAmount,
  customRoundingAmount?: number
) {
  switch (roundingAmount) {
    case "s":
      return 1;
    case "1/4h":
      return 900; // 15 minutes
    case "1/2h":
      return 1800; // 30 minutes
    case "h":
      return 3600; // 1 hour
    case "custom":
      return (customRoundingAmount ?? 0) * 60;
    default:
      return 60;
  }
}

export function getRoundedSeconds(
  seconds: number,
  roundingInterval: number,
  roundingMode: RoundingDirection
) {
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

export function getCurrencySymbol(currency: Currency): string {
  return shortCurrencies.find((c) => c.value === currency)?.label ?? "$";
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
  // TODO: implement different locales
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
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstDayOffset = firstDayOfMonth.getDay() || 7;
  const adjustedOffset = firstDayOffset - 1;

  return Math.ceil((dayOfMonth + adjustedOffset) / 7);
}

export function secondsToTimerFormat(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;

  const hoursStr = hours > 0 ? `${hours}:` : "";
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = secondsLeft.toString().padStart(2, "0");

  return `${hoursStr}${minutesStr}:${secondsStr}`;
}

export function checkAndAdjustSessionOverlap(
  newSession: TablesInsert<"timerSession">,
  existingSessions: Tables<"timerSession">[],
  roundingAmount?: RoundingAmount,
  roundingMode?: RoundingDirection,
  customRoundingAmount?: number
): { adjustedSession: TablesInsert<"timerSession">; shouldCreate: boolean } {
  // Filter sessions for the same project
  const projectSessions = existingSessions.filter(
    (session) => session.project_id === newSession.project_id
  );

  if (projectSessions.length === 0) {
    return { adjustedSession: newSession, shouldCreate: true };
  }

  // Sort sessions by start_time to find overlapping sessions
  const sortedSessions = projectSessions.sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const newStartTime = new Date(newSession.start_time).getTime();
  const newEndTime = new Date(newSession.end_time).getTime();

  // Check for any overlapping sessions
  const overlappingSessions = sortedSessions.filter((session) => {
    const sessionStart = new Date(session.start_time).getTime();
    const sessionEnd = new Date(session.end_time).getTime();

    // Check if sessions overlap
    return (
      (newStartTime >= sessionStart && newStartTime < sessionEnd) || // New session starts during existing session
      (newEndTime > sessionStart && newEndTime <= sessionEnd) || // New session ends during existing session
      (newEndTime > sessionStart && newStartTime < sessionEnd) // Sessions overlap
    );
  });

  const adjustedSession = { ...newSession };

  overlappingSessions.forEach((session) => {
    const sessionStart = new Date(session.start_time).getTime();
    const sessionEnd = new Date(session.end_time).getTime();
    const adjustedSessionStart = new Date(adjustedSession.start_time).getTime();
    const adjustedSessionEnd = new Date(adjustedSession.end_time).getTime();

    if (
      adjustedSessionEnd > sessionStart &&
      adjustedSessionStart < sessionEnd
    ) {
      return { adjustedSession: adjustedSession, shouldCreate: false };
    }
  });

  return { adjustedSession: adjustedSession, shouldCreate: true };
}

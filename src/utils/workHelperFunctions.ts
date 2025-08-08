import {
  RoundingAmount,
  RoundingDirection,
  Currency,
} from "@/types/settings.types";
import { shortCurrencies } from "@/constants/settings";
import { Tables, TablesInsert } from "@/types/db.types";
import { TimerState } from "@/stores/timeTrackerStore";

export function getStatusColor(state: TimerState) {
  switch (state) {
    case TimerState.Running:
      return "lime";
    case TimerState.Paused:
      return "yellow";
    case TimerState.Stopped:
      return "teal.6";
    default:
      return "blue";
  }
}

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

export function formatMoney(amount: number, currency: Currency): string {
  const hasDecimals = amount % 1 !== 0;
  const formattedAmount = hasDecimals ? amount.toFixed(2) : amount.toString();
  if (currency === "USD") {
    return `$${formattedAmount}`;
  }
  return `${formattedAmount} ${getCurrencySymbol(currency)}`;
}

export function formatEarningsAmount(amount: number, currency: Currency) {
  if (currency === "USD") {
    return ` $${amount.toFixed(2)}`;
  }

  return `${amount.toFixed(2)}${getCurrencySymbol(currency)}`;
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

/**
 * Splits a session into multiple time blocks based on the specified interval.
 *
 * Example: If a session runs from 17:17 to 17:36 and timeSectionInterval is "10min",
 * it will create 3 sessions:
 * - 17:10-17:20 (3 minutes active: 17:17-17:20)
 * - 17:20-17:30 (10 minutes active: 17:20-17:30)
 * - 17:30-17:40 (6 minutes active: 17:30-17:36)
 *
 * @param start - Start time of the original session
 * @param end - End time of the original session
 * @param timeSectionInterval - Time interval for splitting (5, 10, 15, 30, 60)
 * @param originalSession - Optional original session data to copy properties from
 * @returns Array of session objects split into time blocks
 */
export function getTimeSectionSessions(
  start: Date,
  end: Date,
  timeSectionInterval: number,
  originalSession: TablesInsert<"timerSession">
) {
  const sessions: TablesInsert<"timerSession">[] = [];

  // Calculate the start of the first time block
  const blockStart = new Date(start);
  blockStart.setMinutes(
    Math.floor(blockStart.getMinutes() / timeSectionInterval) *
      timeSectionInterval
  );
  blockStart.setSeconds(0);
  blockStart.setMilliseconds(0);
  console.log("blockStart", blockStart);

  // Calculate the end of the last time block
  const blockEnd = new Date(end);
  blockEnd.setMinutes(
    Math.ceil(blockEnd.getMinutes() / timeSectionInterval) * timeSectionInterval
  );
  blockEnd.setSeconds(0);
  blockEnd.setMilliseconds(0);
  console.log("blockEnd", blockEnd);
  let currentBlockStart = new Date(blockStart);

  while (currentBlockStart < blockEnd) {
    const currentBlockEnd = new Date(currentBlockStart);
    currentBlockEnd.setMinutes(
      currentBlockEnd.getMinutes() + timeSectionInterval
    );

    const session: TablesInsert<"timerSession"> = {
      start_time: currentBlockStart.toISOString(),
      real_start_time:
        start > currentBlockStart
          ? start.toISOString()
          : currentBlockStart.toISOString(),
      end_time: currentBlockEnd.toISOString(),
      true_end_time:
        end < currentBlockEnd
          ? end.toISOString()
          : currentBlockEnd.toISOString(),
      active_seconds: timeSectionInterval * 60,
      paused_seconds: 0,
      salary: originalSession.salary,
      project_id: originalSession.project_id,
      currency: originalSession.currency,
      hourly_payment: originalSession.hourly_payment,
      payed: false,
      payout_id: null,
      user_id: originalSession.user_id,
    };

    sessions.push(session);

    currentBlockStart = currentBlockEnd;
  }

  return sessions;
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

import { TablesInsert } from "@/types/db.types";

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
 * @param timeFragmentInterval - Time interval for splitting (5, 10, 15, 30, 60)
 * @param originalSession - Optional original session data to copy properties from
 * @returns Array of session objects split into time blocks
 */
export function getTimeFragmentSession(
  start: Date,
  end: Date,
  timeFragmentInterval: number,
  originalSession: TablesInsert<"timer_session">
) {
  // Calculate the start of the first time block
  const blockStart = new Date(start);
  blockStart.setMinutes(
    Math.floor(blockStart.getMinutes() / timeFragmentInterval) *
      timeFragmentInterval
  );
  blockStart.setSeconds(0);
  blockStart.setMilliseconds(0);
  console.log("blockStart", blockStart);

  // Calculate the end of the last time block
  let blockEnd = new Date(end);
  blockEnd.setMinutes(
    Math.ceil(blockEnd.getMinutes() / timeFragmentInterval) *
      timeFragmentInterval
  );
  blockEnd.setSeconds(0);
  blockEnd.setMilliseconds(0);
  console.log("blockEnd", blockEnd);

  if (blockStart === blockEnd) {
    blockEnd.setMinutes(blockEnd.getMinutes() + timeFragmentInterval);
  }

  const newSession: TablesInsert<"timer_session"> = {
    ...originalSession,
    start_time: blockStart.toISOString(),
    end_time: blockEnd.toISOString(),
    active_seconds: (blockEnd.getTime() - blockStart.getTime()) / 1000,
    paused_seconds: 0,
    time_fragments_interval: timeFragmentInterval,
  };

  return newSession;
}

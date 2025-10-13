import { InsertWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";

/**
 * Filters out existing time entries that overlap with the new time entry.
 * If there are no collisions, returns the new session as is.
 * If there are collisions, adjusts the session to fit the collisions.
 * @param existingTimeEntries - Existing time entries
 * @param newTimeEntry - New time entry
 * @returns Adjusted session Array and overlapping sessions
 */
export function resolveTimeEntryOverlaps(
  existingTimeEntries: WorkTimeEntry[],
  newTimeEntry: InsertWorkTimeEntry
): {
  adjustedTimeSpans: InsertWorkTimeEntry[] | null;
  overlappingTimeEntries: WorkTimeEntry[];
} {
  const newStart = new Date(newTimeEntry.start_time).getTime();
  const newEnd = new Date(newTimeEntry.end_time).getTime();

  // Find all time entries that overlap with the new time entry
  const overlappingTimeEntries = existingTimeEntries.filter(
    (existingTimeEntry) => {
      const existingStart = new Date(existingTimeEntry.start_time).getTime();
      const existingEnd = new Date(existingTimeEntry.end_time).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    }
  );

  if (overlappingTimeEntries.length === 0) {
    return {
      adjustedTimeSpans: [newTimeEntry],
      overlappingTimeEntries: overlappingTimeEntries,
    };
  }

  // Collect all time points
  const timePoints: {
    time: number;
    type: "start" | "end";
    isNewTimeEntry: boolean;
  }[] = [
    { time: newStart, type: "start", isNewTimeEntry: true },
    { time: newEnd, type: "end", isNewTimeEntry: true },
  ];

  for (const overlappingTimeEntry of overlappingTimeEntries) {
    const overlappingStart = new Date(
      overlappingTimeEntry.start_time
    ).getTime();
    const overlappingEnd = new Date(overlappingTimeEntry.end_time).getTime();
    timePoints.push({
      time: overlappingStart,
      type: "start",
      isNewTimeEntry: false,
    });
    timePoints.push({
      time: overlappingEnd,
      type: "end",
      isNewTimeEntry: false,
    });
  }

  timePoints.sort((a, b) => a.time - b.time);

  // Build intervals
  const adjustedTimeSpans: InsertWorkTimeEntry[] = [];
  let activeNew = false;
  let activeExisting = 0;

  for (let i = 0; i < timePoints.length - 1; i++) {
    const current = timePoints[i];
    const next = timePoints[i + 1];

    if (current.isNewTimeEntry && current.type === "start") activeNew = true;
    if (current.isNewTimeEntry && current.type === "end") activeNew = false;
    if (!current.isNewTimeEntry && current.type === "start") activeExisting++;
    if (!current.isNewTimeEntry && current.type === "end") activeExisting--;

    // If the new time entry is active and no existing time entry is active
    if (activeNew && activeExisting === 0 && next.time > current.time) {
      adjustedTimeSpans.push({
        ...newTimeEntry,
        start_time: new Date(current.time).toISOString(),
        end_time: new Date(next.time).toISOString(),
        active_seconds: Math.round((next.time - current.time) / 1000),
      });
    }
  }

  return {
    adjustedTimeSpans: adjustedTimeSpans.length > 0 ? adjustedTimeSpans : null,
    overlappingTimeEntries: overlappingTimeEntries,
  };
}

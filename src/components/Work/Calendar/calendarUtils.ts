import { Tables } from "@/types/db.types";

// Shared types and utilities for the Work calendar UI.
// Keep this file UI-framework agnostic so it can be reused across components.

// Lightweight shape used by the calendar renderer. We deliberately
// keep only the fields required for layout, grouping and labeling.
export type CalendarSession = Pick<
  Tables<"timer_session">,
  | "id"
  | "start_time"
  | "end_time"
  | "project_id"
  | "memo"
  | "payed"
  | "active_seconds"
>;

// Normalizes a date to midnight (local time). Used for day-bounded layout
// and clipping of sessions that cross day boundaries.
export function getStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Adds a number of days without mutating the original date.
export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Bounds a number between [min, max]. Useful for pixel positioning.
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Simple stable hash for deterministic color selection per project.
export function hashStringToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Maps a project id to a Mantine color trio used by the timeline:
// - rail: main solid color for the time segment on the rail
// - border: darker outline used for bubble/border
// - fill: light background if needed (not used everywhere yet)
export function getProjectColor(projectId: string | null): {
  rail: string;
  border: string;
  fill: string;
} {
  const palette = [
    "blue",
    "teal",
    "violet",
    "cyan",
    "grape",
    "orange",
    "pink",
    "lime",
    "indigo",
    "red",
  ];
  const index = hashStringToNumber(projectId ?? "unknown") % palette.length;
  const color = palette[index];
  return {
    rail: `var(--mantine-color-${color}-6)`,
    border: `var(--mantine-color-${color}-7)`,
    fill: `var(--mantine-color-${color}-1)`,
  };
}

// Merge sessions that touch or overlap while having the same project and memo.
// This reduces visual clutter when tracking was paused/resumed frequently.
export function mergeAdjacentSessionsForRender(
  items: CalendarSession[]
): CalendarSession[] {
  if (items.length === 0) return items;
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const merged: CalendarSession[] = [];
  for (const current of sorted) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.project_id === current.project_id &&
      (prev.memo || "") === (current.memo || "") &&
      new Date(current.start_time).getTime() <=
        new Date(prev.end_time).getTime()
    ) {
      // Combine durations and stretch the end time to the latest end
      const durationPrev =
        (new Date(prev.end_time).getTime() -
          new Date(prev.start_time).getTime()) /
        1000;
      const durationCur =
        (new Date(current.end_time).getTime() -
          new Date(current.start_time).getTime()) /
        1000;
      merged[merged.length - 1] = {
        ...prev,
        id: `${prev.id}+${current.id}`,
        end_time:
          new Date(current.end_time).getTime() >
          new Date(prev.end_time).getTime()
            ? current.end_time
            : prev.end_time,
        active_seconds:
          (prev.active_seconds || durationPrev) +
          (current.active_seconds || durationCur),
      };
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

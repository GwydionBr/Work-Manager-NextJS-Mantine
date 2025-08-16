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

export function getEndOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
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
    "yellow",
    "green",
    "gray",
    "dark",
  ];

  // Use a more sophisticated hash to distribute colors better
  const hash = hashStringToNumber(projectId ?? "unknown");
  const index = hash % palette.length;

  // For projects with similar hashes, try to use different color variations
  const color = palette[index];
  const colorVariation = Math.floor((hash / palette.length) % 3); // 0, 1, or 2

  // Use different color intensities based on the variation
  const intensity =
    colorVariation === 0 ? "6" : colorVariation === 1 ? "5" : "7";

  return {
    rail: `var(--mantine-color-${color}-${intensity})`,
    border: `var(--mantine-color-${color}-${colorVariation === 0 ? "7" : colorVariation === 1 ? "6" : "8"})`,
    fill: `var(--mantine-color-${color}-1)`,
  };
}

// Maps a project's time rank to a Mantine color trio based on time spent
// - Projects with most time get primary colors
// - Projects with less time get secondary/tertiary colors
// - Ensures consistent color assignment based on time ranking
export function getProjectColorByTimeRank(rank: number): {
  rail: string;
  border: string;
  fill: string;
} {
  // Primary colors for top projects (most time)
  const primaryColors = [
    { name: "blue", rail: "6", border: "7", fill: "1" },
    { name: "orange", rail: "6", border: "7", fill: "1" },
    { name: "violet", rail: "6", border: "7", fill: "1" },
    { name: "lime", rail: "6", border: "7", fill: "1" },
    { name: "grape", rail: "6", border: "7", fill: "1" },
  ];

  // Secondary colors for medium projects
  const secondaryColors = [
    { name: "teal", rail: "5", border: "6", fill: "1" },
    { name: "pink", rail: "5", border: "6", fill: "1" },
    { name: "cyan", rail: "5", border: "6", fill: "1" },
    { name: "indigo", rail: "5", border: "6", fill: "1" },
    { name: "red", rail: "5", border: "6", fill: "1" },
  ];

  // Tertiary colors for smaller projects
  const tertiaryColors = [
    { name: "yellow", rail: "4", border: "5", fill: "1" },
    { name: "green", rail: "4", border: "5", fill: "1" },
    { name: "gray", rail: "4", border: "5", fill: "1" },
    { name: "dark", rail: "4", border: "5", fill: "1" },
  ];

  let colorConfig;

  if (rank < primaryColors.length) {
    // Top projects get primary colors
    colorConfig = primaryColors[rank];
  } else if (rank < primaryColors.length + secondaryColors.length) {
    // Medium projects get secondary colors
    colorConfig = secondaryColors[rank - primaryColors.length];
  } else {
    // Smaller projects get tertiary colors, cycling through them
    const tertiaryIndex =
      (rank - primaryColors.length - secondaryColors.length) %
      tertiaryColors.length;
    colorConfig = tertiaryColors[tertiaryIndex];
  }

  return {
    rail: `var(--mantine-color-${colorConfig.name}-${colorConfig.rail})`,
    border: `var(--mantine-color-${colorConfig.name}-${colorConfig.border})`,
    fill: `var(--mantine-color-${colorConfig.name}-${colorConfig.fill})`,
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

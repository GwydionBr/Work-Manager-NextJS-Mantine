import { Tables } from "@/types/db.types";

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

export function getStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function hashStringToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

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

import { Tables } from "./db.types";

export type ViewMode = "day" | "week";

export type CalendarDay = {
  day: Date;
  sessions: Tables<"timer_session">[];
};
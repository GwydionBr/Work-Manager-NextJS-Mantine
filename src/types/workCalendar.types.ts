import { Tables } from "./db.types";

export type ViewMode = "day" | "week";

export type CalendarDay = {
  day: Date;
  sessions: Tables<"timer_session">[];
};

export type CalendarSession = Pick<
  Tables<"timer_session">,
  | "id"
  | "start_time"
  | "end_time"
  | "project_id"
  | "memo"
  | "payed"
  | "active_seconds"
> & {
  projectTitle: string;
};

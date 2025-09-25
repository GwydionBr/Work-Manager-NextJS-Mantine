import { Tables } from "./db.types";

export interface TimerProject {
  project: Tables<"timer_project">;
  sessions: Tables<"timer_session">[];
  categories: Tables<"finance_category">[];
}

export interface StoreTimerProject extends Tables<"timer_project"> {
  categoryIds: string[];
}

export interface ProjectTreeItem {
  id: string;
  name: string;
  index: number;
  type: "project" | "folder";
  children?: ProjectTreeItem[];
}

export interface TimeSpan {
  start_time: number;
  end_time: number;
}

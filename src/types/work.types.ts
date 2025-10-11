import { Tables, TablesInsert, TablesUpdate } from "./db.types";

export interface OldTimerProject {
  project: Tables<"timer_project">;
  sessions: Tables<"timer_session">[];
  categories: Tables<"finance_category">[];
}

export interface TimerProject extends Tables<"timer_project"> {
  sessions: Tables<"timer_session">[];
  categories: Tables<"finance_category">[];
}

export interface InsertTimerProject extends TablesInsert<"timer_project"> {
  categories: Tables<"finance_category">[];
}

export interface UpdateTimerProject extends TablesUpdate<"timer_project"> {
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

import { Tables } from "./db.types";

export interface TimerProject {
  project: Tables<"timer_project">;
  sessions: Tables<"timer_session">[];
}

export interface ProjectTreeItem {
  id: string;
  name: string;
  index: number;
  type: "project" | "folder";
  children?: ProjectTreeItem[];
}

export interface SessionCollisionFragment {
  start_time: string;
  end_time: string;
}
import { Tables } from "./db.types";

export interface TimerProject {
  project: Tables<"timerProject">;
  sessions: Tables<"timerSession">[];
}

export interface ProjectTreeItem {
  id: string;
  name: string;
  index: number;
  type: "project" | "folder";
  children?: ProjectTreeItem[];
}
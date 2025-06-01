import { Tables } from "@/types/db.types";

interface TaskRowProps {
  task: Tables<"group_task">;
}

export default function TaskRow({ task }: TaskRowProps) {
  return <div>{task.title}</div>;
}

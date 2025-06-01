"use client";

import { Stack } from "@mantine/core";
import NewTaskButton from "./NewTaskButton";
import { useGroupStore } from "@/stores/groupStore";
import TaskRow from "./TaskRow";

export default function TaskList() {
  const { activeGroup } = useGroupStore();

  return (
    <Stack w="100%" align="center">
      <Stack maw={800} align="center" w="100%">
        <NewTaskButton />
        <Stack>
          {activeGroup?.groupTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

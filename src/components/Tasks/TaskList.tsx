"use client";

import { useTaskStore } from "@/stores/taskStore";

import { Stack } from "@mantine/core";
import TaskRow from "./TaskRow";
import TaskInput from "./TaskInput";

export default function TaskList() {
  const { tasks, toggleTask, deleteTask } = useTaskStore();

  return (
    <Stack maw={600} align="center" w="100%" gap="xl">
      <TaskInput />
      <Stack w="100%">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            handleCheckChange={toggleTask}
            onDelete={deleteTask}
          />
        ))}
      </Stack>
    </Stack>
  );
}

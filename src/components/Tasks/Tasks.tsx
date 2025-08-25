"use client";

import { Stack } from "@mantine/core";
import TaskList from "./TaskList";

export default function Tasks() {
  return (
    <Stack w="100%" align="center">
      <TaskList />
    </Stack>
  );
}

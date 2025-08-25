import { Stack } from "@mantine/core";
import Header from "@/components/Header/Header";
import Tasks from "@/components/Tasks/Tasks";

export default function TasksPage() {
  return (
    <Stack>
      <Header headerTitle="Tasks" />
      <Tasks />
    </Stack>
  );
}

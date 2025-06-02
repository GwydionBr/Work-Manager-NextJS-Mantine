"use client";

import { useWorkStore } from "@/stores/workManagerStore";

import { Stack } from "@mantine/core";
import Header from "@/components/Header/Header";
import SessionList from "@/components/Work/Session/SessionList";

export default function WorkOverviewPage() {
  const { projects: timerProjects } = useWorkStore();

  const sessions = timerProjects.flatMap((project) => project.sessions);
  const projects = timerProjects.map((project) => project.project);

  return (
    <Stack align="center" w="100%" px="xl">
      <Header headerTitle="Work Overview" />
      <SessionList sessions={sessions} projects={projects} />
    </Stack>
  );
}

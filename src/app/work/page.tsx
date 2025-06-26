"use client";

import { useWorkStore } from "@/stores/workManagerStore";

import { Loader, Stack } from "@mantine/core";
import SessionList from "@/components/Work/Session/SessionList";
import NewSessionButton from "@/components/Work/Session/NewSessionButton";
import EditProjectButton from "@/components/Work/Project/EditProjectButton";
import Header from "@/components/Header/Header";

import { formatMoney, getCurrencySymbol } from "@/utils/workHelperFunctions";

export default function WorkPage() {
  const { activeProjectId, isFetching } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );

  if (!activeProject || isFetching) {
    return (
      <Stack align="center" w="100%" px="xl">
        <Header headerTitle="Work Manager" />
        <Loader />
      </Stack>
    );
  }

  const salary = formatMoney(
    activeProject.project.salary,
    getCurrencySymbol(activeProject.project.currency)
  );

  // Calculate total active seconds from all sessions
  const totalActiveSeconds = activeProject.sessions.reduce(
    (total, session) => total + session.active_seconds,
    0
  );

  const hourlySalary = formatMoney(
    activeProject.project.hourly_payment
      ? activeProject.project.salary
      : totalActiveSeconds > 0
        ? (activeProject.project.salary / totalActiveSeconds) * 3600
        : 0,
    getCurrencySymbol(activeProject.project.currency)
  );

  return (
    <Stack align="center" w="100%" px="xl">
      <Header
        headerTitle={activeProject.project.title}
        leftSalary={activeProject.project.hourly_payment ? undefined : salary}
        rightSalary={hourlySalary}
        description={activeProject.project.description ?? undefined}
        primaryButton={<EditProjectButton />}
        secondaryButton={<NewSessionButton />}
      />
      <SessionList sessions={activeProject.sessions} />
    </Stack>
  );
}

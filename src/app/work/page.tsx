"use client";

import { useWorkStore } from "@/stores/workManagerStore";

import { Loader, Stack } from "@mantine/core";
import SessionList from "@/components/Work/Session/SessionList";
import NewSessionButton from "@/components/Work/Session/NewSessionButton";
import EditProjectButton from "@/components/Work/Project/EditProjectButton";
import Header from "@/components/Header/Header";

import { formatMoney, getCurrencySymbol } from "@/utils/workHelperFunctions";

export default function WorkPage() {
  const { activeProjectId: activeProject, isFetching } = useWorkStore();

  if (!activeProject || isFetching) {
    return (
      <Stack align="center" w="100%" px="xl">
        <Header headerTitle="Work Manager" />
        <Loader />
      </Stack>
    );
  }

  const description = formatMoney(
    activeProject.project.salary,
    getCurrencySymbol(activeProject.project.currency)
  );

  return (
    <Stack align="center" w="100%" px="xl">
      <Header
        headerTitle={activeProject.project.title}
        description={description}
        primaryButton={<EditProjectButton />}
        secondaryButton={<NewSessionButton />}
      />
      <SessionList sessions={activeProject.sessions} />
    </Stack>
  );
}

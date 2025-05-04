"use client";

import { useWorkStore } from "@/stores/workManagerStore";

import { Center, Stack } from "@mantine/core";
import SessionList from "@/components/Work/Session/SessionList";
import NewSessionButton from "@/components/Work/Session/NewSessionButton";
import EditProjectButton from "@/components/Work/Project/EditProjectButton";
import Header from "@/components/Header/Header";

import { formatMoney, getCurrencySymbol } from "@/utils/workHelperFunctions";

export default function WorkPage() {
  const { activeProject } = useWorkStore();

  if (!activeProject) {
    return <Center>Please select a project</Center>;
  }

  const description = formatMoney(
    activeProject.project.salary,
    getCurrencySymbol(activeProject.project.currency)
  );

  return (
    <Stack align="center" w="100%">
      <Header
        headerTitle={activeProject.project.title}
        description={description}
        primaryButton={<EditProjectButton />}
        secondaryButton={<NewSessionButton />}
      />
      <SessionList sessions={activeProject.sessions}/>
    </Stack>
  );
}


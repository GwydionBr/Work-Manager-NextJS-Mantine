"use client";

import { Center, Stack, Button } from "@mantine/core";
import SessionList from "@/components/Work/Session/SessionList";
import { useWorkStore } from "@/stores/workManagerStore";
import EditProjectButton from "@/components/Work/Project/EditProjectButton";
import Header from "@/components/Header/Header";
import { formatMoney } from "@/utils/workHelperFunctions";
import NewSessionButton from "@/components/Work/Session/NewSessionButton";

export default function WorkPage() {
  const { activeProject } = useWorkStore();

  if (!activeProject) {
    return <Center>Please select a project</Center>;
  }

  const description = formatMoney(
    activeProject.project.salary,
    activeProject.project.currency ?? "$"
  );

  return (
    <Stack align="center" w="100%">
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


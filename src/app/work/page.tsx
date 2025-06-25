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

  return (
    <Stack align="center" w="100%" px="xl">
      <Header
        headerTitle={activeProject.project.title}
        salary={salary}
        paymentPerProject={activeProject.project.payment_per_project}
        description={activeProject.project.description ?? undefined}
        primaryButton={<EditProjectButton />}
        secondaryButton={<NewSessionButton />}
      />
      <SessionList sessions={activeProject.sessions} />
    </Stack>
  );
}

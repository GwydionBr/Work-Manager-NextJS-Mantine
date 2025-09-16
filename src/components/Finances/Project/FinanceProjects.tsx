"use client";

import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { ActionIcon, Stack } from "@mantine/core";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import FinanceProjectFormModal from "./FinanceProjectFormModal";
import FinanceProjectCard from "./FinanceProjectCard";
import { IconMoneybagPlus } from "@tabler/icons-react";

export default function FinanceProjects() {
  const { financeProjects } = useFinanceStore();
  const { locale } = useSettingsStore();
  const [
    addProjectModalOpened,
    { close: closeAddProjectModal, toggle: toggleAddProjectModal },
  ] = useDisclosure(false);
  return (
    <Stack align="center">
      <DelayedTooltip
        label={
          locale === "de-DE"
            ? "Finanz Projekt hinzufügen"
            : "Add Finance Project"
        }
      >
        <DelayedTooltip
          label={
            locale === "de-DE"
              ? "Finanz Projekt hinzufügen"
              : "Add Finance Project"
          }
        >
          <ActionIcon onClick={toggleAddProjectModal} variant="subtle">
            <IconMoneybagPlus />
          </ActionIcon>
        </DelayedTooltip>
      </DelayedTooltip>
      <Stack w="100%" align="center">
        {financeProjects.map((project) => (
          <FinanceProjectCard key={project.id} project={project} />
        ))}
      </Stack>
      <FinanceProjectFormModal
        opened={addProjectModalOpened}
        onClose={closeAddProjectModal}
      />
    </Stack>
  );
}

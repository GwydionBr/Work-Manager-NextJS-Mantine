"use client";

import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack } from "@mantine/core";
import AddActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import FinanceProjectFormModal from "./FinanceProjectFormModal";
import FinanceProjectCard from "./FinanceProjectCard";

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
        <AddActionIcon onClick={toggleAddProjectModal} />
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

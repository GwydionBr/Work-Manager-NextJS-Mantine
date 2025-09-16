"use client";

import { useCallback, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { ActionIcon, Box, Collapse, Group, Stack, Text } from "@mantine/core";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import FinanceProjectFormModal from "./FinanceProjectFormModal";
import FinanceProjectCard from "./FinanceProjectCard";
import { IconMoneybagPlus } from "@tabler/icons-react";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";

export default function FinanceProjects() {
  const { financeProjects, isFetching } = useFinanceStore();
  const { locale } = useSettingsStore();
  const [selectedFinanceProjects, setSelectedFinanceProjects] = useState<
    string[]
  >([]);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);
  const [
    addProjectModalOpened,
    { close: closeAddProjectModal, toggle: toggleAddProjectModal },
  ] = useDisclosure(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  const handleToggleSelectedMode = useCallback(() => {
    toggleSelectedMode();
    setSelectedFinanceProjects([]);
    setLastSelectedIndex(null);
  }, [toggleSelectedMode]);

  const toggleProjectSelection = useCallback(
    (clientId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = financeProjects.slice(start, end + 1).map((p) => p.id);
        setSelectedFinanceProjects((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedFinanceProjects((prev) =>
          prev.includes(clientId)
            ? prev.filter((id) => id !== clientId)
            : [...prev, clientId]
        );
        setLastSelectedIndex(index);
      }
    },
    [financeProjects, lastSelectedIndex]
  );

  const toggleAllProjects = useCallback(() => {
    if (selectedFinanceProjects.length > 0) {
      setSelectedFinanceProjects([]);
    } else {
      setSelectedFinanceProjects(financeProjects.map((c) => c.id));
    }
  }, [financeProjects, selectedFinanceProjects]);

  const onDelete = (ids: string[]) => {
    console.log(ids);
  };

  return (
    <Stack align="center">
      <Stack w="100%" maw={800}>
        <Group justify="space-between" w="100%" maw={800} px="md">
          <Box w={20} />
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
          <SelectActionIcon
            disabled={isFetching || financeProjects.length === 0}
            tooltipLabel={
              locale === "de-DE"
                ? "Aktiviere Mehrfachauswahl"
                : "Activate bulk select"
            }
            filled={selectedModeActive}
            selected={selectedModeActive}
            onClick={handleToggleSelectedMode}
          />
        </Group>
        <Stack w="100%" align="center">
          <Collapse in={selectedModeActive} w="100%">
            <Group justify="space-between" w="100%">
              <Group onClick={toggleAllProjects} style={{ cursor: "pointer" }}>
                <SelectActionIcon
                  onClick={() => {}}
                  selected={
                    selectedFinanceProjects.length === financeProjects.length
                  }
                  partiallySelected={
                    selectedFinanceProjects.length > 0 &&
                    selectedFinanceProjects.length < financeProjects.length
                  }
                />
                <Text fz="sm" c="dimmed">
                  {locale === "de-DE" ? "Alle" : "All"}
                </Text>
              </Group>
              <PayoutActionIcon
                disabled={selectedFinanceProjects.length === 0}
                onClick={() => onDelete(selectedFinanceProjects)}
              />
              <DeleteActionIcon
                disabled={selectedFinanceProjects.length === 0}
                onClick={() => onDelete(selectedFinanceProjects)}
              />
            </Group>
          </Collapse>
          {financeProjects.map((project, index) => (
            <FinanceProjectCard
              key={project.id}
              project={project}
              selectedModeActive={selectedModeActive}
              isSelected={selectedFinanceProjects.includes(project.id)}
              onToggleSelected={(e) =>
                toggleProjectSelection(project.id, index, e.shiftKey)
              }
              onDelete={onDelete}
            />
          ))}
        </Stack>
        <FinanceProjectFormModal
          opened={addProjectModalOpened}
          onClose={closeAddProjectModal}
        />
      </Stack>
    </Stack>
  );
}

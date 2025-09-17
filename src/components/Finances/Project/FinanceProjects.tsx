"use client";

import { useCallback, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Stack,
  Text,
  Divider,
} from "@mantine/core";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import FinanceProjectFormModal from "./FinanceProjectFormModal";
import FinanceProjectCard from "./FinanceProjectCard";
import { IconMoneybagPlus } from "@tabler/icons-react";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import FinanceProjectNavbar from "./FinanceProjectNavbar";
import { formatDate } from "@/utils/formatFunctions";
import { isToday } from "date-fns";
import {
  FinanceNavbarItems,
  FinanceProjectNavbarTab,
} from "@/types/finance.types";

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
  const [tab, setTab] = useState<FinanceProjectNavbarTab>(
    FinanceProjectNavbarTab.All
  );

  const navbarItems = useMemo<FinanceNavbarItems>(() => {
    const items: FinanceNavbarItems = {
      all: { totalAmount: 0, projectCount: 0 },
      upcoming: { totalAmount: 0, projectCount: 0 },
      overdue: { totalAmount: 0, projectCount: 0 },
      paid: { totalAmount: 0, projectCount: 0 },
    };

    // All
    const totalAmount = financeProjects.reduce((acc, project) => {
      return (
        acc +
        project.adjustments.reduce((acc, adjustment) => {
          return acc + adjustment.amount;
        }, project.start_amount)
      );
    }, 0);
    items.all = { totalAmount, projectCount: financeProjects.length };

    // Upcoming
    const upcomingFilteredProjects = financeProjects.filter((project) => {
      return (
        (project.due_date && project.due_date > new Date().toISOString()) ||
        !project.due_date ||
        isToday(new Date(project.due_date))
      );
    });
    const upcomingTotalAmount = upcomingFilteredProjects.reduce(
      (acc, project) => {
        return (
          acc +
          project.adjustments.reduce((acc, adjustment) => {
            return acc + adjustment.amount;
          }, project.start_amount)
        );
      },
      0
    );
    items.upcoming = {
      totalAmount: upcomingTotalAmount,
      projectCount: upcomingFilteredProjects.length,
    };

    // Overdue
    const overdueFilteredProjects = financeProjects.filter((project) => {
      return (
        project.due_date &&
        project.due_date < new Date().toISOString() &&
        !isToday(new Date(project.due_date))
      );
    });

    const overdueTotalAmount = overdueFilteredProjects.reduce(
      (acc, project) => {
        return (
          acc +
          project.adjustments.reduce((acc, adjustment) => {
            return acc + adjustment.amount;
          }, project.start_amount)
        );
      },
      0
    );
    items.overdue = {
      totalAmount: overdueTotalAmount,
      projectCount: overdueFilteredProjects.length,
    };

    // Paid
    const paidFilteredProjects = financeProjects.filter((project) => {
      return project.paid;
    });

    const paidTotalAmount = paidFilteredProjects.reduce((acc, project) => {
      return (
        acc +
        project.adjustments.reduce((acc, adjustment) => {
          return acc + adjustment.amount;
        }, project.start_amount)
      );
    }, 0);
    items.paid = {
      totalAmount: paidTotalAmount,
      projectCount: paidFilteredProjects.length,
    };

    return items;
  }, [financeProjects]);

  const sortedFinanceProjects = useMemo(() => {
    return [...financeProjects].sort((a, b) => {
      const aHasDueDate = Boolean(a.due_date);
      const bHasDueDate = Boolean(b.due_date);
      const aIsOverdue =
        a.due_date &&
        a.due_date < new Date().toISOString() &&
        !isToday(new Date(a.due_date));
      const bIsOverdue =
        b.due_date &&
        b.due_date < new Date().toISOString() &&
        !isToday(new Date(b.due_date));

      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;

      if (!aHasDueDate && bHasDueDate) return -1; // nulls first
      if (aHasDueDate && !bHasDueDate) return 1; // dated after nulls
      if (!aHasDueDate && !bHasDueDate) return 0; // both null

      return (
        new Date(a.due_date as string).getTime() -
        new Date(b.due_date as string).getTime()
      );
    });
  }, [financeProjects]);

  const filteredFinanceProjects = useMemo(() => {
    return sortedFinanceProjects.filter((project) => {
      if (tab === FinanceProjectNavbarTab.All) return true;
      if (tab === FinanceProjectNavbarTab.Upcoming)
        return (
          (project.due_date && project.due_date > new Date().toISOString()) ||
          !project.due_date ||
          isToday(new Date(project.due_date))
        );
      if (tab === FinanceProjectNavbarTab.Overdue)
        return (
          project.due_date &&
          project.due_date < new Date().toISOString() &&
          !isToday(new Date(project.due_date))
        );
      if (tab === FinanceProjectNavbarTab.Paid) return project.paid;
    });
  }, [sortedFinanceProjects, tab]);

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
      setSelectedFinanceProjects(filteredFinanceProjects.map((c) => c.id));
    }
  }, [filteredFinanceProjects, selectedFinanceProjects]);

  const onDelete = (ids: string[]) => {
    console.log(ids);
  };

  return (
    <Group align="flex-start" w="100%" wrap="nowrap" mb="xl">
      <FinanceProjectNavbar tab={tab} setTab={setTab} items={navbarItems} />
      <Stack w="100%" maw={900}>
        <Group justify="space-between" w="100%" px="md">
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
            disabled={isFetching || filteredFinanceProjects.length === 0}
            tooltipLabel={
              locale === "de-DE"
                ? "Aktiviere Mehrfachauswahl"
                : "Activate bulk select"
            }
            mainControl
            selected={selectedModeActive}
            onClick={handleToggleSelectedMode}
          />
        </Group>
        <Stack gap={0}>
          <Collapse in={selectedModeActive} w="100%">
            <Group justify="space-between" w="100%" mb="sm">
              <Group onClick={toggleAllProjects} style={{ cursor: "pointer" }}>
                <SelectActionIcon
                  onClick={() => {}}
                  selected={
                    selectedFinanceProjects.length ===
                    filteredFinanceProjects.length
                  }
                  partiallySelected={
                    selectedFinanceProjects.length > 0 &&
                    selectedFinanceProjects.length <
                      filteredFinanceProjects.length
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
          <Stack w="100%" align="center">
            {filteredFinanceProjects.map((project, index) => {
              const isOverdue =
                project.due_date &&
                project.due_date < new Date().toISOString() &&
                !isToday(new Date(project.due_date));
              const noDueDate = !project.due_date;
              return (
                <Stack key={project.id} w="100%">
                  {filteredFinanceProjects[index - 1]?.due_date !==
                    project.due_date && (
                    <Divider
                      size="md"
                      label={
                        <Text
                          size="sm"
                          fw={500}
                          c={
                            isOverdue
                              ? "red"
                              : noDueDate
                                ? "yellow"
                                : "light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))"
                          }
                        >
                          {project.due_date
                            ? formatDate(new Date(project.due_date), locale)
                            : locale === "de-DE"
                              ? "Kein Fälligkeitsdatum"
                              : "No due date"}
                        </Text>
                      }
                      labelPosition="left"
                    />
                  )}
                  <Box ml="xl">
                    <FinanceProjectCard
                      project={project}
                      selectedModeActive={selectedModeActive}
                      isSelected={selectedFinanceProjects.includes(project.id)}
                      onToggleSelected={(e) =>
                        toggleProjectSelection(project.id, index, e.shiftKey)
                      }
                      onDelete={onDelete}
                    />
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
        <FinanceProjectFormModal
          opened={addProjectModalOpened}
          onClose={closeAddProjectModal}
        />
      </Stack>
    </Group>
  );
}

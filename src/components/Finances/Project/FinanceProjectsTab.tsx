"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
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
  Button,
  Badge,
  ThemeIcon,
  Card,
} from "@mantine/core";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import FinanceProjectFormModal from "./FinanceProjectModal";
import FinanceProjectCard from "./FinanceProjectCard";
import {
  IconMoneybagPlus,
  IconFilter,
  IconRefresh,
  IconCalendar,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import FinanceProjectNavbar from "./FinanceProjectNavbar";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { isToday } from "date-fns";
import {
  FinanceNavbarItems,
  FinanceProject,
  FinanceProjectNavbarTab,
} from "@/types/finance.types";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
  showDeleteConfirmationModal,
} from "@/utils/notificationFunctions";
import EditFinanceProjectDrawer from "./EditFinanceProjectDrawer";

export default function FinanceProjectTab() {
  const { financeProjects, isFetching, deleteFinanceProjects } =
    useFinanceStore();
  const { locale } = useSettingsStore();

  const getLocalizedText = (de: string, en: string) => {
    return locale === "de-DE" ? de : en;
  };
  const [selectedFinanceProjects, setSelectedFinanceProjects] = useState<
    string[]
  >([]);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);
  const [
    addProjectModalOpened,
    { close: closeAddProjectModal, toggle: toggleAddProjectModal },
  ] = useDisclosure(false);
  const [
    editProjectModalOpened,
    { close: closeEditProjectModal, toggle: toggleEditProjectModal },
  ] = useDisclosure(false);
  const [editProject, setEditProject] = useState<FinanceProject | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [tab, setTab] = useState<FinanceProjectNavbarTab>(
    FinanceProjectNavbarTab.All
  );

  useEffect(() => {
    if (!editProject && financeProjects.length > 0) {
      setEditProject(financeProjects[0]);
    }
  }, [financeProjects]);

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
        const rangeIds = filteredFinanceProjects
          .slice(start, end + 1)
          .map((p) => p.id);
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
    const isSingle = ids.length === 1;
    showDeleteConfirmationModal(
      isSingle
        ? getLocalizedText("Finanzprojekt löschen", "Delete Finance Project")
        : getLocalizedText("Finanzprojekte löschen", "Delete Finance Projects"),
      isSingle
        ? getLocalizedText(
            "Sind Sie sicher, dass Sie dieses Finanzprojekt löschen möchten?",
            "Are you sure you want to delete this finance project?"
          )
        : getLocalizedText(
            "Sind Sie sicher, dass Sie diese Finanzprojekte löschen möchten?",
            "Are you sure you want to delete these finance projects?"
          ),
      async () => {
        const deleted = await deleteFinanceProjects(ids);
        if (deleted) {
          setSelectedFinanceProjects([]);
          showActionSuccessNotification(
            getLocalizedText(
              "Finanzprojekt erfolgreich gelöscht",
              "Finance project deleted successfully"
            ),
            locale
          );
        } else {
          showActionErrorNotification(
            getLocalizedText(
              "Finanzprojekt konnte nicht gelöscht werden",
              "Finance project could not be deleted"
            ),
            locale
          );
        }
      },
      locale
    );
  };

  return (
    <Group align="flex-start" w="100%" wrap="nowrap" mb="xl">
      <Stack w={200} miw={200} gap="md" pos="absolute">
        {/* Toolbar */}
        <Card p="sm" withBorder shadow="sm" radius="md" py={0}>
          <Group justify="space-between" align="center">
            <DelayedTooltip
              label={getLocalizedText("Aktualisieren", "Refresh")}
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                loading={isFetching}
              >
                <IconRefresh size={20} />
              </ActionIcon>
            </DelayedTooltip>

            <DelayedTooltip
              label={getLocalizedText(
                "Finanzprojekt hinzufügen",
                "Add Finance Project"
              )}
            >
              <ActionIcon
                onClick={toggleAddProjectModal}
                variant="subtle"
                size="lg"
              >
                <IconMoneybagPlus size={20} />
              </ActionIcon>
            </DelayedTooltip>

            <SelectActionIcon
              iconSize={20}
              disabled={isFetching || filteredFinanceProjects.length === 0}
              tooltipLabel={getLocalizedText(
                "Aktiviere Mehrfachauswahl",
                "Activate bulk select"
              )}
              mainControl
              selected={selectedModeActive}
              onClick={handleToggleSelectedMode}
            />
          </Group>
        </Card>
        <FinanceProjectNavbar tab={tab} setTab={setTab} items={navbarItems} />
        {/* Filter Statistics */}
        <Card p="md" withBorder shadow="sm" radius="md">
          <Stack>
            <Text size="sm" c="dimmed">
              {filteredFinanceProjects.length}{" "}
              {getLocalizedText("Projekte", "Projects")}
            </Text>
            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                {getLocalizedText("Gesamtbetrag", "Total Amount")}:{" "}
                {formatMoney(navbarItems.all.totalAmount, "EUR", locale)}
              </Text>
            </Group>
          </Stack>
        </Card>
      </Stack>
      <Stack maw={900} w="100%" ml={220}>
        <Stack gap={0}>
          {/* Bulk Selection */}
          <Collapse in={selectedModeActive} w="100%">
            <Card
              p="md"
              mb="md"
              withBorder
              shadow="sm"
              radius="md"
              style={{
                borderColor:
                  "light-dark(var(--mantine-color-blue-3), var(--mantine-color-blue-8))",
              }}
            >
              <Group justify="space-between" align="center">
                <Group
                  onClick={toggleAllProjects}
                  style={{ cursor: "pointer" }}
                >
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
                    {getLocalizedText("Alle auswählen", "Select All")}
                  </Text>
                </Group>

                <Badge color="blue" variant="light">
                  {selectedFinanceProjects.length}{" "}
                  {getLocalizedText("ausgewählt", "selected")}
                </Badge>

                <Group gap="xs">
                  <PayoutActionIcon
                    disabled={selectedFinanceProjects.length === 0}
                    onClick={() => console.log(selectedFinanceProjects)}
                  />
                  <DeleteActionIcon
                    disabled={selectedFinanceProjects.length === 0}
                    onClick={() => onDelete(selectedFinanceProjects)}
                  />
                </Group>
              </Group>
            </Card>
          </Collapse>
          {/* Projects */}
          <Stack w="100%" align="center">
            {filteredFinanceProjects.length > 0 ? (
              filteredFinanceProjects.map((project, index) => {
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
                          <Badge
                            variant="light"
                            color={
                              isOverdue ? "red" : noDueDate ? "yellow" : "gray"
                            }
                          >
                            {project.due_date
                              ? formatDate(new Date(project.due_date), locale)
                              : locale === "de-DE"
                                ? "Kein Fälligkeitsdatum"
                                : "No due date"}
                          </Badge>
                        }
                        labelPosition="left"
                      />
                    )}
                    <Box ml="xl">
                      <FinanceProjectCard
                        project={project}
                        selectedModeActive={selectedModeActive}
                        isSelected={selectedFinanceProjects.includes(
                          project.id
                        )}
                        onToggleSelected={(e) =>
                          toggleProjectSelection(project.id, index, e.shiftKey)
                        }
                        onDelete={() => onDelete([project.id])}
                        setEditProject={setEditProject}
                        onOpenEditProject={toggleEditProjectModal}
                      />
                    </Box>
                  </Stack>
                );
              })
            ) : (
              <Card p="xl" withBorder shadow="sm" radius="lg" ta="center">
                <Stack align="center" gap="md">
                  <ThemeIcon size="xl" color="gray" variant="light">
                    <IconCurrencyDollar size={32} />
                  </ThemeIcon>

                  <Box>
                    <Text size="lg" fw={600} c="dimmed" mb="xs">
                      {getLocalizedText(
                        "Keine Finanzprojekte gefunden",
                        "No finance projects found"
                      )}
                    </Text>
                    <Text size="sm" c="dimmed" maw={400}>
                      {getLocalizedText(
                        "Erstellen Sie Ihr erstes Finanzprojekt, um Ihre Einnahmen und Ausgaben zu verwalten.",
                        "Create your first finance project to manage your income and expenses."
                      )}
                    </Text>
                  </Box>

                  <Button
                    variant="filled"
                    size="lg"
                    leftSection={<IconMoneybagPlus size={18} />}
                    onClick={toggleAddProjectModal}
                  >
                    {getLocalizedText(
                      "Erstes Finanzprojekt hinzufügen",
                      "Add first finance project"
                    )}
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </Stack>
        <FinanceProjectFormModal
          opened={addProjectModalOpened}
          onClose={closeAddProjectModal}
        />
      </Stack>
      {editProject && (
        <EditFinanceProjectDrawer
          opened={editProjectModalOpened}
          onClose={closeEditProjectModal}
          financeProject={editProject}
        />
      )}
    </Group>
  );
}

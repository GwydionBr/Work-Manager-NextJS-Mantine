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
  Skeleton,
} from "@mantine/core";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import FinanceProjectFormModal from "./FinanceProjectModal";
import FinanceProjectCard from "./FinanceProjectCard";
import {
  IconMoneybagPlus,
  IconCurrencyDollar,
  IconList,
  IconCalendarEvent,
  IconSquareRoundedCheck,
} from "@tabler/icons-react";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
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
import FinancesNavbar from "../FinancesNavbar";
import { SettingsTab } from "@/components/Settings/SettingsModal";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";

export default function FinanceProjectTab() {
  const {
    financeProjects,
    isFetching,
    deleteFinanceProjects,
    financeClients,
    financeCategories,
  } = useFinanceStore();
  const { locale, setIsModalOpen, setSelectedTab, getLocalizedText } =
    useSettingsStore();

  // Bulk selection
  const [
    selectedModeActive,
    { toggle: toggleSelectedMode, close: closeSelectedMode },
  ] = useDisclosure(false);
  const [selectedFinanceProjects, setSelectedFinanceProjects] = useState<
    string[]
  >([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  // Add project
  const [
    addProjectModalOpened,
    { close: closeAddProjectModal, toggle: toggleAddProjectModal },
  ] = useDisclosure(false);

  // Edit project
  const [
    editProjectModalOpened,
    { close: closeEditProjectModal, toggle: toggleEditProjectModal },
  ] = useDisclosure(false);
  const [editProject, setEditProject] = useState<FinanceProject | null>(null);

  // Tab
  const [tab, setTab] = useState<FinanceProjectNavbarTab>(
    FinanceProjectNavbarTab.All
  );

  const formattedFinanceProjects = useMemo(() => {
    return financeProjects.map((project) => {
      const { categoryIds, ...rest } = project;
      return {
        ...rest,
        finance_client:
          financeClients.find(
            (client) => client.id === project.finance_client_id
          ) || null,
        categories: financeCategories.filter((category) =>
          categoryIds.includes(category.id)
        ),
      };
    });
  }, [financeProjects, financeClients, financeCategories]);

  useEffect(() => {
    if (formattedFinanceProjects.length === 0) {
      setTab(FinanceProjectNavbarTab.All);
      setSelectedFinanceProjects([]);
      closeSelectedMode();
    } else if (editProject === null) {
      setEditProject(formattedFinanceProjects[0]);
    }
  }, [formattedFinanceProjects]);

  const navbarItems = useMemo<FinanceNavbarItems>(() => {
    const items: FinanceNavbarItems = {
      all: { totalAmount: 0, projectCount: 0 },
      upcoming: { totalAmount: 0, projectCount: 0 },
      overdue: { totalAmount: 0, projectCount: 0 },
      paid: { totalAmount: 0, projectCount: 0 },
    };

    // All
    const totalAmount = formattedFinanceProjects.reduce((acc, project) => {
      return (
        acc +
        project.adjustments.reduce((acc, adjustment) => {
          return acc + adjustment.amount;
        }, project.start_amount)
      );
    }, 0);
    items.all = { totalAmount, projectCount: formattedFinanceProjects.length };

    // Upcoming
    const upcomingFilteredProjects = formattedFinanceProjects.filter(
      (project) => {
        return (
          (project.due_date && project.due_date > new Date().toISOString()) ||
          !project.due_date ||
          isToday(new Date(project.due_date))
        );
      }
    );
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
    const overdueFilteredProjects = formattedFinanceProjects.filter(
      (project) => {
        return (
          project.due_date &&
          project.due_date < new Date().toISOString() &&
          !isToday(new Date(project.due_date))
        );
      }
    );

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
    const paidFilteredProjects = formattedFinanceProjects.filter((project) => {
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
  }, [formattedFinanceProjects]);

  const sortedFinanceProjects = useMemo(() => {
    return [...formattedFinanceProjects].sort((a, b) => {
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
  }, [formattedFinanceProjects]);

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

  const handleToggleSelectedMode = () => {
    toggleSelectedMode();
    setSelectedFinanceProjects([]);
    setLastSelectedIndex(null);
  };

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
    [filteredFinanceProjects, lastSelectedIndex]
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

  const newNavbarItems = useMemo(() => {
    return [
      [
        {
          label: getLocalizedText("Alle", "All"),
          leftSection: (
            <ThemeIcon variant="transparent" color="gray">
              <IconList />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.All,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.all.totalAmount, "EUR", locale)} (
              {navbarItems.all.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.All),
          disabled: navbarItems.all.projectCount === 0,
        },
        {
          label: getLocalizedText("Bevorstehend", "Upcoming"),
          leftSection: (
            <ThemeIcon variant="transparent" color="blue">
              <IconCalendarEvent />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.Upcoming,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.upcoming.totalAmount, "EUR", locale)} (
              {navbarItems.upcoming.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.Upcoming),
          disabled: navbarItems.upcoming.projectCount === 0,
        },
        {
          label: getLocalizedText("Überfällig", "Overdue"),
          leftSection: (
            <ThemeIcon variant="transparent" color="red">
              <IconCalendarEvent />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.Overdue,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.overdue.totalAmount, "EUR", locale)} (
              {navbarItems.overdue.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.Overdue),
          disabled: navbarItems.overdue.projectCount === 0,
        },
      ],
      [
        {
          label: getLocalizedText("Bezahlt", "Paid"),
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconSquareRoundedCheck />
            </ThemeIcon>
          ),
          active: tab === FinanceProjectNavbarTab.Paid,
          description: (
            <Text size="sm">
              {formatMoney(navbarItems.paid.totalAmount, "EUR", locale)} (
              {navbarItems.paid.projectCount})
            </Text>
          ),
          onClick: () => setTab(FinanceProjectNavbarTab.Paid),
          disabled: navbarItems.paid.projectCount === 0,
        },
      ],
    ];
  }, [locale, navbarItems, filteredFinanceProjects, tab]);

  return (
    <Group align="flex-start" w="100%" wrap="nowrap" mb="xl">
      <FinancesNavbar
        top={
          <Group justify="space-between" align="center">
            <AdjustmentActionIcon
              size="lg"
              variant="transparent"
              tooltipLabel={getLocalizedText(
                "Finanzeinstellungen anpassen",
                "Adjust finance settings"
              )}
              iconSize={20}
              onClick={() => {
                setIsModalOpen(true);
                setSelectedTab(SettingsTab.FINANCE);
              }}
            />

            <DelayedTooltip
              label={getLocalizedText(
                "Finanzprojekt hinzufügen",
                "Add Finance Project"
              )}
            >
              <ActionIcon
                onClick={toggleAddProjectModal}
                variant="transparent"
                size="lg"
              >
                <IconMoneybagPlus size={20} />
              </ActionIcon>
            </DelayedTooltip>

            <SelectActionIcon
              iconSize={20}
              disabled={isFetching || filteredFinanceProjects.length === 0}
              tooltipLabel={
                selectedModeActive
                  ? getLocalizedText(
                      "Deaktiviere Mehrfachauswahl",
                      "Deactivate bulk select"
                    )
                  : getLocalizedText(
                      "Aktiviere Mehrfachauswahl",
                      "Activate bulk select"
                    )
              }
              mainControl
              selected={selectedModeActive}
              onClick={handleToggleSelectedMode}
            />
          </Group>
        }
        isNavbar
        navbarItems={newNavbarItems}
        bottom={
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
        }
      />
      <Stack w="100%" ml={220} align="center">
        <Stack gap={0} w="100%">
          {/* Bulk Selection */}
          <Collapse
            in={selectedModeActive && filteredFinanceProjects.length > 0}
            w="100%"
          >
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
            {isFetching ? (
              Array.from({ length: 5 }, (_, i) => (
                <Skeleton height={65} w="100%" key={i} />
              ))
            ) : filteredFinanceProjects.length > 0 ? (
              filteredFinanceProjects.map((project, index) => {
                const isOverdue =
                  project.due_date &&
                  project.due_date < new Date().toISOString() &&
                  !isToday(new Date(project.due_date));
                const noDueDate = !project.due_date;
                return (
                  <Stack key={project.id} w="100%" gap={5}>
                    {filteredFinanceProjects[index - 1]?.due_date !==
                      project.due_date && (
                      <Divider
                        size="md"
                        label={
                          <Badge
                            variant="light"
                            color={
                              isOverdue ? "red" : noDueDate ? "yellow" : "teal"
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
                        editProjectModalOpened={editProjectModalOpened}
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

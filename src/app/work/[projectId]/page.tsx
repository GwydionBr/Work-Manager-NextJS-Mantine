"use client";

import { useWorkProjectByIdQuery } from "@/utils/queries/work/use-work-project";
import { useParams } from "next/navigation";

import { useState, useCallback, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useProjectFiltering } from "@/hooks/useProjectFiltering";
import { useSettingsStore } from "@/stores/settingsStore";
import { usePayoutHourlyTimerProjectMutation } from "@/utils/queries/finances/use-payout";
import { useWorkStore } from "@/stores/workManagerStore";

import {
  Box,
  Collapse,
  Group,
  Loader,
  Stack,
  Text,
  Grid,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import EditProjectDrawer from "@/components/Work/Project/EditProjectDrawer";
import Header from "@/components/Header/Header";
import WorkAnalysis from "@/components/Work/Analysis/WorkAnalysis";
import AnalysisActionIcon from "@/components/UI/ActionIcons/AnalysisActionIcon";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import FilterActionIcon from "@/components/UI/ActionIcons/FilterActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import SessionHierarchy from "@/components/Work/Session/SessionHirarchy/SessionHierarchy";
import ProjectFilter from "@/components/Work/Project/ProjectFilter";

import { formatMoney } from "@/utils/formatFunctions";
import { groupSessions } from "@/utils/sessionHelperFunctions";
import HourlyPayoutCard from "@/components/Finances/Payout/HourlyPayout/HourlyPayoutCard";
import ProjectPayoutCard from "@/components/Finances/Payout/ProjectPayout/ProjectPayoutCard";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import NewSessionModal from "@/components/Work/Session/NewSessionModal";
import SessionSelector from "@/components/Work/Session/SessionSelector";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import { IconClockPlus } from "@tabler/icons-react";

import { formatDate } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";
import { WorkTimeEntry } from "@/types/work.types";

export default function WorkProjectDetailsPage() {
  const { projectId } = useParams();
  const { setActiveProjectId } = useWorkStore();

  const { data: activeProject } = useWorkProjectByIdQuery({
    projectId: projectId as string,
  });

  useEffect(() => {
    if (activeProject?.id) {
      setActiveProjectId(activeProject.id);
    }
  }, [activeProject?.id]);

  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const {
    mutate: payoutHourlyTimerProjectMutation,
    isPending: isProcessingPayout,
  } = usePayoutHourlyTimerProjectMutation({
    onSuccess: () => {
      setSelectedTimeEntryIds([]);
      deactivateSelectedMode();
    },
  });

  const { locale, getLocalizedText } = useSettingsStore();

  // State for filter time span
  const [filterTimeSpan, setFilterTimeSpan] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [selectedTimeEntryIds, setSelectedTimeEntryIds] = useState<string[]>(
    []
  );
  const [analysisOpened, { open: openAnalysis, close: closeAnalysis }] =
    useDisclosure(false);
  const [
    editProjectOpened,
    { open: openEditProject, close: closeEditProject },
  ] = useDisclosure(false);
  const [filterOpened, { open: openFilter, close: closeFilter }] =
    useDisclosure(false);
  const [payoutOpened, { open: openPayout, close: closePayout }] =
    useDisclosure(false);
  const [
    selectedModeActive,
    {
      close: deactivateSelectedMode,
      toggle: toggleSelectedMode,
      open: activateSelectedMode,
    },
  ] = useDisclosure(false);

  const [
    sessionFormOpened,
    { open: openSessionForm, close: closeSessionForm },
  ] = useDisclosure(false);

  // Use the custom hook for filtering logic
  const { timeFilteredTimeEntries } = useProjectFiltering(
    activeProject?.timeEntries ?? [],
    filterTimeSpan
  );

  const toggleAllTimeEntries = useCallback(() => {
    if (selectedTimeEntryIds.length > 0) {
      setSelectedTimeEntryIds([]);
    } else {
      setSelectedTimeEntryIds(
        timeFilteredTimeEntries
          .filter((timeEntry) => !timeEntry.single_cash_flow_id)
          .map((timeEntry) => timeEntry.id)
      );
    }
  }, [selectedTimeEntryIds.length, timeFilteredTimeEntries]);

  const selectAllTimeEntries = useCallback(() => {
    activateSelectedMode();
    setSelectedTimeEntryIds(
      timeFilteredTimeEntries
        .filter((timeEntry) => !timeEntry.single_cash_flow_id)
        .map((timeEntry) => timeEntry.id)
    );
  }, [timeFilteredTimeEntries]);

  const toggleGroupSelection = useCallback(
    (timeEntryIds: string[]) => {
      const groupIds = timeEntryIds.filter((id) =>
        timeFilteredTimeEntries.some(
          (timeEntry) => timeEntry.id === id && !timeEntry.single_cash_flow_id
        )
      );
      const isAnySelected = groupIds.some((id) =>
        selectedTimeEntryIds.includes(id)
      );
      if (isAnySelected) {
        setSelectedTimeEntryIds((prev) =>
          prev.filter((id) => !groupIds.includes(id))
        );
      } else {
        setSelectedTimeEntryIds((prev) =>
          Array.from(new Set([...prev, ...groupIds]))
        );
      }
    },
    [timeFilteredTimeEntries, selectedTimeEntryIds]
  );

  const toggleTimeEntrySelection = useCallback(
    (timeEntryId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = timeFilteredTimeEntries
          .slice(start, end + 1)
          .filter((timeEntry) => !timeEntry.single_cash_flow_id)
          .map((timeEntry) => timeEntry.id);
        setSelectedTimeEntryIds((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedTimeEntryIds((prev) =>
          prev.includes(timeEntryId)
            ? prev.filter((id) => id !== timeEntryId)
            : [...prev, timeEntryId]
        );
        setLastSelectedIndex(index);
      }
    },
    [timeFilteredTimeEntries, lastSelectedIndex]
  );

  if (!activeProject) {
    return (
      <Stack align="center" w="100%" px="xl">
        <Header
          headerTitle={locale === "de-DE" ? "Arbeitsmanager" : "Work Manager"}
        />
        <Loader />
      </Stack>
    );
  }

  const salary = formatMoney(
    activeProject.salary,
    activeProject.currency,
    locale
  );

  // Calculate total active seconds from all sessions
  const totalActiveSeconds = activeProject.timeEntries.reduce(
    (total, timeEntry) => total + timeEntry.active_seconds,
    0
  );

  const hourlySalary = formatMoney(
    activeProject.hourly_payment
      ? activeProject.salary
      : totalActiveSeconds > 0
        ? (activeProject.salary / totalActiveSeconds) * 3600
        : 0,
    activeProject.currency,
    locale
  );

  const handlePayoutToggle = () => {
    if (!payoutOpened) {
      openPayout();
      closeFilter();
    } else {
      closePayout();
    }
  };

  const handleFilterToggle = () => {
    if (!filterOpened) {
      openFilter();
      closePayout();
    } else {
      closeFilter();
    }
  };

  const handleSelectionToggle = () => {
    if (selectedModeActive) {
      setSelectedTimeEntryIds([]);
    }
    toggleSelectedMode();
  };

  async function handleSessionPayout(timeEntries: WorkTimeEntry[]) {
    if (isProcessingPayout || !activeProject) return;
    const { timeEntries: _, ...projectData } = activeProject;
    const title = `${getLocalizedText("Auszahlung", "Payout")} (${activeProject.title}) ${formatDate(new Date(), locale)}`;
    payoutHourlyTimerProjectMutation({
      project: projectData,
      title,
      timeEntries,
    });
  }

  const selectableSessions = timeFilteredTimeEntries.filter(
    (timeEntry) => !timeEntry.single_cash_flow_id
  );

  const isPayoutAvailable = activeProject.hourly_payment
    ? timeFilteredTimeEntries.reduce(
        (acc, timeEntry) =>
          acc + timeEntry.salary * (timeEntry.active_seconds / 3600),
        0
      ) > 0
    : activeProject.salary > activeProject.total_payout;

  return (
    <ScrollArea h="100vh" type="scroll">
      <Stack align="center" w="100%" px="xl">
        <Collapse in={!analysisOpened} transitionDuration={300} w="100%">
          <Header
            headerTitle={activeProject.title}
            leftSalary={
              activeProject.hourly_payment
                ? undefined
                : activeProject.salary === 0
                  ? "Hobby"
                  : salary
            }
            rightSalary={activeProject.salary === 0 ? undefined : hourlySalary}
            description={activeProject.description ?? undefined}
            rightButton={
              <Group>
                {activeProject.timeEntries.length > 0 && (
                  <AnalysisActionIcon
                    onClick={openAnalysis}
                    tooltipLabel={getLocalizedText("Analyse", "Analysis")}
                  />
                )}
                <EditActionIcon
                  onClick={openEditProject}
                  tooltipLabel={getLocalizedText(
                    "Projekt bearbeiten",
                    "Edit Project"
                  )}
                />
              </Group>
            }
          />
          <Stack
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              left: 0,
              borderBottom:
                "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))",
            }}
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
            w="100%"
            gap="xs"
          >
            <Group justify="space-between" p="xs" pb={5}>
              <Group>
                <FilterActionIcon
                  disabled={timeFilteredTimeEntries.length === 0}
                  onClick={handleFilterToggle}
                  tooltipLabel={getLocalizedText("Filter", "Filter")}
                  activeFilter={
                    filterTimeSpan[0] && filterTimeSpan[1] ? true : false
                  }
                  opened={filterOpened}
                />
                <PayoutActionIcon
                  onClick={handlePayoutToggle}
                  tooltipLabel={getLocalizedText("Auszahlung", "Payout")}
                  disabled={!isPayoutAvailable}
                  opened={payoutOpened}
                />
              </Group>
              <DelayedTooltip
                label={getLocalizedText("Sitzung hinzufügen", "Add Session")}
              >
                <ActionIcon
                  onClick={openSessionForm}
                  size="md"
                  variant="subtle"
                >
                  <IconClockPlus />
                </ActionIcon>
              </DelayedTooltip>
              <NewSessionModal
                opened={sessionFormOpened}
                onClose={closeSessionForm}
                project={activeProject}
              />
              <SelectActionIcon
                disabled={selectableSessions.length === 0}
                onClick={handleSelectionToggle}
                tooltipLabel={
                  selectedModeActive
                    ? getLocalizedText(
                        "Auswahlmodus deaktivieren",
                        "Deactivate selection mode"
                      )
                    : getLocalizedText(
                        "Auswahlmodus aktivieren",
                        "Activate selection mode"
                      )
                }
                size="md"
                selected={selectedModeActive}
                mainControl={true}
              />
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <Collapse in={filterOpened}>
                  <ProjectFilter
                    timeSpan={filterTimeSpan}
                    onTimeSpanChange={setFilterTimeSpan}
                    sessions={timeFilteredTimeEntries}
                    project={activeProject}
                    isProcessingPayout={isProcessingPayout}
                    onSelectAll={selectAllTimeEntries}
                    handleSessionPayoutClick={handleSessionPayout}
                  />
                </Collapse>
                <Collapse in={payoutOpened}>
                  <Group>
                    {activeProject.hourly_payment ? (
                      <HourlyPayoutCard
                        project={activeProject}
                        handlePayoutClick={handleSessionPayout}
                        isProcessing={isProcessingPayout}
                      />
                    ) : (
                      <ProjectPayoutCard project={activeProject} />
                    )}
                  </Group>
                </Collapse>
              </Grid.Col>
              <Grid.Col span={6}>
                <Collapse in={selectedModeActive}>
                  <SessionSelector
                    selectedSessions={selectedTimeEntryIds}
                    timeFilteredSessions={timeFilteredTimeEntries}
                    toggleAllSessions={toggleAllTimeEntries}
                    handleSessionPayoutClick={handleSessionPayout}
                  />
                </Collapse>
              </Grid.Col>
            </Grid>
          </Stack>
          {activeProject?.timeEntries.length > 0 ? (
            <Box w="100%">
              {/* Session Hierarchy */}
              {timeFilteredTimeEntries.length > 0 ? (
                <SessionHierarchy
                  selectedModeActive={selectedModeActive}
                  groupedSessions={groupSessions(
                    timeFilteredTimeEntries.sort(
                      (a, b) =>
                        new Date(b.start_time).getTime() -
                        new Date(a.start_time).getTime()
                    ),
                    locale
                  )}
                  selectedSessions={selectedTimeEntryIds}
                  onSessionToggle={toggleTimeEntrySelection}
                  onGroupToggle={toggleGroupSelection}
                  selectableIdSet={
                    new Set(
                      timeFilteredTimeEntries
                        .filter((timeEntry) => !timeEntry.single_cash_flow_id)
                        .map((timeEntry) => timeEntry.id)
                    )
                  }
                  project={activeProject}
                  isOverview={false}
                />
              ) : (
                <Text size="lg" c="gray" ta="center">
                  {getLocalizedText(
                    "Keine Sitzungen im ausgewählten Zeitraum",
                    "No time entries in the time period"
                  )}
                </Text>
              )}
            </Box>
          ) : (
            <Text size="lg" c="gray" ta="center" mt="xl">
              {getLocalizedText(
                "Füge eine Sitzung hinzu, um sie hier zu sehen",
                "Add a time entry to see it here"
              )}
            </Text>
          )}
          <EditProjectDrawer
            opened={editProjectOpened}
            onClose={closeEditProject}
          />
        </Collapse>
        <Collapse in={analysisOpened} w="100%">
          <WorkAnalysis
            sessions={activeProject.timeEntries}
            isOverview={false}
            project={activeProject}
            onClose={() => closeAnalysis()}
          />
        </Collapse>
      </Stack>
    </ScrollArea>
  );
}

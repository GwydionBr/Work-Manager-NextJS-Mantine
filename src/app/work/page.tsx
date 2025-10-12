"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useProjectFiltering } from "@/hooks/useProjectFiltering";
import { useSettingsStore } from "@/stores/settingsStore";

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
import { TimerProject } from "@/types/work.types";
import { usePayoutHourlyTimerProjectMutation } from "@/utils/queries/finances/use-payout";
import { useTimerProjectQuery } from "@/utils/queries/work/use_timer_project";

export default function WorkPage() {
  const [oldActiveProjectId, setOldActiveProjectId] = useState<string | null>(
    null
  );
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const { data: projects = [] } = useTimerProjectQuery();
  const {
    activeProjectId,
    lastActiveProjectId,
    isFetching,
    setActiveProjectId,
  } = useWorkStore();
  const {
    mutate: payoutHourlyTimerProjectMutation,
    isPending: isProcessingPayout,
  } = usePayoutHourlyTimerProjectMutation(() => {
    setSelectedSessions([]);
    deactivateSelectedMode();
  });

  const { locale, getLocalizedText } = useSettingsStore();

  // Use memo to get the active project
  const activeProject: TimerProject | undefined = useMemo(() => {
    let project = projects.find((p) => p.id === activeProjectId);
    if (!project) {
      project = projects.find((p) => p.id === lastActiveProjectId);
    }
    return project;
  }, [projects, activeProjectId]);

  // State for filter time span
  const [filterTimeSpan, setFilterTimeSpan] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
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
  const { timeFilteredSessions } = useProjectFiltering(
    activeProject?.sessions ?? [],
    filterTimeSpan
  );

  const toggleAllSessions = useCallback(() => {
    if (selectedSessions.length > 0) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(
        timeFilteredSessions
          .filter((session) => !session.single_cash_flow_id)
          .map((session) => session.id)
      );
    }
  }, [selectedSessions.length, timeFilteredSessions]);

  const selectAllSessions = useCallback(() => {
    activateSelectedMode();
    setSelectedSessions(
      timeFilteredSessions
        .filter((session) => !session.single_cash_flow_id)
        .map((session) => session.id)
    );
  }, [timeFilteredSessions]);

  const toggleGroupSelection = useCallback(
    (sessionIds: string[]) => {
      const groupIds = sessionIds.filter((id) =>
        timeFilteredSessions.some((s) => s.id === id && !s.single_cash_flow_id)
      );
      const isAnySelected = groupIds.some((id) =>
        selectedSessions.includes(id)
      );
      if (isAnySelected) {
        setSelectedSessions((prev) =>
          prev.filter((id) => !groupIds.includes(id))
        );
      } else {
        setSelectedSessions((prev) =>
          Array.from(new Set([...prev, ...groupIds]))
        );
      }
    },
    [timeFilteredSessions, selectedSessions]
  );

  const toggleSessionSelection = useCallback(
    (sessionId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = timeFilteredSessions
          .slice(start, end + 1)
          .filter((session) => !session.single_cash_flow_id)
          .map((session) => session.id);
        setSelectedSessions((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedSessions((prev) =>
          prev.includes(sessionId)
            ? prev.filter((id) => id !== sessionId)
            : [...prev, sessionId]
        );
        setLastSelectedIndex(index);
      }
    },
    [timeFilteredSessions, lastSelectedIndex]
  );

  useEffect(() => {
    if (oldActiveProjectId !== activeProjectId) {
      setFilterTimeSpan([null, null]);
      closeFilter();
      closePayout();
      closeAnalysis();
      deactivateSelectedMode();
      setSelectedSessions([]);
      setOldActiveProjectId(activeProjectId);
    }
  }, [activeProjectId, oldActiveProjectId]);

  useEffect(() => {
    if (!activeProjectId && lastActiveProjectId) {
      setActiveProjectId(lastActiveProjectId);
    }
  }, [activeProjectId, lastActiveProjectId, setActiveProjectId]);

  if (!activeProject || isFetching) {
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
  const totalActiveSeconds = activeProject.sessions.reduce(
    (total, session) => total + session.active_seconds,
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
      setSelectedSessions([]);
    }
    toggleSelectedMode();
  };

  async function handleSessionPayout(sessions: Tables<"timer_session">[]) {
    if (isProcessingPayout || !activeProject) return;
    const selectedSessionIds = sessions.map((session) => session.id);

    const title = `${getLocalizedText("Auszahlung", "Payout")} (${activeProject.title}) ${formatDate(new Date(), locale)}`;
    payoutHourlyTimerProjectMutation({
      project: activeProject, 
      title,
      sessionIds: selectedSessionIds,
    });
  }

  const selectableSessions = timeFilteredSessions.filter(
    (session) => !session.single_cash_flow_id
  );

  const isPayoutAvailable = activeProject.hourly_payment
    ? timeFilteredSessions.reduce(
        (acc, session) =>
          acc + session.salary * (session.active_seconds / 3600),
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
            rightSalary={
              activeProject.salary === 0 ? undefined : hourlySalary
            }
            description={activeProject.description ?? undefined}
            rightButton={
              <Group>
                {activeProject.sessions.length > 0 && (
                  <AnalysisActionIcon
                    onClick={openAnalysis}
                    tooltipLabel={locale === "de-DE" ? "Analyse" : "Analysis"}
                  />
                )}
                <EditActionIcon
                  onClick={openEditProject}
                  tooltipLabel={
                    locale === "de-DE" ? "Projekt bearbeiten" : "Edit Project"
                  }
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
                  disabled={timeFilteredSessions.length === 0}
                  onClick={handleFilterToggle}
                  tooltipLabel={locale === "de-DE" ? "Filter" : "Filter"}
                  activeFilter={
                    filterTimeSpan[0] && filterTimeSpan[1] ? true : false
                  }
                  opened={filterOpened}
                />
                <PayoutActionIcon
                  onClick={handlePayoutToggle}
                  tooltipLabel={locale === "de-DE" ? "Auszahlung" : "Payout"}
                  disabled={!isPayoutAvailable}
                  opened={payoutOpened}
                />
              </Group>
              <DelayedTooltip
                label={
                  locale === "de-DE" ? "Sitzung hinzufügen" : "Add Session"
                }
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
                    ? locale === "de-DE"
                      ? "Auswahlmodus deaktivieren"
                      : "Deactivate selection mode"
                    : locale === "de-DE"
                      ? "Auswahlmodus aktivieren"
                      : "Activate selection mode"
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
                    sessions={timeFilteredSessions}
                    project={activeProject}
                    isProcessingPayout={isProcessingPayout}
                    onSelectAll={selectAllSessions}
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
                    selectedSessions={selectedSessions}
                    timeFilteredSessions={timeFilteredSessions}
                    toggleAllSessions={toggleAllSessions}
                    handleSessionPayoutClick={handleSessionPayout}
                  />
                </Collapse>
              </Grid.Col>
            </Grid>
          </Stack>
          {activeProject?.sessions.length > 0 ? (
            <Box w="100%">
              {/* Session Hierarchy */}
              {timeFilteredSessions.length > 0 ? (
                <SessionHierarchy
                  selectedModeActive={selectedModeActive}
                  groupedSessions={groupSessions(
                    timeFilteredSessions.sort(
                      (a, b) =>
                        new Date(b.start_time).getTime() -
                        new Date(a.start_time).getTime()
                    ),
                    locale
                  )}
                  selectedSessions={selectedSessions}
                  onSessionToggle={toggleSessionSelection}
                  onGroupToggle={toggleGroupSelection}
                  selectableIdSet={
                    new Set(
                      timeFilteredSessions
                        .filter((s) => !s.single_cash_flow_id)
                        .map((s) => s.id)
                    )
                  }
                  project={activeProject}
                  isOverview={false}
                />
              ) : (
                <Text size="lg" c="gray" ta="center">
                  {locale === "de-DE"
                    ? "Keine Sitzungen im ausgewählten Zeitraum"
                    : "No Sessions in the time period"}
                </Text>
              )}
            </Box>
          ) : (
            <Text size="lg" c="gray" ta="center" mt="xl">
              {locale === "de-DE"
                ? "Füge eine Sitzung hinzu, um sie hier zu sehen"
                : "Add a session to see it here"}
            </Text>
          )}
          <EditProjectDrawer
            opened={editProjectOpened}
            onClose={closeEditProject}
          />
        </Collapse>
        <Collapse in={analysisOpened} w="100%">
          <WorkAnalysis
            sessions={activeProject.sessions}
            isOverview={false}
            project={activeProject}
            onClose={() => closeAnalysis()}
          />
        </Collapse>
      </Stack>
    </ScrollArea>
  );
}

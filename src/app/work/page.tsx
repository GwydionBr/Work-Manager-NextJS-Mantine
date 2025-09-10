"use client";

import { useEffect, useState, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useProjectFiltering } from "@/hooks/useProjectFiltering";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Box,
  Collapse,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Grid,
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
import NewHourlyPayoutCard from "@/components/Payout/NewHourlyPayoutCard";
import NewProjectPayoutCard from "@/components/Payout/NewProjectPayoutCard";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import NewSessFormModal from "@/components/Work/Session/SessionFormModal";
import AddActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";

export default function WorkPage() {
  const [oldActiveProjectId, setOldActiveProjectId] = useState<string | null>(
    null
  );
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const {
    activeProjectId,
    lastActiveProjectId,
    isFetching,
    setActiveProjectId,
  } = useWorkStore();
  const { locale } = useSettingsStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => {
      if (activeProjectId) {
        return p.project.id === activeProjectId;
      }
      if (lastActiveProjectId) {
        return p.project.id === lastActiveProjectId;
      }
      return false;
    })
  );
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
          .filter((session) => !session.payed)
          .map((session) => session.id)
      );
    }
  }, [selectedSessions.length, timeFilteredSessions]);

  const selectAllSessions = useCallback(() => {
    activateSelectedMode();
    setSelectedSessions(
      timeFilteredSessions
        .filter((session) => !session.payed)
        .map((session) => session.id)
    );
  }, [timeFilteredSessions]);

  const toggleGroupSelection = useCallback(
    (sessionIds: string[]) => {
      const groupIds = sessionIds.filter((id) =>
        timeFilteredSessions.some((s) => s.id === id && !s.payed)
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
          .filter((session) => !session.payed)
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
    activeProject.project.salary,
    activeProject.project.currency,
    locale
  );

  // Calculate total active seconds from all sessions
  const totalActiveSeconds = activeProject.sessions.reduce(
    (total, session) => total + session.active_seconds,
    0
  );

  const hourlySalary = formatMoney(
    activeProject.project.hourly_payment
      ? activeProject.project.salary
      : totalActiveSeconds > 0
        ? (activeProject.project.salary / totalActiveSeconds) * 3600
        : 0,
    activeProject.project.currency,
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

  const selectableSessions = timeFilteredSessions.filter(
    (session) => !session.payed
  );

  const isPayoutAvailable = activeProject.project.hourly_payment
    ? timeFilteredSessions.reduce(
        (acc, session) =>
          acc + session.salary * (session.active_seconds / 3600),
        0
      ) > 0
    : activeProject.project.salary > activeProject.project.total_payout;

  return (
    <Stack align="center" w="100%" px="xl">
      <Collapse in={!analysisOpened} transitionDuration={300} w="100%">
        <Header
          headerTitle={activeProject.project.title}
          leftSalary={
            activeProject.project.hourly_payment
              ? undefined
              : activeProject.project.salary === 0
                ? "Hobby"
                : salary
          }
          rightSalary={
            activeProject.project.salary === 0 ? undefined : hourlySalary
          }
          description={activeProject.project.description ?? undefined}
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
          bg="var(--mantine-color-body)"
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
            <NewSessFormModal button={<AddActionIcon onClick={() => {}} />} />
            <SelectActionIcon
              disabled={selectableSessions.length === 0}
              onClick={handleSelectionToggle}
              tooltipLabel={
                locale === "de-DE" ? "Auswahlmodus" : "Selected Mode"
              }
              size="md"
              selected={selectedModeActive}
              filled={selectedModeActive}
            />
          </Group>
          <Grid>
            <Grid.Col span={6}>
              <Collapse in={filterOpened}>
                <ProjectFilter
                  timeSpan={filterTimeSpan}
                  onTimeSpanChange={setFilterTimeSpan}
                  sessions={timeFilteredSessions}
                  project={activeProject.project}
                  openPayout={handlePayoutToggle}
                  onSelectAll={selectAllSessions}
                />
              </Collapse>
              <Collapse in={payoutOpened}>
                <Group>
                  {activeProject.project.hourly_payment ? (
                    <NewHourlyPayoutCard project={activeProject} />
                  ) : (
                    <NewProjectPayoutCard project={activeProject.project} />
                  )}
                </Group>
              </Collapse>
            </Grid.Col>
            <Grid.Col span={6}>
              <Collapse in={selectedModeActive}>
                <Group justify="flex-end" pb="xs">
                  <Group
                    onClick={toggleAllSessions}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <SelectActionIcon
                      onClick={() => {}}
                      selected={
                        selectedSessions.length ===
                        timeFilteredSessions.filter((session) => !session.payed)
                          .length
                      }
                      partiallySelected={
                        selectedSessions.length > 0 &&
                        selectedSessions.length <
                          timeFilteredSessions.filter(
                            (session) => !session.payed
                          ).length
                      }
                    />

                    <Text fz="sm" c="dimmed">
                      {locale === "de-DE" ? "Alle" : "All"}
                    </Text>
                  </Group>
                  <Divider orientation="vertical" />
                  <Text size="xs" c="dimmed">
                    {selectedSessions.length} /{" "}
                    {
                      timeFilteredSessions.filter((session) => !session.payed)
                        .length
                    }{" "}
                    {locale === "de-DE" ? "Sitzungen" : "Sessions"}
                  </Text>
                </Group>
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
                      .filter((s) => !s.payed)
                      .map((s) => s.id)
                  )
                }
                project={activeProject.project}
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
          <Text size="lg" c="gray" ta="center">
            {locale === "de-DE"
              ? "Fügen Sie eine Sitzung hinzu, um sie hier zu sehen"
              : "Add as Session to see it here"}
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
          project={activeProject.project}
          onClose={() => closeAnalysis()}
        />
      </Collapse>
    </Stack>
  );
}

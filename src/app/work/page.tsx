"use client";

import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useProjectFiltering } from "@/hooks/useProjectFiltering";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Collapse, Group, Loader, Stack, Text } from "@mantine/core";
import NewSessionButton from "@/components/Work/Session/NewSessionButton";
import EditProjectDrawer from "@/components/Work/Project/EditProjectDrawer";
import Header from "@/components/Header/Header";
import WorkAnalysis from "@/components/Work/Analysis/WorkAnalysis";
import AnalysisActionIcon from "@/components/UI/ActionIcons/AnalysisActionIcon";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import FilterActionIcon from "@/components/UI/ActionIcons/FilterActionIcon";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import SessionHierarchy from "@/components/Work/Session/SessionHierarchy";
import SessionFilter from "@/components/Work/Session/SessionFilter";

import { formatMoney } from "@/utils/formatFunctions";
import PayoutCard from "@/components/Payout/PayoutCard";
import { groupSessions } from "@/utils/sessionHelperFunctions";

export default function WorkPage() {
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
  // Use the custom hook for filtering logic
  const {
    timeFilteredSessions,
  } = useProjectFiltering(
    activeProject?.sessions ?? [],
    filterTimeSpan,
  );

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

  const handleSessionToggle = (sessionId: string) => {
    if (!activeProject.project.hourly_payment) return;
    setSelectedSessions(
      selectedSessions.includes(sessionId)
        ? selectedSessions.filter((id) => id !== sessionId)
        : [...selectedSessions, sessionId]
    );
  };

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
                  tooltipLabel="Analyse"
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
          style={{ position: "sticky", top: 0, zIndex: 10, left: 0 }}
          bg="var(--mantine-color-body)"
          w="100%"
          gap="xs"
        >
          <Group justify="space-between" p="xs">
            <FilterActionIcon
              onClick={handleFilterToggle}
              tooltipLabel={locale === "de-DE" ? "Filter" : "Filter"}
              filled={filterOpened}
            />
            <NewSessionButton />
            <PayoutActionIcon
              onClick={handlePayoutToggle}
              tooltipLabel={locale === "de-DE" ? "Auszahlung" : "Payout"}
            />
          </Group>
          {/* Bulk Selection Controls */}
          {activeProject.project.hourly_payment && (
            <Collapse in={filterOpened}>
              <SessionFilter
                timeSpan={filterTimeSpan}
                onTimeSpanChange={setFilterTimeSpan}
              />
            </Collapse>
          )}
          <Collapse in={payoutOpened}>
            <Group justify="flex-end">
              <PayoutCard
                opened={payoutOpened}
                sessions={timeFilteredSessions}
                project={activeProject.project}
                selectedSessions={selectedSessions}
                onSessionsChange={setSelectedSessions}
              />
            </Group>
          </Collapse>
        </Stack>
        {activeProject?.sessions.length > 0 ? (
          <Box w="100%">
            {/* Session Hierarchy */}
            {timeFilteredSessions.length > 0 ? (
              <SessionHierarchy
                groupedSessions={groupSessions(timeFilteredSessions, locale)}
                selectedSessions={selectedSessions}
                onSessionToggle={handleSessionToggle}
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

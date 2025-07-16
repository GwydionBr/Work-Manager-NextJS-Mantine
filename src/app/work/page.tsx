"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSessionFiltering } from "@/hooks/useSessionFiltering";

import { Box, Collapse, Group, Loader, Stack, Text } from "@mantine/core";
import NewSessionButton from "@/components/Work/Session/NewSessionButton";
import EditProjectButton from "@/components/Work/Project/EditProjectButton";
import Header from "@/components/Header/Header";

import { formatMoney, getCurrencySymbol } from "@/utils/workHelperFunctions";
import PayoutMenu from "@/components/Work/Project/PayoutMenu";
import SessionHierarchy from "@/components/Work/Session/SessionHierarchy";
import BulkSelectionControls from "@/components/Work/Session/BulkSelectionControls";
import { groupSessions } from "@/utils/sessionHelperFunctions";
import WorkAnalysis from "@/components/Work/WorkAnalysis";
import AnalysisActionIcon from "@/components/UI/Buttons/AnalysisActionIcon";

export default function WorkPage() {
  const { activeProjectId, isFetching } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [analysisOpened, setAnalysisOpened] = useState(false);

  // Use the custom hook for filtering logic
  const {
    timePresets,
    selectedTimePreset,
    timeFilterDays,
    filteredSessions,
    unpaidSessions,
    handleTimePresetChange,
    handleCustomDaysChange,
    handleSetDaysForPreset,
  } = useSessionFiltering(
    activeProject?.sessions ?? [],
    undefined,
    undefined,
    false
  );

  if (!activeProject || isFetching) {
    return (
      <Stack align="center" w="100%" px="xl">
        <Header headerTitle="Work Manager" />
        <Loader />
      </Stack>
    );
  }

  const salary = formatMoney(
    activeProject.project.salary,
    getCurrencySymbol(activeProject.project.currency)
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
    getCurrencySymbol(activeProject.project.currency)
  );

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
        secondaryButton={<NewSessionButton />}
        rightButton={
          <Group>
            <AnalysisActionIcon
              onClick={() => setAnalysisOpened((state) => !state)}
            />
            <EditProjectButton />
          </Group>
        }
        leftButton={
          <PayoutMenu
            sessions={unpaidSessions}
            project={activeProject.project}
            selectedSessions={selectedSessions}
            onSessionsChange={setSelectedSessions}
          />
        }
      />
      {activeProject?.sessions.length > 0 ? (
        <Box w="100%">
          <Collapse in={analysisOpened} transitionDuration={500}>
            <WorkAnalysis
              sessions={activeProject.sessions}
              isOverview={false}
              project={activeProject.project}
            />
          </Collapse>
          {/* Bulk Selection Controls */}
          {activeProject.project.hourly_payment && (
            <BulkSelectionControls
              unpaidSessions={unpaidSessions}
              selectedSessions={selectedSessions}
              onSessionsChange={setSelectedSessions}
              isOverview={false}
              timePresets={timePresets}
              selectedTimePreset={selectedTimePreset}
              timeFilterDays={timeFilterDays}
              onTimePresetChange={handleTimePresetChange}
              onCustomDaysChange={handleCustomDaysChange}
              onSetDaysForPreset={handleSetDaysForPreset}
            />
          )}

          {/* Session Hierarchy */}
          {filteredSessions.length > 0 ? (
            <SessionHierarchy
              groupedSessions={groupSessions(filteredSessions)}
              selectedSessions={selectedSessions}
              onSessionToggle={handleSessionToggle}
              project={activeProject.project}
              isOverview={false}
            />
          ) : (
            <Text size="lg" c="gray" ta="center">
              No Sessions in the time period
            </Text>
          )}
        </Box>
      ) : (
        <Text size="lg" c="gray" ta="center">
          Add as Session to see it here
        </Text>
      )}
    </Stack>
  );
}

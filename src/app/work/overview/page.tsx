"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSessionFiltering } from "@/hooks/useSessionFiltering";

import { Box, Collapse, Group, Stack, Text } from "@mantine/core";
import Header from "@/components/Header/Header";
import PayoutMenu from "@/components/Payout/PayoutMenu";
import SessionHierarchy from "@/components/Work/Session/SessionHierarchy";
import { groupSessions } from "@/utils/sessionHelperFunctions";
import BulkSelectionControls from "@/components/Work/Session/BulkSelectionControls";
import WorkAnalysis from "@/components/Work/Analysis/WorkAnalysis";
import AnalysisActionIcon from "@/components/UI/ActionIcons/AnalysisActionIcon";
import CalendarActionIcon from "@/components/UI/ActionIcons/CalendarActionIcon";

export default function WorkOverviewPage() {
  const { projects: timerProjects, folders, timerSessions } = useWorkStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [analysisOpened, setAnalysisOpened] = useState(false);

  const projects = timerProjects.map((project) => project.project);

  // Use the custom hook for filtering logic with all new filter functionality
  const {
    timePresets,
    selectedTimePreset,
    timeFilterDays,
    filteredSessions,
    unpaidSessions,
    filterState,
    handleTimePresetChange,
    handleCustomDaysChange,
    handleSetDaysForPreset,
    handleProjectFilterChange,
    handleFolderFilterChange,
    handleCategoryFilterChange,
    handleFilterLogicChange,
    clearAllFilters,
  } = useSessionFiltering(timerSessions, projects, folders, true);

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(
      selectedSessions.includes(sessionId)
        ? selectedSessions.filter((id) => id !== sessionId)
        : [...selectedSessions, sessionId]
    );
  };

  return (
    <Stack align="center" w="100%" px="xl">
      <Header
        headerTitle="Work Overview"
        leftButton={
          <PayoutMenu
            sessions={unpaidSessions}
            projects={projects}
            selectedSessions={selectedSessions}
            onSessionsChange={setSelectedSessions}
            isOverview={true}
          />
        }
        rightButton={
          <Group>
            <AnalysisActionIcon
              onClick={() => setAnalysisOpened((state) => !state)}
            />
          </Group>
        }
      />
      {timerSessions.length > 0 ? (
        <Box w="100%">
          <Collapse in={analysisOpened} transitionDuration={500}>
            <WorkAnalysis sessions={filteredSessions} isOverview={true} />
          </Collapse>
          <BulkSelectionControls
            unpaidSessions={unpaidSessions}
            selectedSessions={selectedSessions}
            onSessionsChange={setSelectedSessions}
            isOverview={true}
            folders={folders}
            projects={projects}
            timePresets={timePresets}
            selectedTimePreset={selectedTimePreset}
            timeFilterDays={timeFilterDays}
            onTimePresetChange={handleTimePresetChange}
            onCustomDaysChange={handleCustomDaysChange}
            onSetDaysForPreset={handleSetDaysForPreset}
            filterState={filterState}
            onProjectFilterChange={handleProjectFilterChange}
            onFolderFilterChange={handleFolderFilterChange}
            onCategoryFilterChange={handleCategoryFilterChange}
            onFilterLogicChange={handleFilterLogicChange}
            onClearAllFilters={clearAllFilters}
          />
          {/* Session Hierarchy */}
          {filteredSessions.length > 0 ? (
            <SessionHierarchy
              groupedSessions={groupSessions(filteredSessions)}
              selectedSessions={selectedSessions}
              onSessionToggle={handleSessionToggle}
              projects={projects}
              isOverview={true}
            />
          ) : (
            <Text size="lg" c="gray" ta="center">
              No Sessions in the time period
            </Text>
          )}
        </Box>
      ) : (
        <Text size="lg" c="gray" ta="center">
          Add a Session to see it here
        </Text>
      )}
    </Stack>
  );
}

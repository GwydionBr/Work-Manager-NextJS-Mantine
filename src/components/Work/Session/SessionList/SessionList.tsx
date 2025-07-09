"use client";

import { ScrollArea, Text } from "@mantine/core";
import BulkSelectionControls from "./BulkSelectionControls";
import SessionHierarchy from "./SessionHierarchy";
import { groupSessions } from "@/utils/sessionHelpers";
import { useSessionFiltering } from "../../../../hooks/useSessionFiltering";
import type { SessionListProps } from "@/types/timerSession.types";

export default function SessionList({
  sessions,
  projects,
  folders,
  selectedSessions,
  onSessionsChange,
  project,
  isOverview = false,
}: SessionListProps) {
  // Only show selection controls for hourly payment projects
  const showSelectionControls = project?.hourly_payment || isOverview;

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
  } = useSessionFiltering(sessions, projects, isOverview);

  const groupedSessions = groupSessions(sessions); // Use original sessions for display

  const handleSessionToggle = (sessionId: string) => {
    if (!showSelectionControls) return;
    onSessionsChange(
      selectedSessions.includes(sessionId)
        ? selectedSessions.filter((id) => id !== sessionId)
        : [...selectedSessions, sessionId]
    );
  };

  return (
    <ScrollArea w="100%" pb="xl">
      {groupedSessions.length === 0 ? (
        <Text size="lg" c="gray" ta="center">
          Add a Session to see it here
        </Text>
      ) : (
        <>
          {/* Bulk Selection Controls */}
          {showSelectionControls && (
            <BulkSelectionControls
              unpaidSessions={unpaidSessions}
              selectedSessions={selectedSessions}
              onSessionsChange={onSessionsChange}
              filteredSessions={filteredSessions}
              projects={projects}
              folders={folders}
              isOverview={isOverview}
              timePresets={timePresets}
              selectedTimePreset={selectedTimePreset}
              timeFilterDays={timeFilterDays}
              onTimePresetChange={handleTimePresetChange}
              onCustomDaysChange={handleCustomDaysChange}
              onSetDaysForPreset={handleSetDaysForPreset}
            />
          )}

          {/* Session Hierarchy */}
          <SessionHierarchy
            groupedSessions={groupedSessions}
            selectedSessions={selectedSessions}
            onSessionToggle={handleSessionToggle}
            project={project}
            projects={projects}
            isOverview={isOverview}
          />
        </>
      )}
    </ScrollArea>
  );
}

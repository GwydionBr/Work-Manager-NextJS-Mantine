"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useSessionFiltering } from "@/hooks/useSessionFiltering";

import { Box, Collapse, Group, Stack, Text } from "@mantine/core";
import Header from "@/components/Header/Header";
import PayoutMenu from "@/components/Payout/PayoutCard";
import SessionHierarchy from "@/components/Work/Session/SessionHierarchy";
import { groupSessions } from "@/utils/sessionHelperFunctions";
import SessionFilter from "@/components/Work/Session/BulkSelectionControl";
import WorkAnalysis from "@/components/Work/Analysis/WorkAnalysis";
import AnalysisActionIcon from "@/components/UI/ActionIcons/AnalysisActionIcon";
import FilterActionIcon from "@/components/UI/ActionIcons/FilterActionIcon";
import NewSessionButton from "@/components/Work/Session/NewSessionButton";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import PayoutCard from "@/components/Payout/PayoutCard";

export default function WorkOverviewPage() {
  const { projects: timerProjects, folders, timerSessions } = useWorkStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [analysisOpened, setAnalysisOpened] = useState(false);
  const [
    filterOpened,
    { open: openFilter, close: closeFilter, toggle: toggleFilter },
  ] = useDisclosure(false);
  const [
    payoutOpened,
    { open: openPayout, close: closePayout, toggle: togglePayout },
  ] = useDisclosure(false);
  const { locale } = useSettingsStore();
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
        headerTitle={locale === "de-DE" ? "Übersicht" : "Work Overview"}
        rightButton={
          <Group>
            <AnalysisActionIcon
              onClick={() => setAnalysisOpened((state) => !state)}
            />
          </Group>
        }
      />
      <Stack
        style={{ position: "sticky", top: 0, zIndex: 10, left: 0 }}
        bg="var(--mantine-color-body)"
        w="100%"
      >
        <Group justify="center" p="xs">
          {/* <FilterActionIcon
            onClick={toggleFilter}
            tooltipLabel={locale === "de-DE" ? "Filter" : "Filter"}
            filled={filterOpened}
          /> */}
          <NewSessionButton />
          {/* <PayoutActionIcon
            onClick={togglePayout}
            tooltipLabel={locale === "de-DE" ? "Auszahlung" : "Payout"}
          /> */}
        </Group>
        {/* Bulk Selection Controls */}
        {/* <Collapse in={filterOpened}>
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
        </Collapse>
        <Collapse in={payoutOpened} transitionDuration={500}>
          <Group justify="flex-end">
            <PayoutCard
              opened={payoutOpened}
              sessions={unpaidSessions}
              projects={projects}
              selectedSessions={selectedSessions}
              onSessionsChange={setSelectedSessions}
            />
          </Group>
        </Collapse> */}
      </Stack>
      {timerSessions.length > 0 ? (
        <Box w="100%">
          {/* <Collapse in={analysisOpened} transitionDuration={500}>
            <WorkAnalysis sessions={filteredSessions} isOverview={true} />
          </Collapse> */}
          {/* Session Hierarchy */}
          {filteredSessions.length > 0 ? (
            <SessionHierarchy
              groupedSessions={groupSessions(filteredSessions, locale)}
              selectedSessions={selectedSessions}
              onSessionToggle={handleSessionToggle}
              projects={projects}
              isOverview={true}
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
            : "Add a Session to see it here"}
        </Text>
      )}
    </Stack>
  );
}

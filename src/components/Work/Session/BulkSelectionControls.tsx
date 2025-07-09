"use client";

import { useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Group,
  Text,
  Checkbox,
  Stack,
  Button,
  Select,
  Divider,
  Slider,
  Badge,
  Collapse,
  Indicator,
} from "@mantine/core";
import FilterActionIcon from "@/components/UI/Buttons/FilterActionIcon";

import type { Tables } from "@/types/db.types";
import type { TimePreset } from "@/types/timerSession.types";

const Radius = 20;

interface BulkSelectionControlsProps {
  unpaidSessions: Tables<"timerSession">[];
  selectedSessions: string[];
  onSessionsChange: (sessions: string[]) => void;
  filteredSessions: Tables<"timerSession">[];
  projects?: Tables<"timerProject">[];
  folders?: Tables<"timer_project_folder">[];
  isOverview: boolean;
  timePresets: TimePreset[];
  selectedTimePreset: string | null;
  timeFilterDays: number;
  onTimePresetChange: (preset: string | null) => void;
  onCustomDaysChange: (days: number) => void;
  onSetDaysForPreset?: (days: number) => void;
}

export default function BulkSelectionControls({
  unpaidSessions,
  selectedSessions,
  onSessionsChange,
  filteredSessions,
  projects,
  folders,
  isOverview,
  timePresets,
  selectedTimePreset,
  timeFilterDays,
  onTimePresetChange,
  onCustomDaysChange,
  onSetDaysForPreset,
}: BulkSelectionControlsProps) {
  const { financeCategories } = useFinanceStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSelectAll = () => {
    if (selectedSessions.length === unpaidSessions.length) {
      onSessionsChange([]);
    } else {
      onSessionsChange(unpaidSessions.map((s) => s.id));
    }
  };

  const handleSelectByProject = (projectId: string | null) => {
    if (!projectId) return;

    const projectSessions = unpaidSessions.filter(
      (session) => session.project_id === projectId
    );
    const projectSessionIds = projectSessions.map((s) => s.id);

    const newSelectedSessions = selectedSessions.filter(
      (id) => !projectSessionIds.includes(id)
    );
    onSessionsChange([...newSelectedSessions, ...projectSessionIds]);
  };

  const handleSelectByFolder = (folderId: string | null) => {
    if (!folderId || !projects) return;

    const folderProjects = projects.filter(
      (project) => project.folder_id === folderId
    );
    const folderProjectIds = folderProjects.map((p) => p.id);
    const folderSessions = unpaidSessions.filter((session) =>
      folderProjectIds.includes(session.project_id)
    );
    const folderSessionIds = folderSessions.map((s) => s.id);

    const newSelectedSessions = selectedSessions.filter(
      (id) => !folderSessionIds.includes(id)
    );
    onSessionsChange([...newSelectedSessions, ...folderSessionIds]);
  };

  const handleSelectByCashFlowCategory = (
    cashFlowCategoryId: string | null
  ) => {
    if (!cashFlowCategoryId || !projects) return;

    const cashFlowCategoryProjects = projects.filter(
      (project) => project.cash_flow_category_id === cashFlowCategoryId
    );
    const cashFlowCategoryProjectIds = cashFlowCategoryProjects.map(
      (p) => p.id
    );
    const cashFlowCategorySessions = unpaidSessions.filter((session) =>
      cashFlowCategoryProjectIds.includes(session.project_id)
    );
    const cashFlowCategorySessionIds = cashFlowCategorySessions.map(
      (s) => s.id
    );

    const newSelectedSessions = selectedSessions.filter(
      (id) => !cashFlowCategorySessionIds.includes(id)
    );
    onSessionsChange([...newSelectedSessions, ...cashFlowCategorySessionIds]);
  };

  const handleTimePresetChange = (preset: string | null) => {
    onTimePresetChange(preset);
    if (preset && preset !== "custom") {
      const presetData = timePresets.find((p) => p.value === preset);
      if (presetData) {
        onSetDaysForPreset?.(presetData.days);
      }
    }
  };

  const handleCustomDaysChange = (days: number) => {
    onCustomDaysChange(days);
    onTimePresetChange("custom");
  };

  const handleSelectByTimePeriod = () => {
    if (!selectedTimePreset) return;

    const timePeriodSessions = filteredSessions.filter(
      (session) => !session.payed
    );
    const timePeriodSessionIds = timePeriodSessions.map((s) => s.id);

    const newSelectedSessions = selectedSessions.filter(
      (id) => !timePeriodSessionIds.includes(id)
    );
    onSessionsChange([...newSelectedSessions, ...timePeriodSessionIds]);
  };

  // Get unique categories and projects for selection dropdowns
  const getCategories = () => {
    if (!projects || !folders) return [];

    const categories = new Map<string, { id: string; title: string }>();

    // Get categories from projects that have folder_id
    projects.forEach((project) => {
      if (project.folder_id) {
        const folder = folders.find((f) => f.id === project.folder_id);
        if (folder) {
          categories.set(project.folder_id, {
            id: project.folder_id,
            title: folder.title,
          });
        }
      }
    });

    return Array.from(categories.values());
  };

  const getProjects = () => {
    if (!projects) return [];

    return projects.map((project) => ({
      value: project.id,
      label: project.title,
    }));
  };

  const getCashFlowCategories = () => {
    if (!financeCategories) return [];

    return financeCategories.map((category) => ({
      value: category.id,
      label: category.title,
    }));
  };

  return (
    <Stack
      mb="md"
      p="md"
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
      style={{ borderRadius: Radius }}
    >
      <Stack gap="xs" style={{ flex: 1 }}>
        <Group justify="space-between">
          <Group>
            <Checkbox
              label={`Select All (${unpaidSessions.length} unpaid sessions)`}
              checked={
                selectedSessions.length === unpaidSessions.length &&
                unpaidSessions.length > 0
              }
              indeterminate={
                selectedSessions.length > 0 &&
                selectedSessions.length < unpaidSessions.length
              }
              onChange={handleSelectAll}
              disabled={unpaidSessions.length === 0}
            />
            <Stack gap="xs" align="flex-end">
              {selectedSessions.length > 0 && (
                <Text size="sm" c="dimmed">
                  {selectedSessions.length} session
                  {selectedSessions.length > 1 ? "s" : ""} selected
                </Text>
              )}
              {unpaidSessions.length === 0 && (
                <Text size="sm" c="dimmed">
                  All sessions paid
                </Text>
              )}
            </Stack>
          </Group>
          <Indicator
            size={10}
            color="red"
            offset={4}
            position="top-end"
            disabled={
              selectedTimePreset === null || selectedTimePreset === "custom"
            }
          >
            {selectedTimePreset !== null ? (
              <FilterActionIcon
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                filled
              />
            ) : (
              <FilterActionIcon
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              />
            )}
          </Indicator>
        </Group>

        <Collapse in={isFilterOpen}>
          {/* Time Period Filtering for normal projects */}
          {!isOverview && (
            <>
              <Divider my="xs" />
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Select Sessions by Time Period
                </Text>
                <Group gap="md" align="flex-end">
                  <Select
                    label="Time Period"
                    placeholder="Select a time period"
                    data={timePresets.map((preset) => ({
                      value: preset.value,
                      label: preset.label,
                    }))}
                    value={selectedTimePreset}
                    onChange={handleTimePresetChange}
                    clearable
                    style={{ flex: 1 }}
                  />
                  {selectedTimePreset && (
                    <Button
                      size="sm"
                      onClick={handleSelectByTimePeriod}
                      variant="light"
                      disabled={unpaidSessions.length === 0}
                    >
                      Select {filteredSessions.filter((s) => !s.payed).length}{" "}
                      unpaid sessions
                    </Button>
                  )}
                </Group>
                {selectedTimePreset === "custom" && (
                  <Stack gap="xs">
                    <Text size="sm">Custom Days: {timeFilterDays}</Text>
                    <Slider
                      value={timeFilterDays}
                      onChange={handleCustomDaysChange}
                      min={1}
                      max={365}
                      mb="xl"
                      step={1}
                      marks={[
                        { value: 1, label: "1" },
                        { value: 7, label: "7" },
                        { value: 30, label: "30" },
                        { value: 90, label: "90" },
                        { value: 365, label: "365" },
                      ]}
                    />
                  </Stack>
                )}
                <Collapse in={selectedTimePreset !== null}>
                  <Badge
                    color={unpaidSessions.length > 0 ? "blue" : "red"}
                    variant="light"
                  >
                    {unpaidSessions.length} unpaid sessions in last{" "}
                    {timeFilterDays} days
                  </Badge>
                </Collapse>
              </Stack>
            </>
          )}

          {isOverview && projects && projects.length > 0 && (
            <>
              <Divider my="xs" />
              <Group gap="md" align="flex-end">
                <Select
                  label="Select by Folder"
                  placeholder="Choose a folder"
                  data={getCategories().map((cat) => ({
                    value: cat.id,
                    label: cat.title,
                  }))}
                  onChange={handleSelectByFolder}
                  clearable
                  style={{ flex: 1 }}
                />
                <Select
                  label="Select by Project"
                  placeholder="Choose a project"
                  data={getProjects()}
                  onChange={handleSelectByProject}
                  clearable
                  style={{ flex: 1 }}
                />
                <Select
                  label="Select by Category"
                  placeholder="Choose a category"
                  data={getCashFlowCategories()}
                  onChange={handleSelectByCashFlowCategory}
                  clearable
                  style={{ flex: 1 }}
                />
              </Group>
            </>
          )}
        </Collapse>
      </Stack>
    </Stack>
  );
}

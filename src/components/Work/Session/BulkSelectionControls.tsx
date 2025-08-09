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
  Tooltip,
  MultiSelect,
  Switch,
} from "@mantine/core";
import FilterActionIcon from "@/components/UI/ActionIcons/FilterActionIcon";

import type { Tables } from "@/types/db.types";
import type { TimePreset } from "@/types/timerSession.types";
import type { FilterLogic } from "@/hooks/useSessionFiltering";

const Radius = 20;

interface BulkSelectionControlsProps {
  unpaidSessions: Tables<"timer_session">[];
  selectedSessions: string[];
  onSessionsChange: (sessions: string[]) => void;
  projects?: Tables<"timer_project">[];
  folders?: Tables<"timer_project_folder">[];
  isOverview: boolean;
  timePresets: TimePreset[];
  selectedTimePreset: string | null;
  timeFilterDays: number;
  onTimePresetChange: (preset: string | null) => void;
  onCustomDaysChange: (days: number) => void;
  onSetDaysForPreset?: (days: number) => void;
  // New filter props
  filterState?: {
    selectedProjects: string[];
    selectedFolders: string[];
    selectedCategories: string[];
    filterLogic: FilterLogic;
  };
  onProjectFilterChange?: (projectIds: string[]) => void;
  onFolderFilterChange?: (folderIds: string[]) => void;
  onCategoryFilterChange?: (categoryIds: string[]) => void;
  onFilterLogicChange?: (logic: FilterLogic) => void;
  onClearAllFilters?: () => void;
}

/**
 * Bulk selection controls for timer sessions with filtering capabilities
 * Allows users to select multiple sessions by various criteria (project, folder, time period)
 */
export default function BulkSelectionControls({
  unpaidSessions,
  selectedSessions,
  onSessionsChange,
  projects,
  folders,
  isOverview,
  timePresets,
  selectedTimePreset,
  timeFilterDays,
  onTimePresetChange,
  onCustomDaysChange,
  onSetDaysForPreset,
  filterState,
  onProjectFilterChange,
  onFolderFilterChange,
  onCategoryFilterChange,
  onFilterLogicChange,
  onClearAllFilters,
}: BulkSelectionControlsProps) {
  const { financeCategories } = useFinanceStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Toggle between selecting all sessions or none
  const handleSelectAll = () => {
    if (selectedSessions.length === unpaidSessions.length) {
      onSessionsChange([]);
    } else {
      onSessionsChange(unpaidSessions.map((s) => s.id));
    }
  };

  // Handle time preset changes and update days accordingly
  const handleTimePresetChange = (preset: string | null) => {
    onSessionsChange([]);
    onTimePresetChange(preset);
    if (preset && preset !== "custom") {
      const presetData = timePresets.find((p) => p.value === preset);
      if (presetData) {
        onSetDaysForPreset?.(presetData.days);
      }
    }
  };

  // Update custom days and set preset to custom
  const handleCustomDaysChange = (days: number) => {
    onCustomDaysChange(days);
    onTimePresetChange("custom");
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

  const getFolders = () => {
    if (!folders) return [];

    return folders.map((folder) => ({
      value: folder.id,
      label: folder.title,
    }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedTimePreset !== null ||
    (filterState &&
      (filterState.selectedProjects.length > 0 ||
        filterState.selectedFolders.length > 0 ||
        filterState.selectedCategories.length > 0));

  // Check if multiple filters are active
  const hasMultipleFilters =
    (selectedTimePreset !== null ? 1 : 0) +
      ((filterState?.selectedProjects?.length || 0) > 0 ? 1 : 0) +
      ((filterState?.selectedFolders?.length || 0) > 0 ? 1 : 0) +
      ((filterState?.selectedCategories?.length || 0) > 0 ? 1 : 0) >
    1;

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
              {unpaidSessions.length > 0 && selectedSessions.length > 0 && (
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
          <Tooltip label="Filter Sessions" openDelay={500}>
            <Indicator
              size={10}
              color="red"
              offset={4}
              position="top-end"
              disabled={!hasActiveFilters}
            >
              <FilterActionIcon
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                filled={hasActiveFilters}
              />
            </Indicator>
          </Tooltip>
        </Group>

        <Collapse in={isFilterOpen}>
          {/* Time Period Filtering - now available in both modes */}
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
              {selectedTimePreset && !isOverview && (
                <Button size="sm" onClick={handleSelectAll} variant="light">
                  {selectedSessions.length === unpaidSessions.length
                    ? `Deselect all Sessions`
                    : `Select ${unpaidSessions.length} Unpaid Sessions`}
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
            <Collapse in={selectedTimePreset !== null && !isOverview}>
              <Badge
                color={unpaidSessions.length > 0 ? "blue" : "red"}
                variant="light"
              >
                {unpaidSessions.length} unpaid sessions in last {timeFilterDays}{" "}
                days
              </Badge>
            </Collapse>
          </Stack>

          {/* Project-based filtering for overview mode */}
          {isOverview && projects && projects.length > 0 && (
            <>
              <Divider my="xs" />
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Filter Sessions by Project Criteria
                </Text>

                {/* Filter Controls */}
                <Group gap="md" align="flex-end">
                  <MultiSelect
                    label="Filter by Folders"
                    placeholder="Choose folders"
                    data={getFolders()}
                    value={filterState?.selectedFolders || []}
                    onChange={onFolderFilterChange}
                    clearable
                    style={{ flex: 1 }}
                  />
                  <MultiSelect
                    label="Filter by Projects"
                    placeholder="Choose projects"
                    data={getProjects()}
                    value={filterState?.selectedProjects || []}
                    onChange={onProjectFilterChange}
                    clearable
                    style={{ flex: 1 }}
                  />
                  <MultiSelect
                    label="Filter by Categories"
                    placeholder="Choose categories"
                    data={getCashFlowCategories()}
                    value={filterState?.selectedCategories || []}
                    onChange={onCategoryFilterChange}
                    clearable
                    style={{ flex: 1 }}
                  />
                </Group>

                {/* Elegant AND/OR Logic Selection - only show when multiple filters are active */}
                <Collapse in={hasMultipleFilters || false}>
                  <Group gap="xs" align="center">
                    <Switch
                      size="sm"
                      checked={filterState?.filterLogic === "AND"}
                      onChange={(event) =>
                        onFilterLogicChange?.(
                          event.currentTarget.checked ? "AND" : "OR"
                        )
                      }
                      label={
                        <Text size="sm">
                          {filterState?.filterLogic === "AND"
                            ? "All filters must match (AND)"
                            : "Any filter can match (OR)"}
                        </Text>
                      }
                    />
                    <Text size="xs" c="dimmed">
                      {filterState?.filterLogic === "AND"
                        ? "Sessions must belong to ALL selected criteria"
                        : "Sessions can belong to ANY selected criteria"}
                    </Text>
                  </Group>
                </Collapse>
                <Collapse in={hasActiveFilters || false}>
                  <Stack align="center">
                    <Badge
                      mt="md"
                      color={unpaidSessions.length > 0 ? "blue" : "red"}
                      variant="light"
                    >
                      {unpaidSessions.length} unpaid sessions in last{" "}
                      {timeFilterDays} days
                    </Badge>
                  </Stack>
                </Collapse>

                {/* Clear Filters Button */}
                <Collapse in={hasActiveFilters || false}>
                  <Stack align="center">
                    <Stack mt="md" w="90%">
                      {isOverview && (
                        <Button
                          size="sm"
                          onClick={handleSelectAll}
                          variant="light"
                        >
                          {selectedSessions.length === unpaidSessions.length
                            ? `Deselect all Sessions`
                            : `Select ${unpaidSessions.length} Unpaid Sessions`}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="light"
                        color="red"
                        onClick={onClearAllFilters}
                      >
                        Clear All Filters
                      </Button>
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
            </>
          )}
        </Collapse>
      </Stack>
    </Stack>
  );
}

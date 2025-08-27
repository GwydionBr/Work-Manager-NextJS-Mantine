"use client";

import { useState, useMemo } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Tables } from "@/types/db.types";
import type { TimePreset } from "@/types/timerSession.types";

// Filter logic determines how multiple filters are combined
export type FilterLogic = "AND" | "OR";

// Unified state for all filters (time, projects, folders, categories)
export interface FilterState {
  // Time filter properties
  selectedTimePreset: string | null;
  timeFilterDays: number;

  // Project/folder/category filter properties
  selectedProjects: string[];
  selectedFolders: string[];
  selectedCategories: string[];
  filterLogic: FilterLogic;
}

/**
 * Hook for filtering timer sessions by time period, projects, folders, and categories
 * @param sessions - Array of timer sessions to filter
 * @param projects - Optional array of projects for project-based filtering
 * @param folders - Optional array of folders for folder-based filtering
 * @param isOverview - Whether we're in overview mode (affects unpaid session filtering)
 */
export function useSessionFiltering(
  sessions: Tables<"timer_session">[],
  projects?: Tables<"timer_project">[],
  folders?: Tables<"timer_project_folder">[],
  isOverview = false
) {
  const { locale } = useSettingsStore();

  // Unified filter state for all filters
  const [filterState, setFilterState] = useState<FilterState>({
    selectedTimePreset: null,
    timeFilterDays: 7,
    selectedProjects: [],
    selectedFolders: [],
    selectedCategories: [],
    filterLogic: "AND",
  });

  // Predefined time periods for quick filtering
  const timePresets = useMemo(
    (): TimePreset[] => [
      {
        value: "today",
        label: locale === "de-DE" ? "Heute" : "Today",
        days: 1,
      },
      {
        value: "yesterday",
        label: locale === "de-DE" ? "Gestern" : "Yesterday",
        days: 1,
      },
      {
        value: "last3days",
        label: locale === "de-DE" ? "Letzte 3 Tage" : "Last 3 days",
        days: 3,
      },
      {
        value: "last7days",
        label: locale === "de-DE" ? "Letzte 7 Tage" : "Last 7 days",
        days: 7,
      },
      {
        value: "last14days",
        label: locale === "de-DE" ? "Letzte 14 Tage" : "Last 14 days",
        days: 14,
      },
      {
        value: "last30days",
        label: locale === "de-DE" ? "Letzte 30 Tage" : "Last 30 days",
        days: 30,
      },
      {
        value: "last90days",
        label: locale === "de-DE" ? "Letzte 90 Tage" : "Last 90 days",
        days: 90,
      },
      {
        value: "custom",
        label: locale === "de-DE" ? "Benutzerdefiniert" : "Custom",
        days: filterState.timeFilterDays,
      },
    ],
    [filterState.timeFilterDays, locale]
  );

  /**
   * Filters sessions by selected time period
   * Returns all sessions if no time preset is selected
   */
  const getTimeFilteredSessions = () => {
    if (!filterState.selectedTimePreset) {
      return sessions;
    }

    const now = new Date();
    const preset = timePresets.find(
      (p) => p.value === filterState.selectedTimePreset
    );
    if (!preset) return sessions;

    let startDate: Date;
    let endDate: Date;

    // Calculate date range based on selected preset
    switch (filterState.selectedTimePreset) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "yesterday":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      default:
        // For custom and other periods, go back X days from today
        startDate = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
    }

    return sessions.filter((session) => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= startDate && sessionDate < endDate;
    });
  };

  /**
   * Main filtering function that combines time and project filters
   * Handles different scenarios based on active filters and filter logic
   */
  const getFilteredSessions = () => {
    // If no project filters are active, just return time-filtered sessions
    if (
      !isOverview ||
      (!filterState.selectedProjects.length &&
        !filterState.selectedFolders.length &&
        !filterState.selectedCategories.length)
    ) {
      return getTimeFilteredSessions();
    }

    // If no time filter is active, just filter by project criteria
    if (!filterState.selectedTimePreset) {
      return sessions.filter((session) => {
        const sessionProject = projects?.find(
          (p) => p.id === session.project_id
        );
        if (!sessionProject) return false;

        const conditions = [];

        // Project filter
        if (filterState.selectedProjects.length > 0) {
          conditions.push(
            filterState.selectedProjects.includes(session.project_id)
          );
        }

        // Folder filter
        if (filterState.selectedFolders.length > 0) {
          const folder = folders?.find(
            (f) => f.id === sessionProject.folder_id
          );
          conditions.push(
            folder && filterState.selectedFolders.includes(folder.id)
          );
        }

        // Category filter
        if (filterState.selectedCategories.length > 0) {
          conditions.push(
            filterState.selectedCategories.includes(
              sessionProject.cash_flow_category_id || ""
            )
          );
        }

        // If no conditions, include all sessions
        if (conditions.length === 0) return true;

        // Apply filter logic (AND: all conditions must be true, OR: at least one must be true)
        if (filterState.filterLogic === "AND") {
          return conditions.every(Boolean);
        } else {
          return conditions.some(Boolean);
        }
      });
    }

    // Both time and project filters are active - combine them based on logic
    const timeFilteredSessions = getTimeFilteredSessions();

    return sessions.filter((session) => {
      const sessionProject = projects?.find((p) => p.id === session.project_id);
      if (!sessionProject) return false;

      // Check if session matches time filter
      const matchesTimeFilter = timeFilteredSessions.some(
        (timeSession) => timeSession.id === session.id
      );

      // Check if session matches project filters
      const projectConditions = [];

      // Project filter
      if (filterState.selectedProjects.length > 0) {
        projectConditions.push(
          filterState.selectedProjects.includes(session.project_id)
        );
      }

      // Folder filter
      if (filterState.selectedFolders.length > 0) {
        const folder = folders?.find((f) => f.id === sessionProject.folder_id);
        projectConditions.push(
          folder && filterState.selectedFolders.includes(folder.id)
        );
      }

      // Category filter
      if (filterState.selectedCategories.length > 0) {
        projectConditions.push(
          filterState.selectedCategories.includes(
            sessionProject.cash_flow_category_id || ""
          )
        );
      }

      const matchesProjectFilter =
        projectConditions.length === 0
          ? true
          : filterState.filterLogic === "AND"
            ? projectConditions.every(Boolean)
            : projectConditions.some(Boolean);

      // Combine time and project filters based on logic
      if (filterState.filterLogic === "AND") {
        // AND: Must match both time AND project filters
        return matchesTimeFilter && matchesProjectFilter;
      } else {
        // OR: Must match either time OR project filters
        return matchesTimeFilter || matchesProjectFilter;
      }
    });
  };

  const filteredSessions = getFilteredSessions();

  /**
   * Filters out paid sessions for selection
   * In overview mode, checks project hourly_payment setting
   */
  const unpaidSessions = filteredSessions.filter((session) => {
    if (isOverview) {
      // In overview mode, we need to find the project for each session
      const sessionProject = projects?.find((p) => p.id === session.project_id);
      if (!sessionProject) return false;

      // For hourly payment projects, check if session is paid
      if (sessionProject.hourly_payment) {
        return !session.payed;
      }
      return false;
    }

    // Normal mode - just check session.payed
    return !session.payed;
  });

  // Time filter handlers
  const handleTimePresetChange = (preset: string | null) => {
    setFilterState((prev) => ({
      ...prev,
      selectedTimePreset: preset,
      ...(preset &&
        preset !== "custom" && {
          timeFilterDays:
            timePresets.find((p) => p.value === preset)?.days ||
            prev.timeFilterDays,
        }),
    }));
  };

  const handleCustomDaysChange = (days: number) => {
    setFilterState((prev) => ({
      ...prev,
      timeFilterDays: days,
      selectedTimePreset: "custom",
    }));
  };

  const handleSetDaysForPreset = (days: number) => {
    setFilterState((prev) => ({
      ...prev,
      timeFilterDays: days,
    }));
  };

  // Project/folder/category filter handlers
  const handleProjectFilterChange = (projectIds: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedProjects: projectIds }));
  };

  const handleFolderFilterChange = (folderIds: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedFolders: folderIds }));
  };

  const handleCategoryFilterChange = (categoryIds: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedCategories: categoryIds }));
  };

  const handleFilterLogicChange = (logic: FilterLogic) => {
    setFilterState((prev) => ({ ...prev, filterLogic: logic }));
  };

  // Reset all filters to default state
  const clearAllFilters = () => {
    setFilterState({
      selectedTimePreset: null,
      timeFilterDays: 7,
      selectedProjects: [],
      selectedFolders: [],
      selectedCategories: [],
      filterLogic: "AND",
    });
  };

  return {
    timePresets,
    selectedTimePreset: filterState.selectedTimePreset,
    timeFilterDays: filterState.timeFilterDays,
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
  };
}

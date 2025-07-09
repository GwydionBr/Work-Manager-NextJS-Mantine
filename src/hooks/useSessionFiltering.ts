import { useState, useMemo } from "react";
import type { Tables } from "@/types/db.types";
import type { TimePreset } from "@/types/timerSession.types";

export type FilterLogic = "AND" | "OR";

export interface FilterState {
  selectedProjects: string[];
  selectedFolders: string[];
  selectedCategories: string[];
  filterLogic: FilterLogic;
}

export function useSessionFiltering(
  sessions: Tables<"timerSession">[],
  projects?: Tables<"timerProject">[],
  folders?: Tables<"timer_project_folder">[],
  isOverview = false
) {
  const [timeFilterDays, setTimeFilterDays] = useState<number>(7);
  const [selectedTimePreset, setSelectedTimePreset] = useState<string | null>(
    null
  );

  // New filter state
  const [filterState, setFilterState] = useState<FilterState>({
    selectedProjects: [],
    selectedFolders: [],
    selectedCategories: [],
    filterLogic: "AND",
  });

  // Preset time periods
  const timePresets = useMemo(
    (): TimePreset[] => [
      { value: "today", label: "Today", days: 1 },
      { value: "yesterday", label: "Yesterday", days: 1 },
      { value: "last3days", label: "Last 3 days", days: 3 },
      { value: "last7days", label: "Last 7 days", days: 7 },
      { value: "last14days", label: "Last 14 days", days: 14 },
      { value: "last30days", label: "Last 30 days", days: 30 },
      { value: "last90days", label: "Last 90 days", days: 90 },
      {
        value: "custom",
        label: `Custom`,
        days: timeFilterDays,
      },
    ],
    [timeFilterDays]
  );

  // Filter sessions by time period
  const getTimeFilteredSessions = () => {
    if (!selectedTimePreset) {
      return sessions;
    }

    const now = new Date();
    const preset = timePresets.find((p) => p.value === selectedTimePreset);
    if (!preset) return sessions;

    let startDate: Date;
    let endDate: Date;

    switch (selectedTimePreset) {
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
      if (!session.start_time) return false;
      const sessionDate = new Date(session.start_time);
      return sessionDate >= startDate && sessionDate < endDate;
    });
  };

  // Filter sessions by project, folder, and category
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
    if (!selectedTimePreset) {
      return sessions.filter((session) => {
        const sessionProject = projects?.find((p) => p.id === session.project_id);
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
          const folder = folders?.find((f) => f.id === sessionProject.folder_id);
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

        if (conditions.length === 0) return true;

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

      const matchesProjectFilter = projectConditions.length === 0 
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

  // Filter out paid sessions for selection
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

  const handleTimePresetChange = (preset: string | null) => {
    setSelectedTimePreset(preset);
    if (preset && preset !== "custom") {
      const presetData = timePresets.find((p) => p.value === preset);
      if (presetData) {
        setTimeFilterDays(presetData.days);
      }
    }
  };

  const handleCustomDaysChange = (days: number) => {
    setTimeFilterDays(days);
    setSelectedTimePreset("custom");
  };

  const handleSetDaysForPreset = (days: number) => {
    setTimeFilterDays(days);
  };

  // Filter handlers
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

  const clearAllFilters = () => {
    setFilterState({
      selectedProjects: [],
      selectedFolders: [],
      selectedCategories: [],
      filterLogic: "AND",
    });
    setSelectedTimePreset(null);
  };

  return {
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
  };
}

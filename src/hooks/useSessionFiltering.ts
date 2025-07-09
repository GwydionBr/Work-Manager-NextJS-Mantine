import { useState, useMemo } from "react";
import type { Tables } from "@/types/db.types";
import type { TimePreset } from "@/types/timerSession.types";

export function useSessionFiltering(
  sessions: Tables<"timerSession">[],
  projects?: Tables<"timerProject">[],
  isOverview = false
) {
  const [timeFilterDays, setTimeFilterDays] = useState<number>(7);
  const [selectedTimePreset, setSelectedTimePreset] = useState<string | null>(
    null
  );

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
  const getFilteredSessions = () => {
    if (!selectedTimePreset || isOverview) {
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

  return {
    timePresets,
    selectedTimePreset,
    timeFilterDays,
    filteredSessions,
    unpaidSessions,
    handleTimePresetChange,
    handleCustomDaysChange,
    handleSetDaysForPreset,
  };
}

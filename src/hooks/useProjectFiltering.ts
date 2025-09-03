"use client";

import { startOfDay, endOfDay } from "date-fns";
import { Tables } from "@/types/db.types";

/**
 * Hook for filtering timer sessions by time period
 * @param sessions - Array of timer sessions to filter
 * @param timeSpan - Time span for the filter
 */
export function useProjectFiltering(
  sessions: Tables<"timer_session">[],
  timeSpan: [Date | null, Date | null]
) {
  /**
   * Filters sessions by selected time period
   * Returns all sessions if no time preset is selected
   */
  const getTimeFilteredSessions = () => {
    if (!timeSpan[0] || !timeSpan[1]) {
      return sessions;
    }
    console.log("timeSpan", timeSpan);

    let startDate = startOfDay(new Date(timeSpan[0]));
    let endDate = endOfDay(new Date(timeSpan[1]));

    return sessions.filter((session) => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  };

  const timeFilteredSessions = getTimeFilteredSessions();

  return {
    timeFilteredSessions,
  };
}

import { Tables, TablesInsert } from "@/types/db.types";

/**
 * Filters out existing sessions that overlap with the new session.
 * If there are no collisions, returns the new session as is.
 * If there are collisions, adjusts the session to fit the collisions.
 * @param existingSessions - Existing sessions
 * @param newSession - New session
 * @returns Adjusted session Array and overlapping sessions
 */
export function resolveSessionOverlaps(
  existingSessions: Tables<"timer_session">[],
  newSession: TablesInsert<"timer_session">
): {
  adjustedTimeSpans: TablesInsert<"timer_session">[] | null;
  overlappingSessions: Tables<"timer_session">[];
} {
  const newStart = new Date(newSession.start_time).getTime();
  const newEnd = new Date(newSession.end_time).getTime();

  // Finde alle kollidierenden Sessions
  const overlappingSessions = existingSessions.filter((existingSession) => {
    const existingStart = new Date(existingSession.start_time).getTime();
    const existingEnd = new Date(existingSession.end_time).getTime();
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (overlappingSessions.length === 0) {
    return {
      adjustedTimeSpans: [newSession],
      overlappingSessions,
    };
  }

  // Alle Zeitpunkte sammeln
  const timePoints: {
    time: number;
    type: "start" | "end";
    isNewSession: boolean;
  }[] = [
    { time: newStart, type: "start", isNewSession: true },
    { time: newEnd, type: "end", isNewSession: true },
  ];

  for (const overlappingSession of overlappingSessions) {
    const overlappingStart = new Date(overlappingSession.start_time).getTime();
    const overlappingEnd = new Date(overlappingSession.end_time).getTime();
    timePoints.push({
      time: overlappingStart,
      type: "start",
      isNewSession: false,
    });
    timePoints.push({ time: overlappingEnd, type: "end", isNewSession: false });
  }

  timePoints.sort((a, b) => a.time - b.time);

  // Jetzt Intervalle bauen
  const adjustedTimeSpans: TablesInsert<"timer_session">[] = [];
  let activeNew = false;
  let activeExisting = 0;

  for (let i = 0; i < timePoints.length - 1; i++) {
    const current = timePoints[i];
    const next = timePoints[i + 1];

    if (current.isNewSession && current.type === "start") activeNew = true;
    if (current.isNewSession && current.type === "end") activeNew = false;
    if (!current.isNewSession && current.type === "start") activeExisting++;
    if (!current.isNewSession && current.type === "end") activeExisting--;

    // Nur wenn die neue Session aktiv ist und KEINE bestehende Session läuft
    if (activeNew && activeExisting === 0 && next.time > current.time) {
      adjustedTimeSpans.push({
        ...newSession,
        start_time: new Date(current.time).toISOString(),
        end_time: new Date(next.time).toISOString(),
        active_seconds: Math.round((next.time - current.time) / 1000),
      });
    }
  }

  return {
    adjustedTimeSpans: adjustedTimeSpans.length > 0 ? adjustedTimeSpans : null,
    overlappingSessions,
  };
}

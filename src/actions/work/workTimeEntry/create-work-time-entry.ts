"use server";

import { createClient } from "@/utils/supabase/server";
import { InsertWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";
import { resolveTimeEntryOverlaps } from "@/utils/helper";

export async function createWorkTimeEntry({
  newTimeEntry,
}: {
  newTimeEntry: InsertWorkTimeEntry;
}): Promise<{
  createdTimeEntries: WorkTimeEntry[] | null;
  overlappingTimeEntries: WorkTimeEntry[] | null;
}> {
  if (!newTimeEntry.project_id) {
    throw new Error("Project ID is required");
  }

  const supabase = await createClient();

  const { data: existingTimeEntries, error: existingTimeEntriesError } =
    await supabase
      .from("timer_session")
      .select("*")
      .eq("project_id", newTimeEntry.project_id);

  if (existingTimeEntriesError) {
    throw new Error(existingTimeEntriesError.message);
  }

  const { adjustedTimeSpans, overlappingTimeEntries } =
    resolveTimeEntryOverlaps(existingTimeEntries, newTimeEntry);

  if (!adjustedTimeSpans) {
    return {
      createdTimeEntries: null,
      overlappingTimeEntries: overlappingTimeEntries,
    };
  }

  const { data, error } = await supabase
    .from("timer_session")
    .insert(adjustedTimeSpans)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return {
    createdTimeEntries: data,
    overlappingTimeEntries:
      overlappingTimeEntries.length > 0 ? overlappingTimeEntries : null,
  };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { WorkTimeEntry } from "@/types/work.types";
import { resolveTimeEntryOverlaps } from "@/utils/helper";

export async function updateWorkTimeEntries({
  update,
}: {
  update: WorkTimeEntry;
}): Promise<{
  createdTimeEntries: WorkTimeEntry[] | null;
  overlappingTimeEntries: WorkTimeEntry[] | null;
}> {
  const supabase = await createClient();
  const { data: existingTimeEntries, error: existingTimeEntriesError } =
    await supabase
      .from("timer_session")
      .select("*")
      .eq("project_id", update.project_id)
      .neq("id", update.id);

  if (existingTimeEntriesError) {
    throw new Error(existingTimeEntriesError.message);
  }

  const { adjustedTimeSpans, overlappingTimeEntries } =
    resolveTimeEntryOverlaps(existingTimeEntries, update);

  if (!adjustedTimeSpans) {
    return {
      createdTimeEntries: null,
      overlappingTimeEntries: overlappingTimeEntries,
    };
  }

  let data: WorkTimeEntry[] | null = null;

  if (adjustedTimeSpans.length === 1) {
    const { data: updatedData, error } = await supabase
      .from("timer_session")
      .update(adjustedTimeSpans[0])
      .eq("id", update.id)
      .select();

    if (error) {
      throw new Error(error.message);
    }
    data = updatedData;
  } else {
    const { error: deleteError } = await supabase
      .from("timer_session")
      .delete()
      .eq("id", update.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { data: updatedData, error: insertError } = await supabase
      .from("timer_session")
      .insert(adjustedTimeSpans)
      .select();

    if (insertError) {
      throw new Error(insertError.message);
    }
    data = updatedData;
  }

  return {
    createdTimeEntries: data,
    overlappingTimeEntries:
      overlappingTimeEntries.length > 0 ? overlappingTimeEntries : null,
  };
}

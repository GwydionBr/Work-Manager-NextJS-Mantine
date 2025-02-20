'use server';

import type { TablesUpdate } from "@/types/db.types";
import { createClient } from '@/utils/supabase/server';
import type { ProjectResponse } from '@/types/action.types';


interface UpdateProjectProps {
  updateProject: TablesUpdate<"timerProject">;
}

export async function updateProject({ updateProject }: UpdateProjectProps) : Promise<ProjectResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timerProject")
    .update(updateProject)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    data,
    error: null,
    success: true,
  };
}
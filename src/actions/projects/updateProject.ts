'use server';

import type { ProjectResponse } from '@/types/action.types';
import type { TablesUpdate } from "@/types/db.types";
import { createClient } from '@/utils/supabase/server';


interface UpdateProjectProps {
  updateProject: TablesUpdate<"timerProject">;
}

export async function updateProject({ updateProject }: UpdateProjectProps) : Promise<ProjectResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timerProject")
    .update(updateProject)
    .eq("id", updateProject.id!)
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
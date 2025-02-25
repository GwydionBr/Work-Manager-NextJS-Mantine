'use server';

import type { ProjectResponse } from '@/types/action.types';
import type { TablesInsert } from '@/types/db.types';
import { createClient } from '@/utils/supabase/server';


interface CreateProjectProps {
  project: TablesInsert<'timerProject'>;
}

export async function createProject({ project }: CreateProjectProps): Promise<ProjectResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('timerProject')
    .insert(project)
    .select()
    .single();;

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
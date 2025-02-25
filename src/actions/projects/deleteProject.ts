'use server';

import type { DeleteResponse } from '@/types/action.types';
import { createClient } from '@/utils/supabase/server';


interface DeleteProjectProps {
  projectId: string;
}

export async function deleteProject({ projectId }: DeleteProjectProps): Promise<DeleteResponse> {
  const supabase = await createClient();

  const sessionResponse = await supabase
    .from('timerSession')
    .delete()
    .eq('project_id', projectId);


  if (sessionResponse.error) {
    return {
      data: null,
      error: sessionResponse.error.message,
      success: false,
    };
  }

  const projectResponse = await supabase
    .from('timerProject')
    .delete()
    .eq('id', projectId);


  if (projectResponse.error) {
    return {
      data: null,
      error: projectResponse.error.message,
      success: false,
    };
  }

  return {
    data: null,
    error: null,
    success: true,
  };
}
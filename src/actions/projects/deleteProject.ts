'use server';

import type { DeleteResponse } from '@/types/action.types';
import { createClient } from '@/utils/supabase/server';


interface DeleteProjectProps {
  projectId: string;
}

export async function deleteProject({ projectId }: DeleteProjectProps): Promise<DeleteResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('timerProject')
    .delete()
    .eq('id', projectId);

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    data: null,
    error: null,
    success: true,
  };
}
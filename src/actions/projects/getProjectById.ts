'use server';

import type { ProjectResponse } from '@/types/action.types';
import { createClient } from '@/utils/supabase/server';


interface getProjectProps {
  id: string;
}

export async function getProjectById({ id }: getProjectProps): Promise<ProjectResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('timerProject')
    .select('*')
    .eq('id', id)
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
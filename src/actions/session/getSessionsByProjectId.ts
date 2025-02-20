'use server';

import type { ServerSessionListResponse } from '@/types/action.types';
import { createClient } from '@/utils/supabase/server';


interface getSessionsByProjectIdProps {
  projectId: string;
}

export async function getSessionsByProjectId({
  projectId,
}: getSessionsByProjectIdProps): Promise<ServerSessionListResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: 'User not found',
      success: false,
    };
  }

  const { data, error } = await supabase
    .from('timerSession')
    .select(
      'active_seconds, currency, end_time, id, paused_seconds, project_id, salary, start_time, user_id'
    )
    .eq('project_id', projectId);

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
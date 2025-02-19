'use server';

import { Tables } from '@/db.types'
import {createClient} from '@/utils/supabase/server';

interface SupabaseResponse {
  data: Tables<"timerSession">[];
  error: string | null;
  success: boolean;
}

interface getSessionByProjectIdProps {
  projectId: string;
}

export async function getSessionByProjectId({projectId}: getSessionByProjectIdProps): Promise<SupabaseResponse> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      data: [],
      error: "User not found",
      success: false,
    };
  }

  const {data, error} = await supabase
    .from("timerSession")
    .select('active_seconds, currency, end_time, id, paused_seconds, project_id, salary, start_time, user_id')
    .eq('project_id', projectId);

  if (error) {
    return {
      data: [],
      error: error.message,
      success: false,
    }
  }

  return {
    data,
    error: null,
    success: true,
  };
}
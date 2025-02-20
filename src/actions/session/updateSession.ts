'use server';

import type { SessionResponse } from '@/types/action.types';
import type { TablesUpdate } from "@/types/db.types";
import { createClient } from '@/utils/supabase/server';


interface UpdateSessionProps {
  updateSession: TablesUpdate<'timerSession'>;
}

export async function updateProject({ updateSession }: UpdateSessionProps): Promise<SessionResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('timerSession')
    .update(updateSession)
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
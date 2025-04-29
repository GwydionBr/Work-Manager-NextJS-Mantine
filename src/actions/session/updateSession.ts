'use server';

import { revalidatePath } from 'next/cache';
import type { SessionResponse } from '@/types/action.types';
import type { TablesUpdate } from '@/types/db.types';
import paths from '@/utils/paths';
import { createClient } from '@/utils/supabase/server';

interface UpdateSessionProps {
  updateSession: TablesUpdate<'timerSession'>;
}

export async function updateSession({
  updateSession: updateSession,
}: UpdateSessionProps): Promise<SessionResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('timerSession')
    .update(updateSession)
    .eq('id', updateSession.id!)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  revalidatePath(paths.work.workDetailsPage(updateSession.project_id!));

  return {
    data,
    error: null,
    success: true,
  };
}

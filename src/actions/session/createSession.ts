'use server';

import type { SessionResponse } from '@/types/action.types';
import type { TablesInsert } from '@/types/db.types';
import { createClient } from '@/utils/supabase/server';


interface CreateProjectProps {
  session: TablesInsert<'timerSession'>;
}

export async function createSession({ session }: CreateProjectProps): Promise<SessionResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('timerSession')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.log('Error creating session:', error.message);
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
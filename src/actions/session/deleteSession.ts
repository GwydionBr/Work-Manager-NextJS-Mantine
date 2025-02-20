'use server';

import type { DeleteResponse } from '@/types/action.types';
import { createClient } from '@/utils/supabase/server';


interface DeleteProjectProps {
  sessionId: string;
}

export async function deleteSession({ sessionId }: DeleteProjectProps): Promise<DeleteResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('timerSession')
    .delete()
    .eq('id', sessionId);

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
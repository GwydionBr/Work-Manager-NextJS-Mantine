'use server';

import { Tables } from '@/db.types'
import {createClient} from '@/utils/supabase/server';

interface SupabaseResponse {
  data: Tables<"timerProject">[] | null;
  error: string | null;
  success: boolean;
}

export async function getProjects(): Promise<SupabaseResponse> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const {data, error} = await supabase.from("timerProject").select('*').eq('user_id', user.id);

  if (error) {
    return {
      data: null,
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
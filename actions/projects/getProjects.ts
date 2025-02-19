'use server';

import { Tables } from '@/db.types'
import {createClient} from '@/utils/supabase/server';

interface SupabaseResponse {
  data: Tables<"timerProject">[];
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
      data: [],
      error: "User not found",
      success: false,
    };
  }

  const {data, error} = await supabase.from("timerProject").select('*').eq('user_id', user.id);

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
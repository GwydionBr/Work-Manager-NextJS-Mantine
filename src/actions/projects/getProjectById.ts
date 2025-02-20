'use server';

import { Tables } from '@/db.types'
import {createClient} from '@/utils/supabase/server';

interface SupabaseResponse {
  data: Tables<"timerProject"> | null;
  error: string | null;
  success: boolean;
}

interface getProjectProps {
  id: string;
}

export async function getProjectById({ id }: getProjectProps): Promise<SupabaseResponse> {
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

  const {data, error} = await supabase.from("timerProject").select('*').eq('id', id).maybeSingle();

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
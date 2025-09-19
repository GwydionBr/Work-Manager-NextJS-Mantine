"use server";

import { createClient } from "@/utils/supabase/server";
import { ErrorResponse } from "@/types/action.types";
import { Payout } from "@/types/finance.types";

export async function getAllPayouts(): Promise<
  | {
      success: true;
      data: Payout[];
      error: null;
    }
  | ErrorResponse
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("payout")
    .select(
      `
      *,
      cashflow:single_cash_flow!payout_cashflow_id_fkey(*),
      timer_project:timer_project!payout_timer_project_id_fkey(*),
      timer_sessions:timer_session!timerSession_payout_id_fkey(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  // Normalize possible null arrays to empty arrays for safer consumption
  const formatted: Payout[] = (data as unknown as Payout[]).map((p) => ({
    ...p,
    timer_sessions: p.timer_sessions ?? [],
  }));

  return { success: true, data: formatted, error: null };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, Tables } from "@/types/db.types";
import { ApiResponseSingle } from "@/types/action.types";

export async function createSingleCashFlow({
  cashFlow,
}: {
  cashFlow: TablesInsert<"single_cash_flow">;
}): Promise<ApiResponseSingle<Tables<"single_cash_flow">>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const { data, error } = await supabase
    .from("single_cash_flow")
    .insert({ ...cashFlow, user_id: user.id })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

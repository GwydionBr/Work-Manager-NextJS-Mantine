"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, Tables } from "@/types/db.types";
import { ApiResponseList } from "@/types/action.types";

export async function createMultipleSingleCashFlows({
  cashFlows,
}: {
  cashFlows: TablesInsert<"single_cash_flow">[];
}): Promise<ApiResponseList<Tables<"single_cash_flow">>> {
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

  const insertData = cashFlows.map((cashFlow) => ({
    ...cashFlow,
    user_id: user.id,
  }));

  const { data, error } = await supabase
    .from("single_cash_flow")
    .insert(insertData)
    .select();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { Tables, TablesInsert } from "@/types/db.types";
import { StoreSingleCashFlow } from "@/types/finance.types";

interface PayoutSessionsProps {
  date: Date;
  cashflow: TablesInsert<"single_cash_flow">;
  sessionIds: string[];
  categoryIds: string[];
}

export async function payoutSessions({
  date,
  cashflow,
  sessionIds,
  categoryIds,
}: PayoutSessionsProps): Promise<ApiResponseSingle<StoreSingleCashFlow>> {
  const supabase = await createClient();

  const { data: cashflowData, error: cashFlowError } = await supabase
    .from("single_cash_flow")
    .insert(cashflow)
    .select()
    .single();

  if (cashFlowError) {
    return { success: false, data: null, error: cashFlowError.message };
  }

  const { error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(
      categoryIds.map((id) => ({
        single_cash_flow_id: cashflowData.id,
        finance_category_id: id,
      }))
    )
    .select();

  if (categoriesError) {
    return { success: false, data: null, error: categoriesError.message };
  }

  for (const sessionId of sessionIds) {
    const { error: sessionError } = await supabase
      .from("timer_session")
      .update({
        paid: true,
        cashflow_id: cashflowData.id,
      })
      .eq("id", sessionId);
    if (sessionError) {
      return { success: false, data: null, error: sessionError.message };
    }
  }

  return {
    success: true,
    data: { ...cashflowData, categoryIds: categoryIds },
    error: null,
  };
}

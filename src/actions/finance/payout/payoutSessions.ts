"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { Tables, TablesInsert } from "@/types/db.types";
import { StoreSingleCashFlow } from "@/types/finance.types";

interface PayoutSessionsProps {
  date: Date;
  payout: TablesInsert<"payout">;
  sessionIds: string[];
  categoryIds: string[];
}

export async function payoutSessions({
  date,
  payout,
  sessionIds,
  categoryIds,
}: PayoutSessionsProps): Promise<
  ApiResponseSingle<{
    cashflow: StoreSingleCashFlow;
    payout: Tables<"payout">;
  }>
> {
  const supabase = await createClient();

  const { data: cashflow, error: cashFlowError } = await supabase
    .from("single_cash_flow")
    .insert({
      title: payout.title,
      type: "income",
      amount: payout.end_value ?? payout.start_value,
      currency: payout.end_currency ?? payout.start_currency,
      date: date.toISOString(),
    })
    .select()
    .single();

  if (cashFlowError) {
    return { success: false, data: null, error: cashFlowError.message };
  }

  const { error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(
      categoryIds.map((id) => ({
        single_cash_flow_id: cashflow.id,
        finance_category_id: id,
      }))
    )
    .select();

  if (categoriesError) {
    return { success: false, data: null, error: categoriesError.message };
  }

  const { data: payoutData, error: payoutError } = await supabase
    .from("payout")
    .insert({
      ...payout,
      cashflow_id: cashflow.id,
    })
    .select()
    .single();

  if (payoutError) {
    return { success: false, data: null, error: payoutError.message };
  }

  for (const sessionId of sessionIds) {
    const { error: sessionError } = await supabase
      .from("timer_session")
      .update({
        paid: true,
        payout_id: payoutData.id,
      })
      .eq("id", sessionId);
    if (sessionError) {
      return { success: false, data: null, error: sessionError.message };
    }
  }

  return {
    success: true,
    data: {
      cashflow: { ...cashflow, categoryIds: categoryIds },
      payout: payoutData,
    },
    error: null,
  };
}

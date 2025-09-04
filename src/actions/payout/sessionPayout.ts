"use server";

import { createClient } from "@/utils/supabase/server";
import { ErrorResponse, SuccessPayoutResponse } from "@/types/action.types";
import { Currency } from "@/types/settings.types";

interface PayoutSessionsProps {
  date: Date;
  title: string;
  sessionIds: string[];
  startValue: number;
  startCurrency: Currency;
  categoryId: string | null;
  endValue: number | null;
  endCurrency: Currency | null;
}

export async function payoutSessions({
  date,
  title,
  sessionIds,
  startValue,
  startCurrency,
  categoryId,
  endValue,
  endCurrency,
}: PayoutSessionsProps): Promise<SuccessPayoutResponse | ErrorResponse> {
  const supabase = await createClient();

  const { data: cashFlow, error: cashFlowError } = await supabase
    .from("single_cash_flow")
    .insert({
      title: title,
      category_id: categoryId,
      type: "income",
      amount: endValue ?? startValue,
      currency: endCurrency ?? startCurrency,
      date: date.toISOString(),
    })
    .select()
    .single();

  if (cashFlowError) {
    return { success: false, data: null, error: cashFlowError.message };
  }

  const { data: payout, error: payoutError } = await supabase
    .from("payout")
    .insert({
      cashflow_id: cashFlow.id,
      start_value: startValue,
      start_currency: startCurrency,
      end_value: endValue,
      end_currency: endCurrency,
      timer_project_id: null,
      title: title,
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
        payed: true,
        payout_id: payout.id,
      })
      .eq("id", sessionId);
    if (sessionError) {
      return { success: false, data: null, error: sessionError.message };
    }
  }

  return { success: true, data: { cashFlow, payout }, error: null };
}

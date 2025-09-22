"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";

interface CreatePayoutProps {
  projectId: string | null;
  date: Date;
  startValue: number;
  startCurrency: Currency;
  categoryId: string | null;
  endValue: number | null;
  endCurrency: Currency | null;
}

export async function createPayout({
  projectId,
  date,
  startValue,
  startCurrency,
  categoryId,
  endValue,
  endCurrency,
}: CreatePayoutProps): Promise<
  ApiResponseSingle<{
    cashFlow: Tables<"single_cash_flow">;
    payout: Tables<"payout">;
  }>
> {
  const supabase = await createClient();

  const { data: cashFlow, error: cashFlowError } = await supabase
    .from("single_cash_flow")
    .insert({
      title: `Project Payout ${date.toLocaleDateString()}`,
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
      timer_project_id: projectId,
      title: `Project Payout ${date.toLocaleDateString()}`,
    })
    .select()
    .single();

  if (payoutError) {
    return { success: false, data: null, error: payoutError.message };
  }

  return {
    success: true,
    data: { cashFlow, payout },
    error: null,
  };
}

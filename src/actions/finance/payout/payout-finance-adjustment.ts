"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/types/db.types";
import { FinanceProject } from "@/types/finance.types";

export async function payoutFinanceAdjustment(
  adjustment: Tables<"finance_project_adjustment">,
  financeProject: FinanceProject,
  title: string
): Promise<{
  adjustment: Tables<"finance_project_adjustment">;
  cashflow: Tables<"single_cash_flow">;
}> {
  const supabase = await createClient();

  const { data: cashflow, error: cashflowError } = await supabase
    .from("single_cash_flow")
    .insert({
      amount: adjustment.amount,
      currency: financeProject.currency,
      title,
      finance_project_id: financeProject.id,
    })
    .select()
    .single();

  if (cashflowError) {
    throw new Error(cashflowError.message);
  }

  const { error: adjustmentError } = await supabase
    .from("finance_project_adjustment")
    .update({
      single_cash_flow_id: cashflow.id,
    })
    .eq("id", adjustment.id);

  if (adjustmentError) {
    throw new Error(adjustmentError.message);
  }

  return { adjustment, cashflow };
}

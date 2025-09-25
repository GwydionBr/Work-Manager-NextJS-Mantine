"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseList } from "@/types/action.types";
import { StoreRecurringCashFlow } from "@/types/finance.types";

export async function getAllRecurringCashFlows(): Promise<
  ApiResponseList<StoreRecurringCashFlow>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .select(
      "*, categories:recurring_cash_flow_category(finance_category:finance_category_id(*))"
    )
    .order("start_date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const formatted: StoreRecurringCashFlow[] = data.map((cashFlow) => {
    const { categories, ...rest } = cashFlow;
    return {
      ...rest,
      categoryIds: categories.map((category) => category.finance_category.id),
    };
  });

  return { success: true, data: formatted, error: null };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseList } from "@/types/action.types";
import { StoreSingleCashFlow } from "@/types/finance.types";

export async function getAllSingleCashFlows(): Promise<
  ApiResponseList<StoreSingleCashFlow>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("single_cash_flow")
    .select(
      "*, categories:single_cash_flow_category(finance_category:finance_category_id(*))"
    )
    .order("date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return {
    success: true,
    data: data.map((cashFlow) => {
      const { categories, ...rest } = cashFlow;
      return {
        ...rest,
        categoryIds: categories.map((category) => category.finance_category.id),
      };
    }),
    error: null,
  };
}

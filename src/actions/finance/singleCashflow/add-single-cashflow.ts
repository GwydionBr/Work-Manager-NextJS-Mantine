"use server";

import { createClient } from "@/utils/supabase/server";
import { InsertSingleCashFlow, SingleCashFlow } from "@/types/finance.types";

interface AddSingleCashFlowProps {
  cashflow: InsertSingleCashFlow;
}

export async function addSingleCashFlow({
  cashflow,
}: AddSingleCashFlowProps): Promise<SingleCashFlow> {
  const supabase = await createClient();

  const { categories, ...cashflowData } = cashflow;

  const { data, error } = await supabase
    .from("single_cash_flow")
    .insert({ ...cashflowData })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(
      categories.map((category) => ({
        single_cash_flow_id: data.id,
        finance_category_id: category.finance_category.id,
      }))
    )
    .select();

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  return {
    ...data,
    categories,
  };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert } from "@/types/db.types";
import { SingleCashFlow } from "@/types/finance.types";

interface AddSingleCashFlowProps {
  cashflow: TablesInsert<"single_cash_flow">;
  categoryIds: string[];
}

export async function addSingleCashFlow({
  cashflow,
  categoryIds,
}: AddSingleCashFlowProps): Promise<SingleCashFlow> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("single_cash_flow")
    .insert({ ...cashflow })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(
      categoryIds.map((id) => ({
        single_cash_flow_id: data.id,
        finance_category_id: id,
      }))
    )
    .select();

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const { data: categories, error: categoriesError2 } = await supabase
    .from("finance_category")
    .select("*")
    .in("id", categoryIds);

  if (categoriesError2) {
    throw new Error(categoriesError2.message);
  }

  return {
    ...data,
    categories: categories.map((category) => ({ finance_category: category })),
  };
}

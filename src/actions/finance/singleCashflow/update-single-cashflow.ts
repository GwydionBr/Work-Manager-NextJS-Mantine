"use server";

import { createClient } from "@/utils/supabase/server";
import { SingleCashFlow, UpdateSingleCashFlow } from "@/types/finance.types";

interface UpdateSingleCashFlowProps {
  updateSingleCashFlow: UpdateSingleCashFlow;
}

export async function updateSingleCashFlow({
  updateSingleCashFlow,
}: UpdateSingleCashFlowProps): Promise<SingleCashFlow> {
  const supabase = await createClient();

  const { categories, ...singleCashFlowData } = updateSingleCashFlow;

  if (!updateSingleCashFlow.id) {
    throw new Error("Single cash flow id is required");
  }

  // Update the single cash flow
  const { data, error } = await supabase
    .from("single_cash_flow")
    .update(singleCashFlowData)
    .eq("id", updateSingleCashFlow.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Delete the categories
  const { error: categoryErrorDelete } = await supabase
    .from("single_cash_flow_category")
    .delete()
    .eq("single_cash_flow_id", data.id);

  if (categoryErrorDelete) {
    throw new Error(categoryErrorDelete.message);
  }

  // Add the categories
  const { error: categoryErrorAdd } = await supabase
    .from("single_cash_flow_category")
    .insert(
      categories.map((category) => ({
        single_cash_flow_id: data.id,
        finance_category_id: category.finance_category.id,
      }))
    );

  if (categoryErrorAdd) {
    throw new Error(categoryErrorAdd.message);
  }

  // Return the new single cash flow
  return { ...data, categories };
}

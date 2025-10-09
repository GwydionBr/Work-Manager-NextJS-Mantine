"use server";

import { createClient } from "@/utils/supabase/server";
import {
  UpdateRecurringCashFlow,
  RecurringCashFlow,
  SingleCashFlow,
} from "@/types/finance.types";

interface UpdateRecurringCashFlowProps {
  updateRecurringCashFlow: UpdateRecurringCashFlow;
  shouldUpdateSingleCashFlows: boolean;
}

export async function updateRecurringCashFlow({
  updateRecurringCashFlow,
  shouldUpdateSingleCashFlows,
}: UpdateRecurringCashFlowProps): Promise<{
  recurringCashFlow: RecurringCashFlow;
  singleCashFlows: SingleCashFlow[];
}> {
  const supabase = await createClient();

  let newRecurringCashFlow: RecurringCashFlow;
  let newSingleCashFlows: SingleCashFlow[] = [];

  const { categories, ...recurringCashFlowData } = updateRecurringCashFlow;

  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .update(recurringCashFlowData)
    .eq("id", updateRecurringCashFlow.id!)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoryErrorDelete } = await supabase
    .from("recurring_cash_flow_category")
    .delete()
    .eq("recurring_cash_flow_id", data.id);

  if (categoryErrorDelete) {
    throw new Error(categoryErrorDelete.message);
  }

  const { error: categoryErrorAdd } = await supabase
    .from("recurring_cash_flow_category")
    .insert(
      categories.map((category) => ({
        recurring_cash_flow_id: data.id,
        finance_category_id: category.finance_category.id,
      }))
    );

  if (categoryErrorAdd) {
    throw new Error(categoryErrorAdd.message);
  }

  if (shouldUpdateSingleCashFlows) {
    const { data: singleCashFlows, error: singleCashFlowError } = await supabase
      .from("single_cash_flow")
      .update({
        title: data.title,
        amount: data.amount,
        currency: data.currency,
        finance_client_id: data.finance_client_id,
        changed_date: new Date().toISOString(),
      })
      .eq("recurring_cash_flow_id", data.id)
      .select();

    if (singleCashFlowError) {
      throw new Error(singleCashFlowError.message);
    }
    const { error: singleCashFlowCategoryError } = await supabase
      .from("single_cash_flow_category")
      .delete()
      .in(
        "single_cash_flow_id",
        singleCashFlows.map((singleCashFlow) => singleCashFlow.id)
      );

    if (singleCashFlowCategoryError) {
      throw new Error(singleCashFlowCategoryError.message);
    }
    const { error: singleCashFlowCategoryAddError } = await supabase
      .from("single_cash_flow_category")
      .insert(
        singleCashFlows.flatMap((singleCashFlow) =>
          categories.map((category) => ({
            single_cash_flow_id: singleCashFlow.id,
            finance_category_id: category.finance_category.id,
          }))
        )
      );

    if (singleCashFlowCategoryAddError) {
      throw new Error(singleCashFlowCategoryAddError.message);
    }
    newSingleCashFlows = singleCashFlows.map((singleCashFlow) => ({
      ...singleCashFlow,
      categories,
    }));
  }

  newRecurringCashFlow = { ...data, categories };

  return {
    recurringCashFlow: newRecurringCashFlow,
    singleCashFlows: newSingleCashFlows,
  };
}

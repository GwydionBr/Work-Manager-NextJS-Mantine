"use server";

import { createClient } from "@/utils/supabase/server";
import {
  InsertRecurringCashFlow,
  RecurringCashFlow,
  SingleCashFlow,
} from "@/types/finance.types";
import { processRecurringCashFlows } from "@/utils/helper/processRecurringCashflows";

interface AddRecurringCashFlowProps {
  cashflow: InsertRecurringCashFlow;
}

export async function addRecurringCashFlow({
  cashflow,
}: AddRecurringCashFlowProps): Promise<{
  recurringCashFlow: RecurringCashFlow;
  singleCashFlows: SingleCashFlow[];
}> {
  const supabase = await createClient();

  const { categories, ...cashflowData } = cashflow;

  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .insert({ ...cashflowData })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoriesError } = await supabase
    .from("recurring_cash_flow_category")
    .insert(
      categories.map((category) => ({
        recurring_cash_flow_id: data.id,
        finance_category_id: category.finance_category.id,
      }))
    )
    .select();

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const pastAndCurrentFlows = processRecurringCashFlows(
    [
      {
        ...data,
        categories,
      },
    ],
    []
  );

  const pastAndCurrentFlowsToInsert = pastAndCurrentFlows.map((flow) => {
    const { categories: _, ...rest } = flow;
    return rest;
  });

  const { data: newSingleCashFlowsData, error: newSingleCashFlowsError } =
    await supabase
      .from("single_cash_flow")
      .insert(pastAndCurrentFlowsToInsert)
      .select("*");

  if (newSingleCashFlowsError) {
    throw new Error(newSingleCashFlowsError.message);
  }
  const { error: newSingleCashFlowsCategoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(
      newSingleCashFlowsData.flatMap((flow) =>
        categories.map((category) => ({
          single_cash_flow_id: flow.id,
          finance_category_id: category.finance_category.id,
        }))
      )
    );

  if (newSingleCashFlowsCategoriesError) {
    throw new Error(newSingleCashFlowsCategoriesError.message);
  }

  return {
    recurringCashFlow: {
      ...data,
      categories,
    },
    singleCashFlows: newSingleCashFlowsData.map((flow) => ({
      ...flow,
      categories,
    })),
  };
}

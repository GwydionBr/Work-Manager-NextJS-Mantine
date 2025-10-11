"use server";

import { createClient } from "@/utils/supabase/server";
import {
  SingleCashFlow,
  InsertSingleCashFlow,
  RecurringCashFlow,
} from "@/types/finance.types";

interface CreateMultipleSingleCashFlowsProps {
  cashFlows: InsertSingleCashFlow[];
  recurringCashFlows: RecurringCashFlow[];
}

export async function createMultipleSingleCashFlows({
  cashFlows,
  recurringCashFlows,
}: CreateMultipleSingleCashFlowsProps): Promise<SingleCashFlow[]> {
  const supabase = await createClient();

  const cashFlowsToInsert = cashFlows.map((cashFlow) => {
    const { categories, ...rest } = cashFlow;
    return rest;
  });

  const { data, error } = await supabase
    .from("single_cash_flow")
    .insert(cashFlowsToInsert)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  const categoryLinkRows = data.flatMap(
    (cashFlow) =>
      recurringCashFlows
        .find(
          (recurringCashFlow) =>
            recurringCashFlow.id === cashFlow.recurring_cash_flow_id
        )
        ?.categories.map((category) => ({
          single_cash_flow_id: cashFlow.id,
          finance_category_id: category.finance_category.id,
        })) ?? []
  );
  const { data: categories, error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(categoryLinkRows).select(`
      *,
      finance_category:finance_category_id(*)
    `);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const formattedData = data.map((cashFlow) => ({
    ...cashFlow,
    categories: categories
      .filter((category) => category.single_cash_flow_id === cashFlow.id)
      .map((category) => ({
        finance_category: category.finance_category,
      })),
  }));

  return formattedData;
}

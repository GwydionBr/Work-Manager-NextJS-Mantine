"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert } from "@/types/db.types";
import { ApiResponseList } from "@/types/action.types";
import {
  StoreRecurringCashFlow,
  StoreSingleCashFlow,
} from "@/types/finance.types";

interface CreateMultipleSingleCashFlowsProps {
  cashFlows: TablesInsert<"single_cash_flow">[];
  recurringCashFlows: StoreRecurringCashFlow[];
}

export async function createMultipleSingleCashFlows({
  cashFlows,
  recurringCashFlows,
}: CreateMultipleSingleCashFlowsProps): Promise<
  ApiResponseList<StoreSingleCashFlow>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("single_cash_flow")
    .insert(cashFlows)
    .select();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const categoryLinkRows = data.flatMap(
    (cashFlow) =>
      recurringCashFlows
        .find(
          (recurringCashFlow) =>
            recurringCashFlow.id === cashFlow.recurring_cash_flow_id
        )
        ?.categoryIds.map((categoryId) => ({
          single_cash_flow_id: cashFlow.id,
          finance_category_id: categoryId,
          user_id: user.id,
        })) ?? []
  );

  const { data: categories, error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(categoryLinkRows)
    .select();

  if (categoriesError) {
    return { success: false, data: null, error: categoriesError.message };
  }

  const formattedData = data.map((cashFlow) => ({
    ...cashFlow,
    categoryIds: categories
      .filter((category) => category.single_cash_flow_id === cashFlow.id)
      .map((category) => category.finance_category_id),
  }));

  return { success: true, data: formattedData, error: null };
}

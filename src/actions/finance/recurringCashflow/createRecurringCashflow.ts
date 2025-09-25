"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert } from "@/types/db.types";
import { ApiResponseSingle } from "@/types/action.types";
import { StoreRecurringCashFlow } from "@/types/finance.types";

interface CreateRecurringCashFlowProps {
  cashFlow: TablesInsert<"recurring_cash_flow">;
  categoryIds: string[];
}

export async function createRecurringCashFlow({
  cashFlow,
  categoryIds,
}: CreateRecurringCashFlowProps): Promise<
  ApiResponseSingle<StoreRecurringCashFlow>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .insert({ ...cashFlow })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { error: categoriesError } = await supabase
    .from("recurring_cash_flow_category")
    .insert(
      categoryIds.map((categoryId) => ({
        recurring_cash_flow_id: data.id,
        finance_category_id: categoryId,
      }))
    )
    .select();

  if (categoriesError) {
    return { success: false, data: null, error: categoriesError.message };
  }

  return { success: true, data: { ...data, categoryIds }, error: null };
}

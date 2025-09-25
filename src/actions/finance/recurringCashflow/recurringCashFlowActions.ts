"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate, Tables } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";
import {
  DeleteRecurringCashFlowMode,
  StoreRecurringCashFlow,
} from "@/types/finance.types";

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

export async function createRecurringCashFlow({
  cashFlow,
  categoryIds,
}: {
  cashFlow: TablesInsert<"recurring_cash_flow">;
  categoryIds: string[];
}): Promise<ApiResponseSingle<StoreRecurringCashFlow>> {
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
    .insert({ ...cashFlow, user_id: user.id })
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
        // User Id is not nesesarry soon
        user_id: user.id,
      }))
    )
    .select();

  if (categoriesError) {
    return { success: false, data: null, error: categoriesError.message };
  }

  return { success: true, data: { ...data, categoryIds }, error: null };
}



export async function deleteRecurringCashFlow({
  recurringCashFlowId,
  mode,
}: {
  recurringCashFlowId: string;
  mode: DeleteRecurringCashFlowMode;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  if (mode === DeleteRecurringCashFlowMode.delete_all) {
    const { error: singleCashFlowError } = await supabase
      .from("single_cash_flow")
      .delete()
      .eq("recurring_cash_flow_id", recurringCashFlowId);

    if (singleCashFlowError) {
      return { success: false, data: null, error: singleCashFlowError.message };
    }
  }
  const { error } = await supabase
    .from("recurring_cash_flow")
    .delete()
    .eq("id", recurringCashFlowId);

  if (error) {
    console.log("error", error);
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

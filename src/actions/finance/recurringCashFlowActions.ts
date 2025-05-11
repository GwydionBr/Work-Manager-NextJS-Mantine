"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllRecurringCashFlows(): Promise<
  ApiResponseList<"recurring_cash_flow">
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createRecurringCashFlow({
  cashFlow,
}: {
  cashFlow: TablesInsert<"recurring_cash_flow">;
}): Promise<ApiResponseSingle<"recurring_cash_flow">> {
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

  return { success: true, data, error: null };
}

export async function updateRecurringCashFlow({
  updateRecurringCashFlow,
}: {
  updateRecurringCashFlow: TablesUpdate<"recurring_cash_flow">;
}): Promise<ApiResponseSingle<"recurring_cash_flow">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .update(updateRecurringCashFlow)
    .eq("id", updateRecurringCashFlow.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteRecurringCashFlow({
  recurringCashFlowId,
}: {
  recurringCashFlowId: string;
}): Promise<DeleteResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_cash_flow")
    .delete()
    .eq("id", recurringCashFlowId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

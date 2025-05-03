"use server";

import { createClient } from "@/utils/supabase/client";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllRecurringIncomes(): Promise<
  ApiResponseList<"recurringIncome">
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurringIncome")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createRecurringIncome({
  income,
}: {
  income: TablesInsert<"recurringIncome">;
}): Promise<ApiResponseSingle<"recurringIncome">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurringIncome")
    .insert(income)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateRecurringIncome({
  updateRecurringIncome,
}: {
  updateRecurringIncome: TablesUpdate<"recurringIncome">;
}): Promise<ApiResponseSingle<"recurringIncome">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurringIncome")
    .update(updateRecurringIncome)
    .eq("id", updateRecurringIncome.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteRecurringIncome({
  recurringIncomeId,
}: {
  recurringIncomeId: number;
}): Promise<DeleteResponse> {
  const supabase = createClient();
  const { error } = await supabase
    .from("recurringIncome")
    .delete()
    .eq("id", recurringIncomeId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

"use server";

import { createClient } from "@/utils/supabase/client";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllRecurringExpenses(): Promise<
  ApiResponseList<"recurringExpense">
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurringExpense")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createRecurringExpense({
  expense,
}: {
  expense: TablesInsert<"recurringExpense">;
}): Promise<ApiResponseSingle<"recurringExpense">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurringExpense")
    .insert(expense)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateRecurringExpense({
  updateRecurringExpense,
}: {
  updateRecurringExpense: TablesUpdate<"recurringExpense">;
}): Promise<ApiResponseSingle<"recurringExpense">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurringExpense")
    .update(updateRecurringExpense)
    .eq("id", updateRecurringExpense.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteRecurringExpense({
  recurringExpenseId,
}: {
  recurringExpenseId: number;
}): Promise<DeleteResponse> {
  const supabase = createClient();
  const { error } = await supabase
    .from("recurringExpense")
    .delete()
    .eq("id", recurringExpenseId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

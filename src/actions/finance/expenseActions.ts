"use server";

import { createClient } from "@/utils/supabase/client";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllExpenses(): Promise<ApiResponseList<"expense">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expense")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createExpense({
  expense,
}: {
  expense: TablesInsert<"expense">;
}): Promise<ApiResponseSingle<"expense">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expense")
    .insert(expense)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateExpense({
  updateExpense,
}: {
  updateExpense: TablesUpdate<"expense">;
}): Promise<ApiResponseSingle<"expense">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expense")
    .update(updateExpense)
    .eq("id", updateExpense.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteExpense({
  expenseId,
}: {
  expenseId: number;
}): Promise<DeleteResponse> {
  const supabase = createClient();
  const { error } = await supabase.from("expense").delete().eq("id", expenseId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

"use server";

import { createClient } from "@/utils/supabase/client";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllIncomes(): Promise<ApiResponseList<"income">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("income")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createIncome({
  income,
}: {
  income: TablesInsert<"income">;
}): Promise<ApiResponseSingle<"income">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("income")
    .insert(income)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateIncome({
  updateIncome,
}: {
  updateIncome: TablesUpdate<"income">;
}): Promise<ApiResponseSingle<"income">> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("income")
    .update(updateIncome)
    .eq("id", updateIncome.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteIncome({
  incomeId,
}: {
  incomeId: number;
}): Promise<DeleteResponse> {
  const supabase = createClient();
  const { error } = await supabase.from("income").delete().eq("id", incomeId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

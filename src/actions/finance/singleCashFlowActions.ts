"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllSingleCashFlows(): Promise<
  ApiResponseList<"single_cash_flow">
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("single_cash_flow")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createSingleCashFlow({
  cashFlow,
}: {
  cashFlow: TablesInsert<"single_cash_flow">;
}): Promise<ApiResponseSingle<"single_cash_flow">> {
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
    .from("single_cash_flow")
    .insert({ ...cashFlow, user_id: user.id })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateSingleCashFlow({
  updateSingleCashFlow,
}: {
  updateSingleCashFlow: TablesUpdate<"single_cash_flow">;
}): Promise<ApiResponseSingle<"single_cash_flow">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("single_cash_flow")
    .update(updateSingleCashFlow)
    .eq("id", updateSingleCashFlow.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteSingleCashFlow({
  singleCashFlowId,
}: {
  singleCashFlowId: string;
}): Promise<DeleteResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("single_cash_flow")
    .delete()
    .eq("id", singleCashFlowId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

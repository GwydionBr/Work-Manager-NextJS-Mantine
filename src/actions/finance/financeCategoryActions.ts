"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function getAllFinanceCategories(): Promise<
  ApiResponseList<"cash_flow_category">
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_flow_category")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createFinanceCategory({
  category,
}: {
  category: TablesInsert<"cash_flow_category">;
}): Promise<ApiResponseSingle<"cash_flow_category">> {
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
    .from("cash_flow_category")
    .insert({ ...category, user_id: user.id })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateFinanceCategory({
  category,
}: {
  category: TablesUpdate<"cash_flow_category">;
}): Promise<ApiResponseSingle<"cash_flow_category">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_flow_category")
    .update(category)
    .eq("id", category.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteFinanceCategory({
  categoryId,
}: {
  categoryId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_flow_category")
    .delete()
    .eq("id", categoryId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

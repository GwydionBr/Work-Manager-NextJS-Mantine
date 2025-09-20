"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function getAllFinanceCategories(): Promise<
  ApiResponseList<Tables<"finance_category">>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_category")
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
  category: TablesInsert<"finance_category">;
}): Promise<ApiResponseSingle<Tables<"finance_category">>> {
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
    .from("finance_category")
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
  category: TablesUpdate<"finance_category">;
}): Promise<ApiResponseSingle<Tables<"finance_category">>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_category")
    .update(category)
    .eq("id", category.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteFinanceCategories({
  categoryIds,
}: {
  categoryIds: string[];
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("finance_category")
    .delete()
    .in("id", categoryIds);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

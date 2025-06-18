"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function getAllProjectFolders(): Promise<
  ApiResponseList<"timer_project_folder">
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
    .from("timer_project_folder")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function getProjectFolderById({
  categoryId,
}: {
  categoryId: string;
}): Promise<ApiResponseSingle<"timer_project_folder">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_project_folder")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createProjectFolder({
  category,
}: {
  category: TablesInsert<"timer_project_folder">;
}): Promise<ApiResponseSingle<"timer_project_folder">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timer_project_folder")
    .insert(category)
    .select()
    .single();

  console.log(data);
  console.log(error);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateProjectFolder({
  category,
}: {
  category: TablesUpdate<"timer_project_folder">;
}): Promise<ApiResponseSingle<"timer_project_folder">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_project_folder")
    .update(category)
    .eq("id", category.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteProjectFolder({
  categoryId,
}: {
  categoryId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_project_folder")
    .delete()
    .eq("id", categoryId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

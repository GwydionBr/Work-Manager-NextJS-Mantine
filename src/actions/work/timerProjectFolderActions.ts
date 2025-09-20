"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate, Tables } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function getAllProjectFolders(): Promise<
  ApiResponseList<Tables<"timer_project_folder">>
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
  folderId,
}: {
  folderId: string;
}): Promise<ApiResponseSingle<Tables<"timer_project_folder">>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_project_folder")
    .select("*")
    .eq("id", folderId)
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createProjectFolder({
  folder,
}: {
  folder: TablesInsert<"timer_project_folder">;
}): Promise<ApiResponseSingle<Tables<"timer_project_folder">>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timer_project_folder")
    .insert(folder)
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
  folder,
}: {
  folder: TablesUpdate<"timer_project_folder">;
}): Promise<ApiResponseSingle<Tables<"timer_project_folder">>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_project_folder")
    .update(folder)
    .eq("id", folder.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteProjectFolder({
  folderId,
}: {
  folderId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_project_folder")
    .delete()
    .eq("id", folderId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

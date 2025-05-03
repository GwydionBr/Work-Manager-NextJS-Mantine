"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllProjects(): Promise<
  ApiResponseList<"timerProject">
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
    .from("timerProject")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function getProjectById({
  projectId,
}: {
  projectId: string;
}): Promise<ApiResponseSingle<"timerProject">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timerProject")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createProject({
  project,
}: {
  project: TablesInsert<"timerProject">;
}): Promise<ApiResponseSingle<"timerProject">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timerProject")
    .insert(project)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateProject({
  project,
}: {
  project: TablesUpdate<"timerProject">;
}): Promise<ApiResponseSingle<"timerProject">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timerProject")
    .update(project)
    .eq("id", project.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteProject({
  projectId,
}: {
  projectId: string;
}): Promise<DeleteResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timerProject")
    .delete()
    .eq("id", projectId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

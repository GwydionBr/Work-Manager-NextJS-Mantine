"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
} from "@/types/action.types";

export async function getAllSessions(): Promise<
  ApiResponseList<"timerSession">
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("timerSession")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function getProjectSessions({
  projectId,
}: {
  projectId: string;
}): Promise<ApiResponseList<"timerSession">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timerSession")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createSession({
  session,
}: {
  session: TablesInsert<"timerSession">;
}): Promise<ApiResponseSingle<"timerSession">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timerSession")
    .insert(session)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateSession({
  session,
}: {
  session: TablesUpdate<"timerSession">;
}): Promise<ApiResponseSingle<"timerSession">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timerSession")
    .update(session)
    .eq("id", session.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteSession({
  sessionId,
}: {
  sessionId: string;
}): Promise<DeleteResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timerSession")
    .delete()
    .eq("id", sessionId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

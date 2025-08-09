"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate, Tables } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function getAllSessions(): Promise<
  ApiResponseList<"timer_session">
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("timer_session")
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
}): Promise<ApiResponseList<"timer_session">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_session")
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
  session: TablesInsert<"timer_session">;
}): Promise<ApiResponseSingle<"timer_session">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_session")
    .insert(session)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function createMultipleSessions({
  sessions,
}: {
  sessions: TablesInsert<"timer_session">[];
}): Promise<ApiResponseList<"timer_session">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_session")
    .insert(sessions)
    .select();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateSession({
  session,
}: {
  session: TablesUpdate<"timer_session">;
}): Promise<ApiResponseSingle<"timer_session">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_session")
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
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_session")
    .delete()
    .eq("id", sessionId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

export async function updateMultipleSessions({
  sessionIds,
  updates,
}: {
  sessionIds: string[];
  updates: Partial<Tables<"timer_session">>;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_session")
    .update(updates)
    .in("id", sessionIds);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

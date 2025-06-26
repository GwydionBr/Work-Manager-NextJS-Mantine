"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate, Tables } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
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
}): Promise<SimpleResponse> {
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

export async function payoutSessions({
  sessionIds,
}: {
  sessionIds: string[];
}): Promise<SimpleResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  // Get the sessions with project information to access category_id
  const { data: sessions, error: sessionsError } = await supabase
    .from("timerSession")
    .select(
      `
      *,
      timerProject!inner(
        id,
        title,
        cash_flow_category_id,
        currency
      )
    `
    )
    .in("id", sessionIds)
    .eq("payed", false);

  if (sessionsError) {
    return { success: false, data: null, error: sessionsError.message };
  }

  if (!sessions || sessions.length === 0) {
    return { success: false, data: null, error: "No unpaid sessions found" };
  }

  // Group sessions by currency and category to create separate income entries
  const sessionsByCurrencyAndCategory = sessions.reduce(
    (acc, session) => {
      const currency = session.currency;
      const categoryId = session.timerProject?.cash_flow_category_id || null;
      const key = `${currency}-${categoryId || "no-category"}`;

      if (!acc[key]) {
        acc[key] = {
          currency,
          categoryId,
          sessions: [],
          totalAmount: 0,
        };
      }

      const earnings = session.hourly_payment
        ? Number(((session.active_seconds * session.salary) / 3600).toFixed(2))
        : 0;

      acc[key].sessions.push(session);
      acc[key].totalAmount += earnings;

      return acc;
    },
    {} as Record<
      string,
      {
        currency: string;
        categoryId: string | null;
        sessions: typeof sessions;
        totalAmount: number;
      }
    >
  );

  // Start a transaction
  const { error: updateError } = await supabase
    .from("timerSession")
    .update({ payed: true })
    .in("id", sessionIds);

  if (updateError) {
    return { success: false, data: null, error: updateError.message };
  }

  // Create income entries for each currency and category combination
  const incomeEntries = Object.values(sessionsByCurrencyAndCategory)
    .filter((group) => group.totalAmount > 0)
    .map((group) => ({
      title: `Work Payout - ${group.sessions.length} session${group.sessions.length > 1 ? "s" : ""}`,
      amount: group.totalAmount,
      currency: group.currency as any,
      date: new Date().toISOString(),
      type: "income" as const,
      user_id: user.id,
      category_id: group.categoryId,
    }));

  if (incomeEntries.length > 0) {
    const { error: incomeError } = await supabase
      .from("single_cash_flow")
      .insert(incomeEntries);

    if (incomeError) {
      return { success: false, data: null, error: incomeError.message };
    }
  }

  return { success: true, data: null, error: null };
}

export async function updateMultipleSessions({
  sessionIds,
  updates,
}: {
  sessionIds: string[];
  updates: Partial<Tables<"timerSession">>;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timerSession")
    .update(updates)
    .in("id", sessionIds);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

export async function payoutProjectSalary({
  projectId,
  amount,
}: {
  projectId: string;
  amount: number;
}): Promise<SimpleResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  // Get the project to verify it's not hourly payment and get currency
  const { data: project, error: projectError } = await supabase
    .from("timerProject")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return { success: false, data: null, error: "Project not found" };
  }

  if (project.hourly_payment) {
    return {
      success: false,
      data: null,
      error: "Cannot payout salary for hourly payment projects",
    };
  }

  const currentTotalPayout = project.total_payout || 0;
  const newTotalPayout = currentTotalPayout + amount;

  if (newTotalPayout > project.salary) {
    return {
      success: false,
      data: null,
      error: "Payout amount exceeds project salary",
    };
  }

  // Update project total_payout
  const { error: updateProjectError } = await supabase
    .from("timerProject")
    .update({ total_payout: newTotalPayout })
    .eq("id", projectId);

  if (updateProjectError) {
    return { success: false, data: null, error: updateProjectError.message };
  }

  // Mark all sessions for this project as paid
  const { error: updateSessionsError } = await supabase
    .from("timerSession")
    .update({ payed: true })
    .eq("project_id", projectId)
    .eq("payed", false);

  if (updateSessionsError) {
    return { success: false, data: null, error: updateSessionsError.message };
  }

  // Create income entry
  const { error: incomeError } = await supabase
    .from("single_cash_flow")
    .insert({
      title: `Project Payout - ${project.title}`,
      amount: amount,
      currency: project.currency,
      date: new Date().toISOString(),
      type: "income",
      user_id: user.id,
      category_id: project.cash_flow_category_id,
    });

  if (incomeError) {
    return { success: false, data: null, error: incomeError.message };
  }

  return { success: true, data: null, error: null };
}

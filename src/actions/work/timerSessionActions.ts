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

  // Get the sessions to calculate total payout
  const { data: sessions, error: sessionsError } = await supabase
    .from("timerSession")
    .select("*")
    .in("id", sessionIds)
    .eq("payed", false);

  if (sessionsError) {
    return { success: false, data: null, error: sessionsError.message };
  }

  if (!sessions || sessions.length === 0) {
    return { success: false, data: null, error: "No unpaid sessions found" };
  }

  // Group sessions by currency to create separate income entries
  const sessionsByCurrency = sessions.reduce(
    (acc, session) => {
      const currency = session.currency;
      if (!acc[currency]) {
        acc[currency] = [];
      }
      acc[currency].push(session);
      return acc;
    },
    {} as Record<string, typeof sessions>
  );

  // Calculate total payout for each currency
  const payouts = Object.entries(sessionsByCurrency).map(
    ([currency, currencySessions]) => {
      const totalAmount = currencySessions.reduce((sum, session) => {
        const earnings = session.hourly_payment
          ? Number(
              ((session.active_seconds * session.salary) / 3600).toFixed(2)
            )
          : 0;
        return sum + earnings;
      }, 0);

      return {
        currency,
        amount: totalAmount,
        sessionCount: currencySessions.length,
      };
    }
  );

  // Start a transaction
  const { error: updateError } = await supabase
    .from("timerSession")
    .update({ payed: true })
    .in("id", sessionIds);

  if (updateError) {
    return { success: false, data: null, error: updateError.message };
  }

  // Create income entries for each currency
  const incomeEntries = payouts
    .filter((payout) => payout.amount > 0)
    .map((payout) => ({
      title: `Work Payout - ${payout.sessionCount} session${payout.sessionCount > 1 ? "s" : ""}`,
      amount: payout.amount,
      currency: payout.currency as any,
      date: new Date().toISOString(),
      type: "income" as const,
      user_id: user.id,
      category_id: null, // You might want to add a default work category
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
      category_id: null,
    });

  if (incomeError) {
    return { success: false, data: null, error: incomeError.message };
  }

  return { success: true, data: null, error: null };
}

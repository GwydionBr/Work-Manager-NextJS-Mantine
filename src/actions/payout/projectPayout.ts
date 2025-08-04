"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

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

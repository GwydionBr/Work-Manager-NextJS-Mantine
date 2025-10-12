"use server";

import { createClient } from "@/utils/supabase/server";
import { TimerProject } from "@/types/work.types";
import { SingleCashFlow } from "@/types/finance.types";

interface PayoutHourlyTimerProjectProps {
  project: TimerProject;
  title: string;
  sessionIds: string[];
}

export async function payoutHourlyTimerProject({
  project,
  title,
  sessionIds,
}: PayoutHourlyTimerProjectProps): Promise<{
  singleCashFlow: SingleCashFlow;
  project: TimerProject;
}> {
  const supabase = await createClient();

  const totalAmount = project.sessions
    .filter((session) => sessionIds.includes(session.id))
    .reduce(
      (acc, session) => acc + session.salary * (session.active_seconds / 3600),
      0
    )
    .toFixed(2);

  const { data: cashflowData, error: cashFlowError } = await supabase
    .from("single_cash_flow")
    .insert({
      title,
      amount: Number(totalAmount),
      currency: project.currency,
    })
    .select()
    .single();

  if (cashFlowError) {
    throw new Error(cashFlowError.message);
  }

  const { error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(
      project.categories.map((category) => ({
        single_cash_flow_id: cashflowData.id,
        finance_category_id: category.id,
      }))
    )
    .select();

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  for (const sessionId of sessionIds) {
    const { error: sessionError } = await supabase
      .from("timer_session")
      .update({
        single_cash_flow_id: cashflowData.id,
      })
      .eq("id", sessionId);
    if (sessionError) {
      throw new Error(sessionError.message);
    }
  }

  return {
    singleCashFlow: {
      ...cashflowData,
      categories: project.categories.map((c) => ({ finance_category: c })),
    },
    project: { ...project, categories: project.categories },
  };
}

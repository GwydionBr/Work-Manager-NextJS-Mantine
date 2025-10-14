"use server";

import { createClient } from "@/utils/supabase/server";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";
import { SingleCashFlow } from "@/types/finance.types";

interface PayoutHourlyTimerProjectProps {
  project: WorkProject;
  title: string;
  timeEntries: WorkTimeEntry[];
}

export async function payoutHourlyTimerProject({
  project,
  title,
  timeEntries,
}: PayoutHourlyTimerProjectProps): Promise<{
  singleCashFlow: SingleCashFlow;
}> {
  const supabase = await createClient();

  const totalAmount = timeEntries
    .reduce(
      (acc, timeEntry) =>
        acc + timeEntry.salary * (timeEntry.active_seconds / 3600),
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

  const { error: timeEntryError } = await supabase
    .from("timer_session")
    .update({
      single_cash_flow_id: cashflowData.id,
    })
    .in(
      "id",
      timeEntries.map((timeEntry) => timeEntry.id)
    )
    .select();

  if (timeEntryError) {
    throw new Error(timeEntryError.message);
  }

  return {
    singleCashFlow: {
      ...cashflowData,
      categories: project.categories.map((c) => ({ finance_category: c })),
    },
  };
}

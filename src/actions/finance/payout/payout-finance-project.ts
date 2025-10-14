"use server";

import { FinanceProject, SingleCashFlow } from "@/types/finance.types";
import { createClient } from "@/utils/supabase/server";

export async function payoutFinanceProject(
  financeProject: FinanceProject,
  locale: string,
  payoutWholeProject: boolean
): Promise<{
  financeProject: FinanceProject;
  cashflows: SingleCashFlow[];
}> {
  const supabase = await createClient();
  const cashflows: SingleCashFlow[] = [];
  let newFinanceProject: FinanceProject = financeProject;

  if (payoutWholeProject) {
    // TODO handle whole project payout
    throw new Error("Whole project payout is not implemented yet");
  } else {
    const { data: cashflow, error: cashflowError } = await supabase
      .from("single_cash_flow")
      .insert({
        title: `${financeProject.title} (${locale === "de" ? "Auszahlung" : "Payout"})`,
        amount: financeProject.start_amount,
        currency: financeProject.currency,
        finance_project_id: financeProject.id,
      })
      .select()
      .single();

    if (cashflowError) {
      throw new Error(cashflowError.message);
    }

    const { error: categoriesError } = await supabase
      .from("single_cash_flow_category")
      .insert(
        financeProject.categories.map((c) => ({
          single_cash_flow_id: cashflow.id,
          finance_category_id: c.finance_category.id,
        }))
      );

    if (categoriesError) {
      throw new Error(categoriesError.message);
    }

    cashflows.push({ ...cashflow, categories: financeProject.categories });

    const { data: financeProjectData, error: financeProjectError } =
      await supabase
        .from("finance_project")
        .update({
          single_cash_flow_id: cashflow.id,
        })
        .eq("id", financeProject.id)
        .select()
        .single();

    if (financeProjectError) {
      throw new Error(financeProjectError.message);
    }

    newFinanceProject = {
      ...financeProject,
      ...financeProjectData,
    };
  }

  return { financeProject: newFinanceProject, cashflows };
}

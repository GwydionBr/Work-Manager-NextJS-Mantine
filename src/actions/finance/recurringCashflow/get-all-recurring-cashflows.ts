"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllRecurringCashFlows(){
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .select(
      "*, categories:recurring_cash_flow_category(finance_category:finance_category_id(*))"
    )
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((cashFlow) => {
    const { categories, ...rest } = cashFlow;
    return {
      ...rest,
      categoryIds: categories.map((category) => category.finance_category.id),
    };
  });

}

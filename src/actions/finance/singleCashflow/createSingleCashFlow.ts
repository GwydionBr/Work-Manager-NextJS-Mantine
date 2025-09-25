"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, Tables } from "@/types/db.types";
import { ApiResponseSingle } from "@/types/action.types";
import { StoreSingleCashFlow } from "@/types/finance.types";

interface CreateSingleCashFlowProps {
  cashFlow: TablesInsert<"single_cash_flow">;
  categoryIds: string[];
}

export async function createSingleCashFlow({
  cashFlow,
  categoryIds,
}: CreateSingleCashFlowProps): Promise<ApiResponseSingle<StoreSingleCashFlow>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("single_cash_flow")
    .insert({ ...cashFlow })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { error: categoriesError } = await supabase
    .from("single_cash_flow_category")
    .insert(
      categoryIds.map((id) => ({
        single_cash_flow_id: data.id,
        finance_category_id: id,
      }))
    )
    .select();

  if (categoriesError) {
    return { success: false, data: null, error: categoriesError.message };
  }

  return { success: true, data: { ...data, categoryIds }, error: null };
}

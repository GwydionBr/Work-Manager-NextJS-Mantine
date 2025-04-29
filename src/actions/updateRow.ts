import { createClient } from "@/utils/supabase/server";
import { TableNames, DeleteResponse } from "@/types/action.types_new";
import { TablesUpdate } from "@/types/db.types";

interface UpdateRowProps<T extends TableNames> {
  tableName: T;
  id: string;
  data: TablesUpdate<T>;
}

export async function updateRow<T extends TableNames>({
  tableName,
  id,
  data,
}: UpdateRowProps<T>): Promise<DeleteResponse> {
  const supabase = await createClient();
  
  const { data: updatedData, error } = await supabase
    .from(tableName)
    .update({ ...(data as any)})
    .eq("id", id)

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    data: null,
    error: null,
  };
}
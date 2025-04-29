import { createClient } from "@/utils/supabase/server";
import { TableNames, ApiResponseList } from "@/types/action.types_new";
import { TablesInsert, Tables } from "@/types/db.types";

interface CreateRowProps<T extends TableNames> {
  tableName: T;
  data: TablesInsert<T>;
}

export async function createRow<T extends TableNames>({
  tableName,
  data,
}: CreateRowProps<T>): Promise<ApiResponseList<T>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const insertData = { ...(data as any), user_id: user.id, id: undefined };

  const { data: createdData, error } = await supabase
    .from(tableName)
    .insert(insertData)
    .select("*");

  if (error) {
    console.log(error);
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    data: createdData as Tables<T>[],
    error: null,
  };
}

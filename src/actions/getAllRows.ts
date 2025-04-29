import { createClient } from "@/utils/supabase/server";
import { TableNames, ApiResponseList } from "@/types/action.types_new";
import { Tables } from "@/types/db.types";

export async function getAllRows<T extends TableNames>(
  tableName: T
): Promise<ApiResponseList<T>> {
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

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    data: data as Tables<T>[],
    error: null,
  };
}

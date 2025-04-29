import { createClient } from "@/utils/supabase/server";
import { SettingsResponse } from "@/types/action.types_new";
import { Tables } from "@/types/db.types";

interface Settings {
  id: string;
  user_id: string;
  default_currency: string;
  rounding_amount: string;
  rounding_direction: string;
}

export async function getSettings(): Promise<SettingsResponse> {
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
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    data: data as Tables<"settings">,
    error: null,
  };
}

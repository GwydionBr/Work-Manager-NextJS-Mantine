"use server";

import { SimpleResponse } from "@/types/action.types";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function deleteUser(): Promise<SimpleResponse> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const supabaseServer = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    console.error(error);
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

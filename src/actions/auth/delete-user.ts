"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function deleteUser(): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const supabaseServer = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser();

  if (!user || userError) {
    throw new Error("User not found");
  }

  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

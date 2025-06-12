"use server";

import { createClient } from "@/utils/supabase/server";

interface AuthFormData {
  email: string;
  name: string;
  password: string;
  terms: boolean;
}

export async function login(authFormData: AuthFormData): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: authFormData.email,
    password: authFormData.password,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

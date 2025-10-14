"use server";

import { Tables } from "@/types/db.types";
import { createClient } from "@/utils/supabase/server";

interface AuthFormData {
  email: string;
  password: string;
  terms: boolean;
}

export async function signup(
  authFormData: AuthFormData
): Promise<Tables<"profiles">> {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: authFormData.email,
    password: authFormData.password,
  };

  const { data: userData, error } = await supabase.auth.signUp(data);

  if (error) {
    throw new Error(error.message);
  }

  if (!userData.user) {
    throw new Error("User not found");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return profileData;
}

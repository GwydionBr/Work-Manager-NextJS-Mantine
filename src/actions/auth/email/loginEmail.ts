"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

interface AuthFormData {
  email: string;
  name: string;
  password: string;
  terms: boolean;
}

export async function login(authFormData: AuthFormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: authFormData.email,
    password: authFormData.password,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  redirect("/work");
}

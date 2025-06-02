"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

const rootUrl = process.env.NEXT_PUBLIC_ROOT_URL || "http://localhost:3000/";

export async function signInWithGithub() {
  const supabase = await createClient();
  const provider = "github";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${rootUrl}auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    redirect("/error");
  }

  redirect("/work");
}

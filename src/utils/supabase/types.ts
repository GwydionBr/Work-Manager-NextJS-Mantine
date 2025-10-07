import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

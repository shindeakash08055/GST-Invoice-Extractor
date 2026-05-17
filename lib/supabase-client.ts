"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let browserSupabaseClient: ReturnType<typeof createClient<Database>> | null =
  null;

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  if (!browserSupabaseClient) {
    browserSupabaseClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return browserSupabaseClient;
}

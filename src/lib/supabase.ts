import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://uzdjwpkgldzhnoxjeyrw.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ifsg2zxajGqu19GsJ2X4RQ_KHBHGIvi";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: typeof window !== "undefined", detectSessionInUrl: typeof window !== "undefined" },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization")?.startsWith("Bearer sb_publishable_")) headers.delete("Authorization");
        return fetch(input, { ...init, headers });
      },
    },
  },
);
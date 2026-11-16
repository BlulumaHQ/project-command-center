import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://uzdjwpkgldzhnoxjeyrw.supabase.co",
  "sb_publishable_ifsg2zxajGqu19GsJ2X4RQ_KHBHGIvi",
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
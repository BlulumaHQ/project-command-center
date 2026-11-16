import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const AuthContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export const useAuth = () => useContext(AuthContext);

export async function requireSignedIn() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw redirect({ to: "/login", replace: true });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: false });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    let revision = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      revision++;
      setAuth({ user: session?.user ?? null, ready: true });
      if (event === "SIGNED_OUT") {
        void queryClient.cancelQueries().then(() => queryClient.clear());
        void navigate({ to: "/login", replace: true });
      }
    });
    const initialRevision = revision;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && revision === initialRevision) setAuth({ user: data.user, ready: true });
    }).catch(() => { if (active && revision === initialRevision) setAuth({ user: null, ready: true }); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient, navigate]);
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
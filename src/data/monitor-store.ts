// NightClerk monitor: browser-only, auth-gated (same rules as the main data store).
// Tables nc_monitors / nc_runs / nc_alerts are written by the nc-report edge function.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type Light = "green" | "yellow" | "red";
export interface MonitorRow {
  id: string;
  client_name: string;
  job_name: string;
  status: Light;
  max_gap_hours: number;
  last_run_at: string | null;
  last_success_at: string | null;
  last_message: string | null;
  last_counts: Record<string, number> | null;
  active: boolean;
}
export interface CheckItem {
  name: string;
  ok: boolean;
  level: Light;
  detail: string;
}
export interface RunRow {
  id: number;
  monitor_id: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "ok" | "warn" | "blocked" | "failed";
  counts: Record<string, number> | null;
  checks: CheckItem[] | null;
  message: string | null;
  run_url: string | null;
}
export interface AlertRow {
  id: number;
  monitor_id: string;
  level: "red" | "yellow";
  title: string;
  body: string | null;
  pushed: boolean;
  emailed: boolean;
  created_at: string;
  resolved_at: string | null;
}

async function load() {
  if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
  const [m, r, a] = await Promise.all([
    supabase.from("nc_monitors").select("*").eq("active", true).order("client_name"),
    supabase.from("nc_runs").select("*").order("started_at", { ascending: false }).limit(60),
    supabase.from("nc_alerts").select("*").order("created_at", { ascending: false }).limit(30),
  ]);
  const err = m.error || r.error || a.error;
  if (err) throw new Error(err.message);
  return {
    monitors: (m.data ?? []) as MonitorRow[],
    runs: (r.data ?? []) as RunRow[],
    alerts: (a.data ?? []) as AlertRow[],
  };
}

export function useMonitor() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = ["nc", user?.id];
  const query = useQuery({
    queryKey: key,
    queryFn: load,
    enabled: ready && Boolean(user),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const resolve = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("nc_alerts")
        .update({ resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
  return { ...query, resolve };
}

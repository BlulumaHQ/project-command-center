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

// ── Website / domain / scheduled-job monitor (written by the site-monitor edge function) ──
export type SiteLight = Light | "grey";
export interface SiteRow {
  domain: string;
  name: string;
  grp: "own" | "client";
  managed: boolean;
  check_index: boolean;
  active: boolean;
  status: SiteLight;
  http_status: number | null;
  ms: number | null;
  final_url: string | null;
  title: string | null;
  noindex: boolean | null;
  fails: number;
  last_error: string | null;
  last_checked_at: string | null;
  last_ok_at: string | null;
  down_since: string | null;
  domain_expires: string | null;
}
export interface MonAlertRow {
  id: number;
  kind: "site" | "cron";
  ref: string;
  level: "red" | "yellow";
  title: string;
  body: string | null;
  pushed: boolean;
  emailed: boolean;
  created_at: string;
  resolved_at: string | null;
}
export interface CronRow {
  jobname: string;
  schedule: string;
  active: boolean;
  runs_24h: number;
  fails_24h: number;
  last_status: string | null;
  last_end: string | null;
  last_message: string | null;
}

async function loadSites() {
  if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
  const [s, a, c] = await Promise.all([
    supabase.from("mon_sites").select("*").eq("active", true).order("name"),
    supabase.from("mon_alerts").select("*").is("resolved_at", null).order("created_at", { ascending: false }).limit(50),
    supabase.rpc("mon_cron_health"),
  ]);
  const err = s.error || a.error || c.error;
  if (err) throw new Error(err.message);
  return {
    sites: (s.data ?? []) as SiteRow[],
    alerts: (a.data ?? []) as MonAlertRow[],
    jobs: ((c.data ?? []) as CronRow[]).map((j) => ({ ...j, runs_24h: Number(j.runs_24h), fails_24h: Number(j.fails_24h) })),
  };
}

export function useSiteMonitor() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = ["mon-sites", user?.id];
  const query = useQuery({
    queryKey: key,
    queryFn: loadSites,
    enabled: ready && Boolean(user),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const refresh = () => void client.invalidateQueries({ queryKey: key });
  const resolveAlert = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("mon_alerts").update({ resolved_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSettled: refresh,
  });
  const runNow = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("site-monitor", { body: { action: "run" } });
      if (error) throw new Error(error.message);
    },
    onSettled: refresh,
  });
  const addSite = useMutation({
    mutationFn: async (s: { domain: string; name: string; grp: "own" | "client" }) => {
      const domain = s.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      if (!domain.includes(".")) throw new Error("網址格式不對");
      const { error } = await supabase
        .from("mon_sites")
        .upsert({ domain, name: s.name.trim() || domain, grp: s.grp, active: true });
      if (error) throw new Error(error.message);
    },
    onSettled: refresh,
  });
  const removeSite = useMutation({
    mutationFn: async (domain: string) => {
      const { error } = await supabase.from("mon_sites").update({ active: false }).eq("domain", domain);
      if (error) throw new Error(error.message);
    },
    onSettled: refresh,
  });
  return { ...query, resolveAlert, runNow, addSite, removeSite };
}

// HQ 2.1 autopilot: morning-report proposals and the pause switch. Browser-only queries (RLS enforces access).
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface ProposalOption { key: string; label: string; detail?: string; task_ids?: string[] }
export interface ProposalRow {
  id: string; project_id: string | null; kind: "decision" | "confirm_done"; question: string;
  options: ProposalOption[]; recommended: string | null; reason: string | null; task_ids: string[] | null;
  choice: string | null; sony_note: string | null; status: "open" | "answered" | "expired";
  created_at: string; answered_at: string | null;
}
export interface AutopilotSettings {
  paused: boolean; daily_task_cap: number; max_decisions_per_day: number; followup_days: number;
  busy_projects: string[]; goal_projects: string[];
}
export interface RunRow {
  id: string; agent_id: string; summary: string; outcome: string; created_at: string;
  started_at: string | null; finished_at: string | null; task_ids: string[] | null; model: string | null; error: string | null;
}
interface TaskLite { id: string; project_id: string; title: string; note: string | null; status: string; grp: string; owner: string | null; approval: string; done_at: string | null; evidence: string | null; result_url: string | null; locked_at: string | null; fail_count: number; due_date: string | null }

const DEFAULTS: AutopilotSettings = { paused: false, daily_task_cap: 8, max_decisions_per_day: 5, followup_days: 4, busy_projects: [], goal_projects: [] };
const DAY = 86_400_000;

async function select<T>(build: () => PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
  const { data, error } = await build();
  if (error) throw new Error(error.message);
  return data as T;
}

/** Pure helper: a run is healthy when it finished without error. Exported for tests. */
export function runHealth(runs: RunRow[], now = Date.now()) {
  const recent = runs.filter((r) => now - Date.parse(r.started_at ?? r.created_at) < 20 * 3600_000);
  const problems = recent.filter((r) => ["broken", "error"].includes(r.outcome) || (!r.finished_at && r.started_at && now - Date.parse(r.started_at) > 3 * 3600_000));
  return { recent, problems, ok: recent.length > 0 && problems.length === 0 };
}

/** Pure helper: what undoing an answer must put back. Exported for tests. */
export function undoPlan(p: ProposalRow) {
  const ids = [...new Set([...(p.task_ids ?? []), ...p.options.flatMap((o) => o.task_ids ?? [])])];
  if (p.kind === "confirm_done") return { reopenTasks: p.choice === "yes" ? (p.task_ids ?? []) : [], resetApproval: [] as string[] };
  return { reopenTasks: [] as string[], resetApproval: ids };
}

/** Label shown for an answered proposal, e.g. "A · 12/15 前 100 位註冊用戶". */
export function choiceLabel(p: ProposalRow) {
  if (p.choice === "skip") return "先不要";
  if (p.kind === "confirm_done") return p.choice === "yes" ? "做完了" : "還沒";
  const o = p.options.find((x) => x.key === p.choice);
  return o ? `${o.key} · ${o.label}` : (p.choice ?? "");
}

export function useAutopilot() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const enabled = ready && Boolean(user);
  const key = (k: string) => ["autopilot", user?.id, k];
  const since = new Date(Date.now() - 2 * DAY).toISOString();
  const [proposalsQ, settingsQ, runsQ, tasksQ] = useQueries({ queries: [
    { enabled, staleTime: 30_000, queryKey: key("proposals"), queryFn: () => select<ProposalRow[]>(() => supabase.from("pcc_proposals").select("*").or(`status.eq.open,answered_at.gte.${since}`).order("created_at", { ascending: false })) },
    { enabled, staleTime: 30_000, queryKey: key("settings"), queryFn: () => select<{ value: Partial<AutopilotSettings> } | null>(() => supabase.from("pcc_meta").select("value").eq("key", "autopilot").maybeSingle()) },
    { enabled, staleTime: 30_000, queryKey: key("runs"), queryFn: () => select<RunRow[]>(() => supabase.from("pcc_agent_runs").select("*").gte("created_at", since).order("created_at", { ascending: false })) },
    { enabled, staleTime: 30_000, queryKey: key("tasks"), queryFn: () => select<TaskLite[]>(() => supabase.from("pcc_tasks").select("id,project_id,title,note,status,grp,owner,approval,done_at,evidence,result_url,locked_at,fail_count,due_date")) },
  ] });
  const settings: AutopilotSettings = { ...DEFAULTS, ...(settingsQ.data?.value ?? {}) };
  const tasks = tasksQ.data ?? [];
  const refresh = () => { ["proposals", "settings", "runs", "tasks"].forEach((k) => { void client.invalidateQueries({ queryKey: key(k) }); }); void client.invalidateQueries({ queryKey: ["pcc", user?.id] }); };

  const answer = async (p: ProposalRow, choice: string, note = "") => {
    const nowIso = new Date().toISOString();
    client.setQueryData<ProposalRow[]>(key("proposals"), (list) => (list ?? []).map((x) => x.id === p.id ? { ...x, status: "answered", choice, sony_note: note || null, answered_at: nowIso } : x));
    try {
      const { error } = await supabase.from("pcc_proposals").update({ status: "answered", choice, sony_note: note || null, answered_at: nowIso }).eq("id", p.id).eq("status", "open");
      if (error) throw error;
      const ids = p.task_ids ?? [];
      if (p.kind === "confirm_done") {
        if (choice === "yes" && ids.length) {
          const { error: e } = await supabase.from("pcc_tasks").update({ status: "done", done: true, done_at: nowIso, evidence: "Sony 在晨報確認做完", locked_by: null }).in("id", ids);
          if (e) throw e;
        }
      } else {
        const picked = p.options.find((o) => o.key === choice);
        const approve = picked?.task_ids?.length ? picked.task_ids : choice === "skip" ? [] : ids;
        const reject = [...new Set([...ids, ...p.options.flatMap((o) => o.task_ids ?? [])])].filter((id) => !approve.includes(id));
        if (approve.length) { const { error: e } = await supabase.from("pcc_tasks").update({ approval: "approved" }).in("id", approve); if (e) throw e; }
        if (reject.length) { const { error: e } = await supabase.from("pcc_tasks").update({ approval: "rejected" }).in("id", reject); if (e) throw e; }
      }
      toast.success(p.kind === "confirm_done" ? (choice === "yes" ? "已標完成" : "好，繼續追") : "收到，AI 會照這個方向做");
    } catch (e) {
      toast.error(`儲存失敗：${e instanceof Error ? e.message : String(e)}`);
    } finally { refresh(); }
  };

  /** Put an answered proposal back to open and revert what answering changed on its tasks. */
  const undo = async (p: ProposalRow) => {
    client.setQueryData<ProposalRow[]>(key("proposals"), (list) => (list ?? []).map((x) => x.id === p.id ? { ...x, status: "open", choice: null, sony_note: null, answered_at: null } : x));
    try {
      const { error } = await supabase.from("pcc_proposals").update({ status: "open", choice: null, sony_note: null, answered_at: null }).eq("id", p.id).eq("status", "answered");
      if (error) throw error;
      const plan = undoPlan(p);
      if (plan.resetApproval.length) { const { error: e } = await supabase.from("pcc_tasks").update({ approval: "needed" }).in("id", plan.resetApproval); if (e) throw e; }
      if (plan.reopenTasks.length) { const { error: e } = await supabase.from("pcc_tasks").update({ status: "todo", done: false, done_at: null, evidence: null }).in("id", plan.reopenTasks); if (e) throw e; }
      toast.success("已改回，可以重新選");
    } catch (e) {
      toast.error(`改回失敗：${e instanceof Error ? e.message : String(e)}`);
    } finally { refresh(); }
  };

  const setPaused = async (paused: boolean) => {
    const value = { ...settings, paused };
    client.setQueryData(key("settings"), { value });
    const { error } = await supabase.from("pcc_meta").update({ value }).eq("key", "autopilot");
    if (error) toast.error(`儲存失敗：${error.message}`); else toast.success(paused ? "已暫停全部自動化" : "自動化恢復運作");
    refresh();
  };

  const proposals = proposalsQ.data ?? [];
  const runs = runsQ.data ?? [];
  const now = Date.now();
  return {
    loading: !enabled || [proposalsQ, settingsQ, runsQ, tasksQ].some((q) => q.isPending),
    error: [proposalsQ, settingsQ, runsQ, tasksQ].find((q) => q.error)?.error?.message ?? null,
    retry: refresh,
    settings,
    setPaused,
    answer,
    undo,
    decisions: proposals.filter((p) => p.status === "open" && p.kind === "decision"),
    confirms: proposals.filter((p) => p.status === "open" && p.kind === "confirm_done"),
    answered: proposals.filter((p) => p.status === "answered"),
    health: runHealth(runs, now),
    runs,
    stuck: tasks.filter((t) => t.status !== "done" && t.status !== "cancelled" && ((t.locked_at && now - Date.parse(t.locked_at) > 3 * 3600_000) || t.fail_count >= 2)),
    sonySteps: tasks.filter((t) => t.status !== "done" && t.status !== "cancelled" && t.owner === "sony" && t.grp === "next").sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999")).slice(0, 5),
    doneOvernight: tasks.filter((t) => t.done_at && now - Date.parse(t.done_at) < 24 * 3600_000).sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? "")),
    touchedToday: runs.filter((r) => now - Date.parse(r.created_at) < DAY).reduce((n, r) => n + (r.task_ids?.length ?? 0), 0),
    modelsToday: [...new Set(runs.filter((r) => now - Date.parse(r.created_at) < DAY).map((r) => r.model).filter(Boolean))] as string[],
  };
}

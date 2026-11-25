// Single access point for authenticated browser data; never query from route loaders.
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatDate, getProgress, latestSync, mapProject, recentProjects, taskStatus, type ProjectRow, type TaskRow, type LogRow, type NoteRow } from "./mapping";
import type { Status, Deadline, ChainStep, WaitingItem } from "./types";
import type { TableTask, TaskStatus } from "./tasks";

export { getProgress };
export type { NoteRow };
export const statusLabel: Record<Status, string> = { progress: "進行中", waiting: "等待中", deadline: "有時限", almost: "快完成", done: "已完成" };
interface DeadlineRow { id: string; title: string; detail: string | null; when_label: string | null; level: Deadline["level"]; }
interface WaitingRow { id: string; initials: string; who: string; project_label: string; what: string; }
interface MetaRow { key: string; value: unknown; }
export type AgentStatus = "ok" | "check" | "broken" | "idle";
const AGENT_STATUSES: AgentStatus[] = ["ok", "check", "broken", "idle"];
/** Scheduled agents may write other words (running / error); map them onto the four HQ states. */
export function normalizeAgentStatus(s: string): AgentStatus {
  if ((AGENT_STATUSES as string[]).includes(s)) return s as AgentStatus;
  return s === "error" || s === "failed" ? "broken" : s === "running" ? "ok" : "idle";
}
export interface AgentRow { id: string; name: string; name_zh: string; role: string; skill: string | null; trigger_hint: string | null; avatar: string; is_manager: boolean; status: AgentStatus; status_note: string | null; last_run_at: string | null; sort: number; }
export interface AgentRunRow { id: string; agent_id: string; project_id: string | null; summary: string; outcome: "ok" | "check" | "broken"; created_at: string; }
export type LearnStatus = "new" | "todo" | "done" | "skip";
export interface LearnRow { id: string; url: string; author: string | null; title: string | null; summary: string | null; category: string | null; usefulness: number | null; action: string | null; status: LearnStatus; source: string; created_at: string; }
export interface FocusItem { title: string; project_id?: string; task_id?: string; why?: string; }

async function readTable<T>(table: string, order = "sort", filter?: [string, boolean]): Promise<T[]> {
  if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
  let request = supabase.from(table).select("*").order(order, { ascending: order !== "created_at" });
  if (filter) request = request.eq(filter[0], filter[1]);
  const { data, error } = await request;
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

async function run(p: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await p;
  if (error) throw new Error(error.message);
}

type Table = "pcc_tasks" | "pcc_notes";
interface Op { table: Table; apply: (rows: never[]) => unknown[]; exec: () => Promise<void>; }

export function useStore() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = (table: string) => ["pcc", user?.id, table];
  const enabled = ready && Boolean(user);
  const options = { enabled, staleTime: 30_000, retry: 1 };
  const [projectsQuery, tasksQuery, deadlinesQuery, chainQuery, waitingQuery, logQuery, metaQuery, notesQuery, agentsQuery, runsQuery, learnQuery] = useQueries({ queries: [
    { ...options, queryKey: key("pcc_projects"), queryFn: () => readTable<ProjectRow>("pcc_projects", "sort", ["archived", false]) },
    { ...options, queryKey: key("pcc_tasks"), queryFn: () => readTable<TaskRow>("pcc_tasks") },
    { ...options, queryKey: key("pcc_deadlines"), queryFn: () => readTable<DeadlineRow>("pcc_deadlines", "sort", ["done", false]) },
    { ...options, queryKey: key("pcc_chain"), queryFn: () => readTable<ChainStep>("pcc_chain") },
    { ...options, queryKey: key("pcc_waiting"), queryFn: () => readTable<WaitingRow>("pcc_waiting", "sort", ["resolved", false]) },
    { ...options, queryKey: key("pcc_log"), queryFn: () => readTable<LogRow>("pcc_log", "created_at") },
    { ...options, queryKey: key("pcc_meta"), queryFn: () => readTable<MetaRow>("pcc_meta", "key") },
    { ...options, queryKey: key("pcc_notes"), queryFn: () => readTable<NoteRow>("pcc_notes", "created_at") },
    { ...options, queryKey: key("pcc_agents"), queryFn: () => readTable<AgentRow>("pcc_agents").then((list) => list.map((a) => ({ ...a, status: normalizeAgentStatus(a.status) }))) },
    { ...options, queryKey: key("pcc_agent_runs"), queryFn: () => readTable<AgentRunRow>("pcc_agent_runs", "created_at") },
    { ...options, queryKey: key("pcc_learning"), queryFn: () => readTable<LearnRow>("pcc_learning", "created_at") },
  ] });

  const mutation = useMutation({
    mutationFn: (op: Op) => op.exec(),
    onMutate: async (op) => {
      await client.cancelQueries({ queryKey: key(op.table) });
      const previous = client.getQueryData<unknown[]>(key(op.table));
      client.setQueryData<unknown[]>(key(op.table), (rows) => op.apply((rows ?? []) as never[]));
      return { previous };
    },
    onError: (error, op, context) => {
      if (context?.previous) client.setQueryData(key(op.table), context.previous);
      toast.error(`儲存失敗：${error.message}`);
    },
    onSettled: () => { ["pcc_tasks", "pcc_projects", "pcc_notes"].forEach((t) => { void client.invalidateQueries({ queryKey: key(t) }); }); },
  });
  const patchTask = (taskId: string, patch: Partial<TaskRow>, remote: Record<string, unknown>) => mutation.mutate({
    table: "pcc_tasks",
    apply: (rows: TaskRow[]) => rows.map((t) => t.id === taskId ? { ...t, ...patch, updated_at: new Date().toISOString() } : t),
    exec: () => run(supabase.from("pcc_tasks").update(remote).eq("id", taskId)),
  } as Op);

  const queries = [projectsQuery, tasksQuery, deadlinesQuery, chainQuery, waitingQuery, logQuery, metaQuery, notesQuery, agentsQuery, runsQuery, learnQuery];
  const rows = projectsQuery.data ?? [];
  const taskRows = tasksQuery.data ?? [];
  const noteRows = notesQuery.data ?? [];
  const projects = rows.map((p) => mapProject(p, taskRows));
  const metaValue = (name: string) => { const value = metaQuery.data?.find((m) => m.key === name)?.value; return typeof value === "string" ? value : ""; };

  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    const done = status === "done";
    // Cancelled counts as closed (done = true) so open counts ignore it, but gets no done_at.
    patchTask(taskId, { status, done: done || status === "cancelled", done_at: done ? new Date().toISOString() : null }, { status });
  };

  return {
    // Only the core project data blocks the page; agent / learning tables degrade to empty lists.
    loading: !enabled || queries.slice(0, 8).some((q) => q.isPending),
    error: queries.slice(0, 8).find((q) => q.error)?.error?.message ?? null,
    retry: () => { queries.forEach((q) => { void q.refetch(); }); },
    getMeta: () => ({ lastSynced: latestSync(rows, taskRows), resumeProjectId: metaValue("resume_project_id"), secondaryNext: metaValue("secondary_next") }),
    getProjects: () => projects,
    getRecentProjects: () => recentProjects(rows, taskRows, logQuery.data ?? []),
    getProject: (id: string) => projects.find((p) => p.id === id),
    getDeadlines: (): Deadline[] => (deadlinesQuery.data ?? []).map((d) => ({ title: d.title, detail: d.detail ?? "", when: d.when_label ?? "", level: d.level })),
    getChain: () => chainQuery.data ?? [],
    getWaiting: (): WaitingItem[] => (waitingQuery.data ?? []).map((w) => ({ initials: w.initials, who: w.who, project: w.project_label, what: w.what })),
    getAgents: () => agentsQuery.data ?? [],
    setAgentStatus: async (agentId: string, status: AgentStatus, note: string | null = null) => {
      client.setQueryData<AgentRow[]>(key("pcc_agents"), (list) => (list ?? []).map((a) => a.id === agentId ? { ...a, status, status_note: note } : a));
      const { error } = await supabase.from("pcc_agents").update({ status, status_note: note, updated_at: new Date().toISOString() }).eq("id", agentId);
      if (error) toast.error(`儲存失敗：${error.message}`);
      void client.invalidateQueries({ queryKey: key("pcc_agents") });
    },
    getAgentRuns: (agentId?: string) => (runsQuery.data ?? []).filter((r) => !agentId || r.agent_id === agentId),
    getAllLogs: () => logQuery.data ?? [],
    getLearning: () => learnQuery.data ?? [],
    setLearnStatus: async (id: string, status: LearnStatus) => {
      client.setQueryData<LearnRow[]>(key("pcc_learning"), (list) => (list ?? []).map((l) => l.id === id ? { ...l, status } : l));
      const { error } = await supabase.from("pcc_learning").update({ status }).eq("id", id);
      if (error) toast.error(`儲存失敗：${error.message}`);
    },
    getFocus: (): FocusItem[] => {
      const value = metaQuery.data?.find((m) => m.key === "today_focus")?.value;
      return Array.isArray(value) ? (value as FocusItem[]).filter((f) => f && typeof f.title === "string").slice(0, 6) : [];
    },
    getLogs: (projectId: string) => (logQuery.data ?? []).filter((l) => l.project_id === projectId).slice(0, 5).map((l) => ({ ...l, date: formatDate(l.created_at) })),
    getTableTasks: (): TableTask[] => {
      const order = new Map(rows.map((p, i) => [p.id, i]));
      return taskRows.flatMap((t) => {
        const projectSort = order.get(t.project_id);
        const project = projectSort === undefined ? undefined : rows[projectSort];
        if (projectSort === undefined || !project) return [];
        return [{
        id: t.id, projectId: t.project_id, projectName: project.name, projectSort, grp: t.grp, sort: t.sort ?? 0,
        title: t.title, note: t.note ?? undefined, status: taskStatus(t), dueDate: t.due_date, doneAt: t.done_at, updatedAt: t.updated_at,
        }];
      });
    },
    getTaskStatus: (taskId: string): TaskStatus | undefined => { const t = taskRows.find((r) => r.id === taskId); return t ? taskStatus(t) : undefined; },
    getNotes: (projectId?: string) => noteRows.filter((n) => !projectId || n.project_id === projectId).slice(0, 5),
    unprocessedNotes: noteRows.filter((n) => !n.processed).length,
    setTaskStatus,
    setTaskDue: (taskId: string, due: string | null) => patchTask(taskId, { due_date: due }, { due_date: due }),
    renameTask: (taskId: string, title: string) => { if (title.trim()) patchTask(taskId, { title: title.trim() }, { title: title.trim() }); },
    addTask: (projectId: string, title: string) => {
      const clean = title.trim();
      if (!clean || !projectId) return;
      const sort = Math.max(0, ...taskRows.filter((t) => t.project_id === projectId).map((t) => t.sort ?? 0)) + 1;
      const row = { id: crypto.randomUUID(), project_id: projectId, title: clean, grp: "next" as const, status: "todo" as const, sort };
      mutation.mutate({
        table: "pcc_tasks",
        apply: (list: TaskRow[]) => [...list, { ...row, note: null, done: false, due_date: null, done_at: null, updated_at: new Date().toISOString() }],
        exec: () => run(supabase.from("pcc_tasks").insert(row)),
      } as Op, { onSuccess: () => toast.success(`已加到 ${rows.find((p) => p.id === projectId)?.name ?? "專案"}`) });
      return row.id;
    },
    addNote: (projectId: string | null, body: string) => {
      const clean = body.trim();
      if (!clean) return;
      const row = { id: crypto.randomUUID(), project_id: projectId, body: clean };
      mutation.mutate({
        table: "pcc_notes",
        apply: (list: NoteRow[]) => [{ ...row, processed: false, reply: null, created_at: new Date().toISOString(), processed_at: null }, ...list],
        exec: () => run(supabase.from("pcc_notes").insert(row)),
      } as Op);
    },
    deleteNote: (noteId: string) => mutation.mutate({
      table: "pcc_notes",
      apply: (list: NoteRow[]) => list.filter((n) => n.id !== noteId),
      exec: () => run(supabase.from("pcc_notes").delete().eq("id", noteId).eq("processed", false)),
    } as Op),
  };
}

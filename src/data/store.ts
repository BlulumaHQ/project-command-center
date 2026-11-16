// Single access point for authenticated browser data; never query from route loaders.
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatDate, getProgress, latestSync, mapProject, type ProjectRow, type TaskRow, type LogRow } from "./mapping";
import type { Status, Deadline, ChainStep, WaitingItem } from "./types";

export { getProgress };
export const statusLabel: Record<Status, string> = { progress: "進行中", waiting: "等待中", deadline: "有時限", almost: "快完成", done: "已完成" };
interface DeadlineRow { id: string; title: string; detail: string | null; when_label: string | null; level: Deadline["level"]; }
interface WaitingRow { id: string; initials: string; who: string; project_label: string; what: string; }
interface MetaRow { key: string; value: unknown; }

async function readTable<T>(table: string, order = "sort", filter?: [string, boolean]): Promise<T[]> {
  if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
  let request = supabase.from(table).select("*").order(order, { ascending: order !== "created_at" });
  if (filter) request = request.eq(filter[0], filter[1]);
  const { data, error } = await request;
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

export function useStore() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = (table: string) => ["pcc", user?.id, table];
  const enabled = ready && Boolean(user);
  const options = { enabled, staleTime: 30_000, retry: 1 };
  const [projectsQuery, tasksQuery, deadlinesQuery, chainQuery, waitingQuery, logQuery, metaQuery] = useQueries({ queries: [
    { ...options, queryKey: key("pcc_projects"), queryFn: () => readTable<ProjectRow>("pcc_projects", "sort", ["archived", false]) },
    { ...options, queryKey: key("pcc_tasks"), queryFn: () => readTable<TaskRow>("pcc_tasks") },
    { ...options, queryKey: key("pcc_deadlines"), queryFn: () => readTable<DeadlineRow>("pcc_deadlines", "sort", ["done", false]) },
    { ...options, queryKey: key("pcc_chain"), queryFn: () => readTable<ChainStep>("pcc_chain") },
    { ...options, queryKey: key("pcc_waiting"), queryFn: () => readTable<WaitingRow>("pcc_waiting", "sort", ["resolved", false]) },
    { ...options, queryKey: key("pcc_log"), queryFn: () => readTable<LogRow>("pcc_log", "created_at") },
    { ...options, queryKey: key("pcc_meta"), queryFn: () => readTable<MetaRow>("pcc_meta", "key") },
  ] });
  const toggle = useMutation({
    mutationFn: async ({ taskId, projectId, done }: { taskId: string; projectId: string; done: boolean }) => {
      const { data, error } = await supabase.from("pcc_tasks").update({ done }).eq("id", taskId).eq("project_id", projectId).select("id").single();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("沒有權限更新此待辦");
    },
    onMutate: async ({ taskId, done }) => {
      await client.cancelQueries({ queryKey: key("pcc_tasks") });
      const previous = client.getQueryData<TaskRow[]>(key("pcc_tasks"));
      client.setQueryData<TaskRow[]>(key("pcc_tasks"), (rows) => rows?.map((t) => t.id === taskId ? { ...t, done } : t));
      return { previous };
    },
    onError: (_error, _variables, context) => { if (context?.previous) client.setQueryData(key("pcc_tasks"), context.previous); },
    onSettled: () => { void client.invalidateQueries({ queryKey: key("pcc_tasks") }); void client.invalidateQueries({ queryKey: key("pcc_projects") }); },
  });
  const queries = [projectsQuery, tasksQuery, deadlinesQuery, chainQuery, waitingQuery, logQuery, metaQuery];
  const rows = projectsQuery.data ?? [];
  const taskRows = tasksQuery.data ?? [];
  const projects = rows.map((p) => mapProject(p, taskRows));
  const metaValue = (name: string) => { const value = metaQuery.data?.find((m) => m.key === name)?.value; return typeof value === "string" ? value : ""; };
  return {
    loading: !enabled || queries.some((q) => q.isPending),
    error: queries.find((q) => q.error)?.error?.message ?? null,
    retry: () => { queries.forEach((q) => { void q.refetch(); }); },
    mutationError: toggle.error?.message ?? null,
    dismissMutationError: toggle.reset,
    taskPending: toggle.isPending,
    getMeta: () => ({ lastSynced: latestSync(rows, taskRows), resumeProjectId: metaValue("resume_project_id"), secondaryNext: metaValue("secondary_next") }),
    getProjects: () => projects,
    getProject: (id: string) => projects.find((p) => p.id === id),
    getDeadlines: (): Deadline[] => (deadlinesQuery.data ?? []).map((d) => ({ title: d.title, detail: d.detail ?? "", when: d.when_label ?? "", level: d.level })),
    getChain: () => chainQuery.data ?? [],
    getWaiting: (): WaitingItem[] => (waitingQuery.data ?? []).map((w) => ({ initials: w.initials, who: w.who, project: w.project_label, what: w.what })),
    getLogs: (projectId: string) => (logQuery.data ?? []).filter((l) => l.project_id === projectId).slice(0, 5).map((l) => ({ ...l, date: formatDate(l.created_at) })),
    toggleTask: (projectId: string, taskId: string) => {
      const task = taskRows.find((t) => t.id === taskId && t.project_id === projectId);
      if (task && !toggle.isPending) toggle.mutate({ projectId, taskId, done: !task.done });
    },
  };
}

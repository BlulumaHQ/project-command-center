import type { Project, Task, Status, Category, Phase, LinkRow } from "./types";
import type { TaskStatus } from "./tasks";

export interface ProjectRow {
  archived?: boolean; id: string; name: string; brand: string; category: Category; status: Status; pct: number;
  next_step: string; open_count: number; description: string | null; now_title: string | null;
  now_note: string | null; handoff: string | null; decisions: string[] | null; links: LinkRow[] | null;
  phases: Phase[] | null; undecided: string | null; updated_at: string | null;
}
export interface TaskRow { id: string; project_id: string; title: string; note: string | null; grp: "next" | "later"; done: boolean; updated_at: string | null;
  status: TaskStatus | null; due_date: string | null; done_at: string | null; sort: number | null; }
export interface NoteRow { id: string; project_id: string | null; body: string; processed: boolean; reply: string | null; created_at: string; processed_at: string | null; }

export function taskStatus(t: Pick<TaskRow, "status" | "done">): TaskStatus { return t.status ?? (t.done ? "done" : "todo"); }
export interface LogRow { id: string; project_id: string; summary: string; created_at: string; }

export function formatDate(value: string | null | undefined, time = false) {
  if (!value || Number.isNaN(Date.parse(value))) return "—";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Vancouver", month: "2-digit", day: "2-digit",
    ...(time ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" as const } : {}),
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("month")}/${part("day")}${time ? ` ${part("hour")}:${part("minute")}` : ""}`;
}

export function mapProject(row: ProjectRow, taskRows: TaskRow[]): Project {
  const tasks: Task[] = taskRows.filter((t) => t.project_id === row.id).map((t) => {
    const status = taskStatus(t);
    return { id: t.id, title: t.title, note: t.note ?? undefined, group: status === "done" ? "done" : t.grp, done: status === "done", status, dueDate: t.due_date, doneAt: t.done_at };
  });
  return {
    id: row.id, name: row.name, brand: row.brand ?? "", category: row.category, status: row.status,
    pct: row.pct ?? 0, next: row.next_step ?? "", open: row.open_count ?? 0, updated: formatDate(row.updated_at),
    ...((row.now_title || tasks.length > 0) ? { detail: {
      description: row.description ?? "", phases: row.phases ?? [], now: { title: row.now_title || row.next_step || "", note: row.now_note ?? "" },
      tasks, handoff: row.handoff ?? "", decisions: row.decisions ?? [], links: row.links ?? [], undecided: row.undecided ?? "",
    } } : {}),
  };
}

export function getProgress(project: Project) {
  const tasks = project.detail?.tasks ?? [];
  const done = tasks.filter((t) => t.done).length;
  // Tasks are the checklist: once a project has any, its % is done / total (all done = 100%).
  // Projects with no tasks yet fall back to the manual estimate; status "done" is always 100%.
  const pct = project.status === "done" ? 100 : tasks.length ? Math.round(done / tasks.length * 100) : project.pct;
  return { done, total: tasks.length, pct, open: tasks.length ? tasks.length - done : project.open };
}

export function latestSync(projects: ProjectRow[], tasks: TaskRow[]) {
  const timestamps = [...projects, ...tasks].map((r) => r.updated_at).filter((v): v is string => Boolean(v) && !Number.isNaN(Date.parse(v ?? "")));
  return formatDate(timestamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0], true);
}
export function recentProjects(projects: ProjectRow[], tasks: TaskRow[], logs: LogRow[]) {
  const timestamp = (value: string | null) => value && !Number.isNaN(Date.parse(value)) ? Date.parse(value) : 0;
  const activity = new Map<string, number>();
  for (const task of tasks) activity.set(task.project_id, Math.max(activity.get(task.project_id) ?? 0, timestamp(task.updated_at)));
  for (const log of logs) activity.set(log.project_id, Math.max(activity.get(log.project_id) ?? 0, timestamp(log.created_at)));
  return projects.filter((p) => !p.archived).map((p) => ({ id: p.id, name: p.name, next: p.next_step, activityAt: Math.max(timestamp(p.updated_at), activity.get(p.id) ?? 0) }))
    .sort((a, b) => b.activityAt - a.activityAt).slice(0, 3);
}

export function relativeActivityTime(timestamp: number, now = Date.now()) {
  if (!timestamp) return "—";
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return "剛剛";
  const formatter = new Intl.RelativeTimeFormat("zh-TW", { numeric: "always" });
  if (seconds < 3600) return formatter.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return formatter.format(-Math.floor(seconds / 3600), "hour");
  return formatter.format(-Math.floor(seconds / 86400), "day");
}

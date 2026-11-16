import type { Project, Task, Status, Category, Phase, LinkRow } from "./types";

export interface ProjectRow {
  id: string; name: string; brand: string; category: Category; status: Status; pct: number;
  next_step: string; open_count: number; description: string | null; now_title: string | null;
  now_note: string | null; handoff: string | null; decisions: string[] | null; links: LinkRow[] | null;
  phases: Phase[] | null; undecided: string | null; updated_at: string | null;
}
export interface TaskRow { id: string; project_id: string; title: string; note: string | null; grp: "next" | "later"; done: boolean; updated_at: string | null; }
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
  const tasks: Task[] = taskRows.filter((t) => t.project_id === row.id).map((t) => ({
    id: t.id, title: t.title, note: t.note ?? undefined, group: t.done ? "done" : t.grp, done: t.done,
  }));
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
  return { done, total: tasks.length, pct: tasks.length ? Math.round(done / tasks.length * 100) : project.pct, open: tasks.length ? tasks.length - done : project.open };
}

export function latestSync(projects: ProjectRow[], tasks: TaskRow[]) {
  const timestamps = [...projects, ...tasks].map((r) => r.updated_at).filter((v): v is string => Boolean(v) && !Number.isNaN(Date.parse(v ?? "")));
  return formatDate(timestamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0], true);
}
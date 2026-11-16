export type TaskStatus = "todo" | "doing" | "waiting" | "done";
export type TaskFilter = "next" | "later" | "doing" | "waiting" | "due" | "doneToday";
export const taskStatusLabel: Record<TaskStatus, string> = { todo: "未開始", doing: "進行中", waiting: "等別人", done: "完成" };
export const filterLabel: Record<TaskFilter, string> = { next: "現在要做", later: "之後", doing: "進行中", waiting: "等別人", due: "有期限", doneToday: "今天完成" };
export const emptyLabel: Record<TaskFilter, string> = { next: "沒有現在要做的待辦", later: "沒有之後的待辦", doing: "沒有進行中的事", waiting: "沒有等別人的事", due: "沒有有期限的事", doneToday: "今天還沒完成任何事" };

export interface TableTask {
  id: string; projectId: string; projectName: string; projectSort: number; sort: number;
  grp: "next" | "later"; title: string; note?: string | undefined; status: TaskStatus; dueDate: string | null; doneAt: string | null; updatedAt: string | null;
}

/** YYYY-MM-DD in Vancouver time. */
export function vancouverDate(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) return day;
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function dueTone(due: string | null, today: string): "overdue" | "soon" | "none" {
  if (!due) return "none";
  if (due < today) return "overdue";
  if (due <= addDays(today, 7)) return "soon";
  return "none";
}

function rank(t: TableTask, today: string) {
  if (t.dueDate && t.dueDate < today) return 0;
  if (t.dueDate) return 1;
  return t.status === "doing" ? 2 : t.status === "waiting" ? 3 : 4;
}

export function sortTasks(list: TableTask[], today: string) {
  return [...list].sort((a, b) => {
    const r = rank(a, today) - rank(b, today);
    if (r) return r;
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    return a.projectSort - b.projectSort || a.sort - b.sort;
  });
}

export function matchesFilter(t: TableTask, filter: TaskFilter, today: string) {
  switch (filter) {
    case "next": return t.status !== "done" && t.grp === "next";
    case "later": return t.status !== "done" && t.grp === "later";
    case "doing": return t.status === "doing";
    case "waiting": return t.status === "waiting";
    case "due": return t.status !== "done" && Boolean(t.dueDate);
    case "doneToday": return t.status === "done" && t.doneAt !== null && vancouverDate(new Date(t.doneAt)) === today;
  }
}

export function filterTasks(list: TableTask[], filter: TaskFilter, today: string, projectId = "") {
  return sortTasks(list.filter((t) => (!projectId || t.projectId === projectId) && matchesFilter(t, filter, today)), today);
}

export function filterCounts(list: TableTask[], today: string, projectId = "") {
  const scoped = list.filter((t) => !projectId || t.projectId === projectId);
  return Object.fromEntries((Object.keys(filterLabel) as TaskFilter[]).map((f) => [f, scoped.filter((t) => matchesFilter(t, f, today)).length])) as Record<TaskFilter, number>;
}

export function storedTaskFilter(value: string | null): TaskFilter {
  return value && Object.hasOwn(filterLabel, value) ? value as TaskFilter : "next";
}

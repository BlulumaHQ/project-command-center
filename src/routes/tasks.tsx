import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { DuePicker, EditableTitle, StatusSelect } from "@/components/TaskControls";
import { emptyLabel, filterCounts, filterLabel, filterTasks, matchesFilter, storedTaskFilter, vancouverDate, type TableTask, type TaskFilter, type TaskStatus } from "@/data/tasks";
import { formatDate } from "@/data/mapping";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  ssr: false,
  beforeLoad: requireSignedIn,
  validateSearch: (s: Record<string, unknown>): { filter?: TaskFilter | undefined } => ({ filter: typeof s["filter"] === "string" ? storedTaskFilter(s["filter"]) : undefined }),
  head: () => ({
    meta: [
      { title: "待辦表 · Bluluma HQ" },
      { name: "description", content: "所有專案的待辦、狀態與期限一覽。" },
      { property: "og:title", content: "待辦表 · Bluluma HQ" },
      { property: "og:description", content: "所有專案的待辦、狀態與期限一覽。" },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

const FILTER_KEY = "pcc.tasks.filter";
const PROJECT_KEY = "pcc.tasks.project";
const ADD_KEY = "pcc.tasks.addProject";

function TasksPage() {
  const store = useStore();
  const search = Route.useSearch();
  const [pinned, setPinned] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("next");
  const [projectFilter, setProjectFilter] = useState("");
  const [addProject, setAddProject] = useState("");
  const [title, setTitle] = useState("");
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const f = search.filter ?? storedTaskFilter(localStorage.getItem(FILTER_KEY));
    setFilter(f);
    localStorage.setItem(FILTER_KEY, f);
    setPinned([]);
    setProjectFilter(search.filter ? "" : localStorage.getItem(PROJECT_KEY) ?? "");
    setAddProject(localStorage.getItem(ADD_KEY) ?? "");
  }, [search.filter]);
  useEffect(() => {
    if (!highlighted.length) return;
    const timer = window.setTimeout(() => setHighlighted([]), 2300);
    return () => window.clearTimeout(timer);
  }, [highlighted]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) && !el.isContentEditable) { e.preventDefault(); addRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const projects = store.getProjects();
  const addTarget = projects.some((p) => p.id === addProject) ? addProject : projects[0]?.id ?? "";
  const today = vancouverDate();
  const all = store.getTableTasks();
  const counts = filterCounts(all, today, projectFilter);
  const list = filterTasks(all, filter, today, projectFilter);
  const pinOrder = new Map(pinned.map((id, i) => [id, i]));
  list.sort((a, b) => (pinOrder.get(a.id) ?? Infinity) - (pinOrder.get(b.id) ?? Infinity));

  const pickFilter = (f: TaskFilter) => { setFilter(f); setPinned([]); localStorage.setItem(FILTER_KEY, f); };
  const pickProject = (id: string) => { setProjectFilter(id); setPinned([]); localStorage.setItem(PROJECT_KEY, id); };
  const changeStatus = (t: TableTask, status: TaskStatus) => {
    const prev = t.status;
    store.setTaskStatus(t.id, status);
    if (status === "done" && prev !== "done") toast("已完成", { duration: 6000, action: { label: "復原", onClick: () => store.setTaskStatus(t.id, prev) } });
  };
  const add = () => {
    if (!title.trim() || !addTarget) return;
    if (!matchesFilter({ status: "todo", grp: "next", dueDate: null, doneAt: null } as TableTask, filter, today)) pickFilter("next");
    if (projectFilter && projectFilter !== addTarget) pickProject("");
    const id = store.addTask(addTarget, title);
    if (id) {
      setPinned((ids) => [id, ...ids]);
      setHighlighted((ids) => [id, ...ids]);
    }
    setTitle("");
    addRef.current?.focus();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">待辦表</h1>

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row">
        <select aria-label="新增到專案" value={addTarget} onChange={(e) => { setAddProject(e.target.value); localStorage.setItem(ADD_KEY, e.target.value); }}
          className="h-11 rounded-xl border border-input bg-background px-3 text-sm sm:w-52">
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input ref={addRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="新增待辦，按 Enter" aria-label="新增待辦"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(filterLabel) as TaskFilter[]).map((f) => (
          <Button variant="ghost" key={f} onClick={() => pickFilter(f)} aria-pressed={filter === f}
            className={cn("h-9 rounded-full border px-3 text-sm transition-colors", filter === f ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
            {filterLabel[f]} <span className="tabular-nums opacity-70">{counts[f]}</span>
          </Button>
        ))}
        <select aria-label="專案篩選" value={projectFilter} onChange={(e) => pickProject(e.target.value)}
          className="ml-auto h-9 rounded-full border border-border bg-card px-3 text-sm">
          <option value="">所有專案</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">{emptyLabel[filter]}</div>
      ) : (
        <>
          <div className="panel hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
                <tr><th className="px-4 py-3 font-medium">專案</th><th className="px-4 py-3 font-medium">待辦</th><th className="px-4 py-3 font-medium">狀態</th><th className="px-4 py-3 font-medium">期限</th><th className="px-4 py-3 font-medium">更新</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((t) => (
                  <tr key={t.id} className={cn("h-11 transition-colors duration-700 motion-reduce:transition-none", highlighted.includes(t.id) && "bg-accent")}>
                    <td className="px-4 py-2 align-top"><Link to="/project/$id" params={{ id: t.projectId }} className="text-muted-foreground hover:text-foreground hover:underline">{t.projectName}</Link></td>
                    <td className="px-4 py-2 align-top">
                      <EditableTitle title={t.title} done={t.status === "done"} onSave={(v) => store.renameTask(t.id, v)} />
                      {t.note && <div className="text-xs text-muted-foreground">{t.note}</div>}
                    </td>
                    <td className="px-4 py-2 align-top"><StatusSelect value={t.status} onChange={(s) => changeStatus(t, s)} /></td>
                    <td className="px-4 py-2 align-top"><DuePicker value={t.dueDate} onChange={(d) => store.setTaskDue(t.id, d)} /></td>
                    <td className="whitespace-nowrap px-4 py-2 align-top text-xs text-muted-foreground">{formatDate(t.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-2 sm:hidden">
            {list.map((t) => (
              <li key={t.id} className={cn("panel p-3 transition-colors duration-700 motion-reduce:transition-none", highlighted.includes(t.id) && "bg-accent")}>
                <EditableTitle title={t.title} done={t.status === "done"} onSave={(v) => store.renameTask(t.id, v)} />
                {t.note && <div className="text-xs text-muted-foreground">{t.note}</div>}
                <Link to="/project/$id" params={{ id: t.projectId }} className="mt-1 block text-xs text-muted-foreground">{t.projectName}</Link>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <StatusSelect value={t.status} onChange={(s) => changeStatus(t, s)} />
                  <DuePicker value={t.dueDate} onChange={(d) => store.setTaskDue(t.id, d)} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

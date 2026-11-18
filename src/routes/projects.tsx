import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { getProgress, useStore } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import type { Category, Project } from "@/data/types";
import { ProgressBar, StatusChip } from "@/components/ui-bits";
import { Input } from "@/components/ui/input";
import { ViewSwitch } from "@/components/ViewSwitch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  ssr: false,
  beforeLoad: requireSignedIn,
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({ q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined }),
  head: () => ({
    meta: [
      { title: "專案 · Bluluma HQ" },
      { name: "description", content: "所有進行中專案、進度與下一步。" },
      { property: "og:title", content: "專案 · Bluluma HQ" },
    ],
  }),
  component: ProjectsPage,
});

type Tab = "all" | Category | "almost" | "done";
const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "全部" }, { id: "client", label: "客戶" }, { id: "product", label: "自己產品" }, { id: "system", label: "系統" }, { id: "almost", label: "快完成" }, { id: "done", label: "已完成" },
];

/** 100% = status done, or every task checked off. */
const isComplete = (p: Project) => { const pr = getProgress(p); return p.status === "done" || (pr.total > 0 && pr.pct === 100); };

function ProjectsPage() {
  const store = useStore();
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const all = store.getProjects();
  const completed = all.filter(isComplete);
  const projects = all.filter((p) => !isComplete(p));
  const query = (q ?? "").toLowerCase();
  const filtered = (tab === "done" ? completed : projects).filter((p) => {
    if (tab === "almost" ? getProgress(p).pct < 90 : tab !== "all" && tab !== "done" && p.category !== tab) return false;
    return !query || [p.name, p.brand, p.next].some((s) => s.toLowerCase().includes(query));
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">專案</h1>
          <p className="mt-1 text-sm text-muted-foreground">{projects.length} 個進行中 · {completed.length} 個已完成 · 最後同步 {store.getMeta().lastSynced}</p>
        </div>
        <ViewSwitch current="projects" />
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q ?? ""} onChange={(e) => navigate({ to: "/projects", search: { q: e.target.value || undefined }, replace: true })}
          placeholder="搜尋專案、品牌、下一步" className="h-11 rounded-xl bg-card pl-9" aria-label="搜尋專案" />
      </label>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex rounded-xl border border-border bg-card p-1" role="tablist">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={cn("h-9 whitespace-nowrap rounded-lg px-3.5 text-sm transition-colors", tab === t.id ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t.label}{t.id === "done" && completed.length ? ` ${completed.length}` : ""}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">{tab === "done" ? "還沒有完成的專案" : "沒有符合的專案"}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const pr = getProgress(p);
            return (
              <Link key={p.id} to="/project/$id" params={{ id: p.id }} className="panel flex flex-col p-4 transition-colors hover:border-primary/50 active:bg-accent sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-muted-foreground">{p.brand}</div>
                    <div className="mt-0.5 font-semibold leading-snug">{p.name}</div>
                  </div>
                  <StatusChip status={p.status} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar pct={pr.pct} status={p.status} />
                  <span className="w-10 text-right text-sm font-medium tabular-nums">{pr.pct}%</span>
                </div>
                <div className="mt-3 rounded-xl bg-muted p-3 text-sm"><span className="text-muted-foreground">下一步　</span>{p.next || "—"}</div>
                <div className="mt-auto pt-3 text-xs text-muted-foreground">{pr.open} 項待辦 · 更新 {p.updated}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

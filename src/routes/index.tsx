import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Lock } from "lucide-react";
import { useState } from "react";
import { getProgress, useStore } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import type { Category } from "@/data/types";
import { ProgressBar, StatusChip } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { relativeActivityTime } from "@/data/mapping";
import { NotesBox } from "@/components/NotesBox";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: requireSignedIn,
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({ q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined }),
  head: () => ({
    meta: [
      { title: "專案總控台 · Bluluma HQ" },
      { name: "description", content: "所有進行中專案、下一步、期限與等待回覆一覽。" },
      { property: "og:title", content: "專案總控台 · Bluluma HQ" },
      { property: "og:description", content: "所有進行中專案、下一步、期限與等待回覆一覽。" },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});

type Tab = "all" | Category | "automation";
const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "全部" }, { id: "client", label: "客戶" }, { id: "product", label: "自己產品" }, { id: "system", label: "系統" }, { id: "automation", label: "自動化" },
];

function Overview() {
  const store = useStore();
  const { getMeta, getProjects, getRecentProjects, getWaiting, getDeadlines, getChain } = store;
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [almostOnly, setAlmostOnly] = useState(false);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  const [tab, setTab] = useState<Tab>("all");
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const meta = getMeta();
  const projects = getProjects();
  const recent = getRecentProjects();
  const waiting = getWaiting();
  const query = (q ?? "").toLowerCase();

  const filtered = projects.filter((p) => {
    if (almostOnly && getProgress(p).pct < 90) return false;
    if (tab === "automation" ? !/n8n|自動化/i.test(p.name + p.brand) : tab !== "all" && p.category !== tab) return false;
    return !query || [p.name, p.brand, p.next].some((s) => s.toLowerCase().includes(query));
  });

  const stats = [
    { label: "進行中專案", value: projects.length, action: () => scrollTo("all-projects"), tone: "text-foreground" },
    { label: "有時限", value: projects.filter((p) => p.status === "deadline").length, action: () => { void navigate({ to: "/tasks", search: { filter: "due" } }); }, tone: "text-st-deadline-bar" },
    { label: "等別人回覆", value: waiting.length, action: () => scrollTo("waiting-list"), tone: "text-foreground" },
    { label: "快完成 ≥ 90%", value: projects.filter((p) => getProgress(p).pct >= 90).length, action: () => { setAlmostOnly(true); setTab("all"); scrollTo("all-projects"); }, tone: "text-st-almost-bar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">專案總控台</h1>
        <p className="mt-1 text-sm text-muted-foreground">最後同步：{meta.lastSynced}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Button key={s.label} variant="ghost" onClick={s.action} className="panel block h-auto cursor-pointer p-5 text-left transition-colors hover:border-primary/50 hover:bg-accent">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className={cn("mt-2 text-3xl font-bold tabular-nums", s.tone)}>{s.value}</div>
          </Button>
        ))}
      </div>
      {store.unprocessedNotes > 0 && <p className="-mt-3 text-sm text-muted-foreground">{store.unprocessedNotes} 則留言等 Claude 處理</p>}
      <NotesBox store={store} />

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <div className="rounded-[18px] bg-ink p-6 text-ink-foreground lg:col-span-3">
          <h2 className="font-semibold">最近在做</h2>
          <ul className="mt-3 divide-y divide-ink-muted/20">
            {recent.map((p) => (
              <li key={p.id}>
                <Link to="/project/$id" params={{ id: p.id }} className="flex min-w-0 items-center gap-3 rounded-lg py-3 transition-colors hover:bg-ink-muted/10">
                  <span className="min-w-0 flex-1 truncate text-sm"><span className="font-medium">{p.name}</span><span className="text-ink-muted"> · {p.next}</span></span>
                  <span className="shrink-0 text-xs text-ink-muted">{relativeActivityTime(p.activityAt)}</span>
                  <span className="shrink-0 text-xs">打開 →</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/tasks" className="mt-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink-foreground">看全部待辦 <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="panel p-6 lg:col-span-2">
          <h3 className="font-semibold">有時限，要注意</h3>
          <ul className="mt-4 divide-y divide-border">
            {getDeadlines().map((d) => (
              <li key={d.title} className="flex gap-3 py-3">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", d.level === "hot" ? "bg-st-deadline-bar" : "bg-st-waiting-bar")} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.detail}</div>
                </div>
                <div className={cn("shrink-0 text-right text-xs font-medium", d.level === "hot" ? "text-st-deadline-fg" : "text-muted-foreground")}>{d.when}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel p-6">
        <h3 className="font-semibold">解鎖鏈 · Business 註冊下來之後</h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {getChain().map((c, i) => (
            <li key={c.title} className={cn("rounded-2xl p-4",
              c.state === "done" && "border border-border bg-st-almost-bg/50",
              c.state === "now" && "border-2 border-primary bg-card",
              c.state === "locked" && "border border-dashed border-st-waiting-bar/60")}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                {c.state === "done" && <span className="inline-flex items-center gap-1 rounded-full bg-st-almost-bg px-2 py-0.5 text-xs font-medium text-st-almost-fg"><Check className="h-3 w-3" />已送出</span>}
                {c.state === "now" && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">下一步</span>}
                {c.state === "locked" && <span className="inline-flex items-center gap-1 rounded-full bg-st-waiting-bg px-2 py-0.5 text-xs font-medium text-st-waiting-fg"><Lock className="h-3 w-3" />鎖住</span>}
              </div>
              <div className={cn("mt-2 text-sm font-semibold", c.state === "locked" && "text-muted-foreground")}>{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.unlocks}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section id="all-projects" className="scroll-mt-24 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">所有專案</h3>
            <div className="flex overflow-x-auto rounded-xl border border-border bg-card p-1" role="tablist">
              {tabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                  className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors", tab === t.id ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {almostOnly && <Button variant="outline" onClick={() => setAlmostOnly(false)} className="mt-3 h-8 rounded-full px-3 text-xs">只看快完成 ×</Button>}
          {filtered.length === 0 ? (
            <div className="panel mt-4 p-10 text-center text-sm text-muted-foreground">沒有符合的專案</div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {filtered.map((p) => {
                const pr = getProgress(p);
                return (
                  <Link key={p.id} to="/project/$id" params={{ id: p.id }} className="panel flex flex-col p-5 transition-colors hover:border-primary/50">
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                    <div className="mt-1 flex items-start justify-between gap-2">
                      <div className="font-semibold leading-snug">{p.name}</div>
                      <StatusChip status={p.status} />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <ProgressBar pct={pr.pct} status={p.status} />
                      <span className="w-10 text-right text-sm font-medium tabular-nums">{pr.pct}%</span>
                    </div>
                    <div className="mt-4 rounded-xl bg-muted p-3">
                      <div className="text-xs text-muted-foreground">下一步</div>
                      <div className="mt-0.5 text-sm">{p.next}</div>
                    </div>
                    <div className="mt-auto pt-4 text-xs text-muted-foreground">{pr.open} 項待辦 · 更新 {p.updated}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
        <aside id="waiting-list" className="scroll-mt-24">
          <h3 className="font-semibold">等別人 · Waiting on</h3>
          <ul className="panel mt-4 divide-y divide-border">
            {waiting.map((w) => (
              <li key={w.who} className="flex gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-st-waiting-bg text-xs font-semibold text-st-waiting-fg">{w.initials}</span>
                <div className="min-w-0">
                  <div className="text-sm"><span className="font-medium">{w.who}</span><span className="text-muted-foreground"> · {w.project}</span></div>
                  <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{w.what}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

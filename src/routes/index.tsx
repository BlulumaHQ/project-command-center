import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Lock } from "lucide-react";
import { useState } from "react";
import { getProgress, useStore } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import type { Category } from "@/data/types";
import { ProgressBar, StatusChip } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

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
  const { getMeta, getProjects, getProject, getWaiting, getDeadlines, getChain } = store;
  const { q } = Route.useSearch();
  const [tab, setTab] = useState<Tab>("all");
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const meta = getMeta();
  const projects = getProjects();
  const resume = getProject(meta.resumeProjectId);
  const waiting = getWaiting();
  const query = (q ?? "").toLowerCase();

  const filtered = projects.filter((p) => {
    if (tab === "automation" ? !/n8n|自動化/i.test(p.name + p.brand) : tab !== "all" && p.category !== tab) return false;
    return !query || [p.name, p.brand, p.next].some((s) => s.toLowerCase().includes(query));
  });

  const stats = [
    { label: "進行中專案", value: projects.length, tone: "text-foreground" },
    { label: "有時限", value: projects.filter((p) => p.status === "deadline").length, tone: "text-st-deadline-bar" },
    { label: "等別人回覆", value: waiting.length, tone: "text-foreground" },
    { label: "快完成 ≥ 90%", value: projects.filter((p) => getProgress(p).pct >= 90).length, tone: "text-st-almost-bar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">專案總控台</h1>
        <p className="mt-1 text-sm text-muted-foreground">最後同步：{meta.lastSynced}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className={cn("mt-2 text-3xl font-bold tabular-nums", s.tone)}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {resume && (
          <div className="flex flex-col rounded-[18px] bg-ink p-6 text-ink-foreground sm:p-8 lg:col-span-3">
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">從這裡繼續 · Resume</div>
            <div className="mt-3 text-sm text-ink-muted">{resume.name} · {resume.brand}</div>
            <h2 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">{resume.detail?.now.title ?? resume.next}</h2>
            {resume.detail && <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">{resume.detail.now.note}</p>}
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
              <Link to="/project/$id" params={{ id: resume.id }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink-foreground px-5 text-sm font-semibold text-ink">
                打開專案 <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm text-ink-muted">之後：{meta.secondaryNext}</span>
            </div>
          </div>
        )}
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
        <section className="lg:col-span-2">
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
        <aside>
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

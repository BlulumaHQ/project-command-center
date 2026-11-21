import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Circle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { RobotAvatar } from "@/components/RobotAvatar";
import { NotesBox } from "@/components/NotesBox";
import { OfficeStrip } from "@/components/OfficeStrip";
import { NotConnected } from "@/components/ui-bits";
import { relativeActivityTime } from "@/data/mapping";
import { dueTone, matchesFilter, sortTasks, vancouverDate, type TableTask } from "@/data/tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "今日 · Bluluma HQ" },
      { name: "description", content: "今天要做的事、快到期的期限、等別人回覆的事項。" },
      { property: "og:title", content: "今天 · Bluluma HQ" },
      { property: "og:description", content: "今天要做的事、快到期的期限、等別人回覆的事項。" },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TodayPage,
});

interface FocusRow { key: string; title: string; projectId?: string | undefined; projectName?: string | undefined; taskId?: string | undefined; why?: string | undefined; done: boolean; }

/** Fallback when Atlas hasn't written today's plan: overdue → due soon → in progress → next. */
function autoFocus(tasks: TableTask[], today: string): TableTask[] {
  const open = tasks.filter((t) => t.status !== "done" && t.status !== "waiting" && (t.grp === "next" || t.dueDate || t.status === "doing"));
  return sortTasks(open, today).slice(0, 6);
}

function TodayPage() {
  const store = useStore();
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;

  const today = vancouverDate();
  const tasks = store.getTableTasks();
  const projects = store.getProjects();
  const names = new Map(projects.map((p) => [p.id, p.name]));
  const planned = store.getFocus();
  const fromAtlas = planned.length > 0;
  const focus: FocusRow[] = fromAtlas
    ? planned.map((f, i) => ({ key: `f${i}`, title: f.title, projectId: f.project_id, projectName: f.project_id ? names.get(f.project_id) : undefined, taskId: f.task_id, why: f.why, done: f.task_id ? store.getTaskStatus(f.task_id) === "done" : false }))
    : autoFocus(tasks, today).map((t) => ({ key: t.id, title: t.title, projectId: t.projectId, projectName: t.projectName, taskId: t.id, why: t.dueDate ? (t.dueDate < today ? "已過期" : `期限 ${t.dueDate.slice(5).replace("-", "/")}`) : t.status === "doing" ? "進行中" : undefined, done: false }));

  const complete = (f: FocusRow) => {
    if (!f.taskId) return;
    const prev = store.getTaskStatus(f.taskId) ?? "todo";
    store.setTaskStatus(f.taskId, "done");
    toast("完成一件！", { duration: 6000, action: { label: "復原", onClick: () => f.taskId && store.setTaskStatus(f.taskId, prev) } });
  };

  const deadlines = store.getDeadlines();
  const waiting = store.getWaiting();
  const recent = store.getRecentProjects();
  const chain = store.getChain();
  const dueSoon = tasks.filter((t) => t.status !== "done" && dueTone(t.dueDate, today) !== "none").length;
  const nextCount = tasks.filter((t) => matchesFilter(t, "next", today)).length;
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Vancouver", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  const greeting = hour < 12 ? "早安" : hour < 18 ? "午安" : "晚安";
  const dateLabel = new Intl.DateTimeFormat("zh-TW", { timeZone: "America/Vancouver", month: "long", day: "numeric", weekday: "long" }).format(new Date());

  const chips = [
    { label: "現在要做", value: nextCount, to: "next" as const },
    { label: "有期限", value: dueSoon, to: "due" as const, hot: dueSoon > 0 },
    { label: "等別人", value: waiting.length, to: "waiting" as const },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight md:text-3xl">{greeting}，Sony</h1>
        <p className="mt-1 text-sm text-muted-foreground">{focus.filter((f) => !f.done).length} 件事 · {waiting.length} 個等回覆 · {dueSoon} 個有期限</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-muted-foreground">今日 Outreach</p><NotConnected /></div>
          <p className="text-3xl font-bold tabular-nums">— / 20</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-0 bg-primary" /></div>
          <p className="text-xs text-muted-foreground">接上 cold email 紀錄後自動計數</p>
        </div>
        <Link to="/tasks" search={{ filter: "waiting" }} className="panel flex flex-col gap-2 p-4 transition-colors hover:border-primary/50">
          <p className="text-[13px] font-semibold text-muted-foreground">待 Follow-up</p>
          <p className="text-3xl font-bold tabular-nums">{waiting.length}</p>
          <p className="truncate text-xs text-muted-foreground">{waiting.slice(0, 2).map((w) => w.who).join(" · ") || "沒有在等的人"}</p>
        </Link>
        <OfficeStrip count={store.getAgents().length || 6} />
      </div>

      <section className="rounded-[20px] bg-ink p-5 text-ink-foreground sm:p-6">
        <div className="flex items-center gap-3">
          <RobotAvatar id="atlas" size={44} />
          <div className="min-w-0">
            <h2 className="font-semibold">今天 6 件事</h2>
            <p className="text-xs text-ink-muted">{fromAtlas ? "Atlas 今天早上排的" : "Atlas 還沒上班，先依期限和進度自動排"}</p>
          </div>
        </div>
        {focus.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">沒有待辦，今天可以喘口氣。</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {focus.map((f) => (
              <li key={f.key} className="flex items-center gap-3 rounded-2xl bg-ink-muted/10 p-3">
                <button type="button" onClick={() => complete(f)} disabled={!f.taskId || f.done} aria-label={`完成：${f.title}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-muted/40 transition-colors hover:bg-ink-muted/20 disabled:opacity-60">
                  {f.done ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5 text-ink-muted" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm font-medium leading-snug", f.done && "line-through opacity-60")}>{f.title}</div>
                  <div className="mt-0.5 truncate text-xs text-ink-muted">
                    {f.projectId ? <Link to="/project/$id" params={{ id: f.projectId }} className="hover:underline">{f.projectName ?? f.projectId}</Link> : null}
                    {f.why && <span className={cn(f.projectId && "before:content-['·_']", f.why === "已過期" && "text-orange-300")}> {f.why}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid grid-cols-3 gap-2">
        {chips.map((c) => (
          <Link key={c.label} to="/tasks" search={{ filter: c.to }} className="panel p-3 text-center transition-colors hover:border-primary/50 active:bg-accent">
            <div className={cn("text-2xl font-bold tabular-nums", c.hot && "text-st-deadline-bar")}>{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>

      <NotesBox store={store} />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <h3 className="font-semibold">有時限，要注意</h3>
          {deadlines.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">目前沒有</p> : (
            <ul className="mt-2 divide-y divide-border">
              {deadlines.map((d) => (
                <li key={d.title} className="flex gap-3 py-3">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", d.level === "hot" ? "bg-st-deadline-bar" : "bg-st-waiting-bar")} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{d.title}</div>
                    {d.detail && <div className="text-xs text-muted-foreground">{d.detail}</div>}
                  </div>
                  <div className={cn("shrink-0 text-right text-xs font-medium", d.level === "hot" ? "text-st-deadline-fg" : "text-muted-foreground")}>{d.when}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel p-5">
          <h3 className="font-semibold">等別人回覆</h3>
          {waiting.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">目前沒有</p> : (
            <ul className="mt-2 divide-y divide-border">
              {waiting.map((w) => (
                <li key={w.who + w.what} className="flex gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-st-waiting-bg text-xs font-semibold text-st-waiting-fg">{w.initials}</span>
                  <div className="min-w-0">
                    <div className="text-sm"><span className="font-medium">{w.who}</span><span className="text-muted-foreground"> · {w.project}</span></div>
                    <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{w.what}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">最近在做</h3>
          <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">所有專案 <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <ul className="mt-2 divide-y divide-border">
          {recent.map((p) => (
            <li key={p.id}>
              <Link to="/project/$id" params={{ id: p.id }} className="flex min-h-12 min-w-0 items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1 text-sm"><span className="font-medium">{p.name}</span><span className="block truncate text-xs text-muted-foreground">{p.next}</span></span>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeActivityTime(p.activityAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {chain.length > 0 && (
        <section className="panel p-5">
          <h3 className="font-semibold">解鎖鏈 · Business 註冊下來之後</h3>
          <ol className="-mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {chain.map((c, i) => (
              <li key={c.title} className={cn("w-56 shrink-0 snap-start rounded-2xl p-4 lg:w-auto",
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
        </section>
      )}
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ClipboardList } from "lucide-react";
import { getProgress, getProject, useStore } from "@/data/store";
import type { Task, TaskGroup } from "@/data/types";
import { StatusChip } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { toggleTask } from "@/data/store";

export const Route = createFileRoute("/project/$id")({
  loader: ({ params }) => {
    const p = getProject(params.id);
    if (!p) throw notFound();
    return { name: p.name, brand: p.brand };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "專案"} · Project Command Center` },
      { name: "description", content: `${loaderData?.name ?? "專案"} 的進度、待辦與交接備忘。` },
      { property: "og:title", content: `${loaderData?.name ?? "專案"} · Project Command Center` },
      { property: "og:description", content: `${loaderData?.name ?? "專案"} 的進度、待辦與交接備忘。` },
    ],
  }),
  component: ProjectPage,
});

function Ring({ pct, className }: { pct: number; className: string }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90" aria-label={`${pct}%`}>
      <circle cx="50" cy="50" r={r} strokeWidth="9" className="fill-none stroke-muted" />
      <circle cx="50" cy="50" r={r} strokeWidth="9" strokeLinecap="round" className={cn("fill-none transition-all", className)}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
    </svg>
  );
}
const ringStroke = { progress: "stroke-st-progress-bar", waiting: "stroke-st-waiting-bar", deadline: "stroke-st-deadline-bar", almost: "stroke-st-almost-bar" } as const;
const groupLabel: Record<TaskGroup, string> = { next: "接下來", later: "之後", done: "已完成" };

function ProjectPage() {
  useStore();
  const { id } = Route.useParams();
  const p = getProject(id);
  if (!p) return null;
  const pr = getProgress(p);
  const d = p.detail;
  const phaseIdx = d ? d.phases.findIndex((x) => x.state === "now") : -1;

  return (
    <div className="space-y-6">
      <Link to="/" search={{ q: undefined }} className="inline-flex h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 所有專案
      </Link>

      <div className="panel flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{p.brand}</span>
            <StatusChip status={p.status} />
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{p.name}</h1>
          {d && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{d.description}</p>}
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Ring pct={pr.pct} className={ringStroke[p.status]} />
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums">{pr.pct}%</span>
          </div>
          <div className="space-y-1 text-sm">
            {d && <div className="font-medium">{pr.done} / {pr.total} 完成</div>}
            {d && phaseIdx >= 0 && <div className="text-muted-foreground">第 {phaseIdx + 1} 階段 / {d.phases.length} · {d.phases[phaseIdx]?.title}</div>}
            <div className="text-muted-foreground">更新 {p.updated}</div>
          </div>
        </div>
      </div>

      {d && (
        <ol className="panel grid gap-3 p-4 sm:grid-cols-5 sm:p-5">
          {d.phases.map((ph, i) => (
            <li key={ph.title} className={cn("flex items-center gap-3 rounded-xl p-3", ph.state === "now" && "bg-accent")}>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                ph.state === "done" && "bg-st-almost-bar text-primary-foreground",
                ph.state === "now" && "bg-primary text-primary-foreground",
                ph.state === "locked" && "bg-muted text-muted-foreground")}>
                {ph.state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="min-w-0">
                <div className={cn("text-sm font-semibold", ph.state === "now" && "text-accent-foreground", ph.state === "locked" && "text-muted-foreground")}>{ph.title}</div>
                {ph.detail && <div className="text-xs text-muted-foreground">{ph.detail}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {!d ? (
        <div className="space-y-4">
          <div className="rounded-[18px] bg-ink p-6 text-ink-foreground sm:p-8">
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">下一步 · Next</div>
            <h2 className="mt-2 text-2xl font-bold leading-snug">{p.next}</h2>
          </div>
          <div className="panel flex flex-col items-center p-10 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
            <div className="mt-3 font-semibold">還沒有詳細 checklist</div>
            <p className="mt-1 text-sm text-muted-foreground">目前先照上面的下一步走，之後再補細項。</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-[18px] bg-ink p-6 text-ink-foreground sm:p-8">
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">現在做這一件 · Now</div>
              <h2 className="mt-2 text-2xl font-bold leading-snug">{d.now.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{d.now.note}</p>
            </div>
            {(["next", "later", "done"] as TaskGroup[]).map((g) => {
              const items = d.tasks.filter((t) => t.group === g);
              return (
                <section key={g} className="panel p-5">
                  <h3 className="mb-2 font-semibold">{groupLabel[g]} <span className="text-sm font-normal text-muted-foreground">· {items.filter((t) => !t.done).length} 待辦</span></h3>
                  <ul>{items.map((t) => <TaskRow key={t.id} projectId={p.id} task={t} />)}</ul>
                </section>
              );
            })}
          </div>
          <aside className="space-y-4">
            <div className="panel p-5">
              <h3 className="font-semibold">Claude 交接備忘</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.handoff}</p>
            </div>
            <div className="panel p-5">
              <h3 className="font-semibold">已經決定的事</h3>
              <ul className="mt-3 space-y-2">
                {d.decisions.map((x) => (
                  <li key={x} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-st-almost-bar" />{x}</li>
                ))}
              </ul>
            </div>
            <div className="panel p-5">
              <h3 className="font-semibold">帳號 & 連結</h3>
              <dl className="mt-3 divide-y divide-border">
                {d.links.map((l) => (
                  <div key={l.label} className="flex justify-between gap-4 py-2 text-sm">
                    <dt className="text-muted-foreground">{l.label}</dt><dd className="break-all text-right font-medium">{l.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-[18px] border border-border bg-beige p-5">
              <h3 className="font-semibold">還沒決定</h3>
              <p className="mt-2 text-sm leading-relaxed text-st-waiting-fg">{d.undecided}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function TaskRow({ projectId, task }: { projectId: string; task: Task }) {
  return (
    <li>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted">
        <input type="checkbox" checked={task.done} onChange={() => toggleTask(projectId, task.id)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary" />
        <span className="min-w-0">
          <span className={cn("text-sm", task.done && "text-muted-foreground line-through")}>{task.title}</span>
          {task.note && <span className="block text-xs text-muted-foreground">{task.note}</span>}
        </span>
      </label>
    </li>
  );
}

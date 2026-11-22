import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, ExternalLink, Mail, Smartphone } from "lucide-react";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { formatDate } from "@/data/mapping";
import {
  useMonitor,
  type AlertRow,
  type Light,
  type MonitorRow,
  type RunRow,
} from "@/data/monitor-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/monitor")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "監控 · Bluluma HQ" },
      { name: "description", content: "NightClerk 每個客人的自動同步狀態：燈號、最近執行、警示。" },
      { property: "og:title", content: "監控 · Bluluma HQ" },
    ],
  }),
  component: MonitorPage,
});

const LIGHT: Record<Light, { dot: string; label: string; tone: string }> = {
  green: { dot: "bg-st-almost-bar", label: "正常", tone: "bg-st-almost-bg text-st-almost-fg" },
  yellow: { dot: "bg-amber-400", label: "小問題", tone: "bg-amber-50 text-amber-800" },
  red: { dot: "bg-red-500", label: "要處理", tone: "bg-red-50 text-red-700" },
};
const RUN: Record<RunRow["status"], { label: string; light: Light | null }> = {
  running: { label: "執行中", light: null },
  ok: { label: "正常", light: "green" },
  warn: { label: "小問題", light: "yellow" },
  blocked: { label: "已擋下", light: "red" },
  failed: { label: "失敗", light: "red" },
};

function ago(value: string | null) {
  if (!value) return "從未";
  const min = Math.round((Date.now() - Date.parse(value)) / 60_000);
  if (min < 1) return "剛剛";
  if (min < 60) return `${min} 分鐘前`;
  const h = Math.round(min / 60);
  return h < 48 ? `${h} 小時前` : `${Math.round(h / 24)} 天前`;
}

function Dot({ light, pulse }: { light: Light; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-3 w-3 shrink-0">
      {pulse && (
        <span
          className={cn("absolute inset-0 animate-ping rounded-full opacity-60", LIGHT[light].dot)}
        />
      )}
      <span className={cn("relative inline-flex h-3 w-3 rounded-full", LIGHT[light].dot)} />
    </span>
  );
}

function AlertCard({
  alert,
  onResolve,
  busy,
}: {
  alert: AlertRow;
  onResolve: () => void;
  busy: boolean;
}) {
  return (
    <li
      className={cn(
        "panel border-l-0 p-4",
        alert.level === "red" ? "ring-1 ring-red-200" : "ring-1 ring-amber-200",
      )}
    >
      <div className="flex items-start gap-3">
        <Dot light={alert.level} pulse={alert.level === "red"} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{alert.title}</p>
          {alert.body && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{alert.body}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{formatDate(alert.created_at, true)}</span>
            {alert.pushed && (
              <span className="inline-flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                已推播
              </span>
            )}
            {alert.emailed && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                已寄信
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onResolve}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-medium transition hover:bg-muted disabled:opacity-50 sm:w-auto sm:px-4"
      >
        <CheckCircle2 className="h-4 w-4" />
        我處理好了
      </button>
    </li>
  );
}

function RunItem({ run }: { run: RunRow }) {
  const meta = RUN[run.status];
  return (
    <li className="py-3">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium",
            meta.light ? LIGHT[meta.light].tone : "bg-muted text-muted-foreground",
          )}
        >
          {meta.label}
        </span>
        <span className="text-muted-foreground">{formatDate(run.started_at, true)}</span>
        {run.run_url && (
          <a
            href={run.run_url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            紀錄
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      {run.message && <p className="mt-1.5 text-sm leading-relaxed">{run.message}</p>}
      {run.checks && run.checks.length > 0 && (
        <ul className="mt-2 space-y-1">
          {run.checks.map((c) => (
            <li key={c.name} className="flex gap-2 text-xs text-muted-foreground">
              <span className="pt-1">
                <span className={cn("block h-1.5 w-1.5 rounded-full", LIGHT[c.level].dot)} />
              </span>
              <span className="leading-relaxed">{c.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function MonitorCard({ m, runs }: { m: MonitorRow; runs: RunRow[] }) {
  const c = m.last_counts ?? {};
  const running = runs[0]?.status === "running";
  return (
    <details className="panel group/m p-0 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
        <span className="pt-1">
          <Dot light={m.status} pulse={m.status === "red"} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{m.client_name}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                LIGHT[m.status].tone,
              )}
            >
              {LIGHT[m.status].label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{m.job_name}</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/60 px-2 py-2">
              <dt className="text-[11px] text-muted-foreground">上次成功</dt>
              <dd className="mt-0.5 text-sm font-semibold">
                {running ? "執行中…" : ago(m.last_success_at)}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/60 px-2 py-2">
              <dt className="text-[11px] text-muted-foreground">價格更新</dt>
              <dd className="mt-0.5 text-sm font-semibold">{c["price"] ?? "—"}</dd>
            </div>
            <div className="rounded-xl bg-muted/60 px-2 py-2">
              <dt className="text-[11px] text-muted-foreground">庫存更新</dt>
              <dd className="mt-0.5 text-sm font-semibold">{c["stock"] ?? "—"}</dd>
            </div>
          </dl>
          {m.last_message && m.status !== "green" && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.last_message}</p>
          )}
        </div>
        <ChevronDown
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-open/m:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t px-4 pb-2">
        <p className="pt-3 text-xs font-semibold tracking-wide text-muted-foreground">最近執行</p>
        {runs.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            還沒有執行紀錄。下一次排程跑完就會出現。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {runs.slice(0, 8).map((r) => (
              <RunItem key={r.id} run={r} />
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

function MonitorPage() {
  const { data, error, isLoading, refetch, resolve } = useMonitor();
  if (error) return <DataError message={error.message} retry={() => void refetch()} />;
  if (isLoading || !data) return <DataSkeleton />;
  const active = new Set(data.monitors.map((m) => m.id));
  const open = data.alerts.filter((a) => !a.resolved_at && active.has(a.monitor_id));
  const bad = data.monitors.filter((m) => m.status !== "green");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">監控</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          NightClerk 夜班狀態。紅燈會推播到手機，黃燈寄信，綠燈不打擾你。
        </p>
      </div>

      <div className={cn("panel flex items-center gap-3 p-4", bad.length ? "" : "bg-st-almost-bg")}>
        <Dot
          light={bad.some((m) => m.status === "red") ? "red" : bad.length ? "yellow" : "green"}
        />
        <p className="text-sm font-medium">
          {bad.length === 0
            ? `全部正常 · ${data.monitors.length} 個同步在跑`
            : `${bad.length} 個要看一下`}
        </p>
      </div>

      {open.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
            未處理的警示
          </h2>
          <ul className="space-y-3">
            {open.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                busy={resolve.isPending}
                onResolve={() => resolve.mutate(a.id)}
              />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">客人</h2>
        {data.monitors.length === 0 ? (
          <div className="panel p-10 text-center text-sm text-muted-foreground">
            還沒有接上任何同步
          </div>
        ) : (
          <div className="space-y-3">
            {data.monitors.map((m) => (
              <MonitorCard key={m.id} m={m} runs={data.runs.filter((r) => r.monitor_id === m.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

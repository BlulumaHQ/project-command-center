import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, BellOff, CheckCircle2, ChevronDown, ExternalLink, Mail, Plus, RefreshCw, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { formatDate } from "@/data/mapping";
import {
  useMonitor,
  useSiteMonitor,
  type CronRow,
  type MonAlertRow,
  type SiteLight,
  type SiteRow,
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
      { name: "description", content: "網站在不在線、網域到期、Google 收錄、自動同步和排程的燈號與警示。" },
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
  onMute,
  busy,
}: {
  alert: AlertRow;
  onResolve: () => void;
  onMute?: (() => void) | undefined;
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
      <div className="mt-3 grid gap-2 sm:flex">
        <button
          type="button"
          disabled={busy}
          onClick={onResolve}
          className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-medium transition hover:bg-muted disabled:opacity-50 sm:w-auto sm:px-4"
        >
          <CheckCircle2 className="h-4 w-4" />
          我處理好了
        </button>
        {onMute && (
          <button
            type="button"
            disabled={busy}
            onClick={onMute}
            className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-50 sm:w-auto sm:px-4"
          >
            <BellOff className="h-4 w-4" />
            不用理，不再通報
          </button>
        )}
      </div>
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

const GREY = { dot: "bg-muted-foreground/40", label: "還沒檢查", tone: "bg-muted text-muted-foreground" };
const lightOf = (s: SiteLight) => (s === "grey" ? GREY : LIGHT[s]);

function SiteDot({ s }: { s: SiteLight }) {
  return s === "grey" ? (
    <span className={cn("inline-flex h-3 w-3 shrink-0 rounded-full", GREY.dot)} />
  ) : (
    <Dot light={s} pulse={s === "red"} />
  );
}

function daysLeft(date: string | null) {
  if (!date) return null;
  return Math.floor((Date.parse(date) - Date.now()) / 86_400_000);
}

function siteNotes(s: SiteRow) {
  const notes: string[] = [];
  if (s.status === "grey") return ["等第一次檢查"];
  if (s.last_error && s.fails > 0) notes.push(s.last_error);
  else if (s.http_status && s.http_status >= 400) notes.push(`HTTP ${s.http_status}`);
  if (s.ms !== null && s.fails === 0) notes.push(`${(s.ms / 1000).toFixed(1)} 秒`);
  if (s.check_index && s.noindex) notes.push("noindex：Google 不收錄");
  const d = daysLeft(s.domain_expires);
  if (d !== null) notes.push(d < 60 ? `網域剩 ${d} 天` : `網域 ${s.domain_expires} 到期`);
  if (!s.managed) notes.push("觀察中・不發警示");
  if (s.muted_at) notes.unshift("不用理・不通報");
  return notes;
}

function SiteItem({
  s,
  onRemove,
  onMute,
  onUnmute,
}: {
  s: SiteRow;
  onRemove: () => void;
  onMute: () => void;
  onUnmute: () => void;
}) {
  const muted = Boolean(s.muted_at);
  const light = muted ? { ...GREY, label: "不用理" } : lightOf(s.status);
  const canMute = !muted && s.managed && (s.status === "red" || s.status === "yellow");
  return (
    <li className={cn("flex items-start gap-3 px-4 py-3", muted && "opacity-70")}>
      <span className="pt-1.5">
        <SiteDot s={muted ? "grey" : s.status} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="truncate font-medium">{s.name}</p>
          {(muted || s.status !== "green") && (
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", light.tone)}>{light.label}</span>
          )}
        </div>
        <a
          href={`https://${s.domain}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {s.domain}
          <ExternalLink className="h-3 w-3" />
        </a>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{siteNotes(s).join(" · ")}</p>
        {(canMute || muted) && (
          <button
            type="button"
            onClick={muted ? onUnmute : onMute}
            className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {muted ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
            {muted ? "恢復監控" : "不用理，不再通報"}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`停止監控 ${s.name}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

function AddSite({ onAdd, busy }: { onAdd: (v: { domain: string; name: string; grp: "own" | "client" }) => Promise<void>; busy: boolean }) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [grp, setGrp] = useState<"own" | "client">("client");
  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-center justify-center gap-2 border-t text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        新增網站
      </button>
    );
  return (
    <form
      className="grid gap-2 border-t p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await onAdd({ domain, name, grp });
          toast.success("加好了，下一輪檢查就會出現燈號");
          setDomain("");
          setName("");
          setOpen(false);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "新增失敗");
        }
      }}
    >
      <label className="sr-only" htmlFor="mon-domain">網址</label>
      <input id="mon-domain" required value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="網址，例如 example.com"
        className="h-11 rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm" />
      <label className="sr-only" htmlFor="mon-name">名稱</label>
      <input id="mon-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="名稱（客人或品牌）"
        className="h-11 rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm" />
      <label className="sr-only" htmlFor="mon-grp">類別</label>
      <select id="mon-grp" value={grp} onChange={(e) => setGrp(e.target.value as "own" | "client")}
        className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
        <option value="client">客人</option>
        <option value="own">自己的</option>
      </select>
      <button type="submit" disabled={busy} className="h-11 rounded-xl bg-ink px-5 text-sm font-medium text-ink-foreground disabled:opacity-50">
        加入
      </button>
    </form>
  );
}

const JOB_LABEL: Record<string, string> = {
  "ddf-sync": "Realtor MLS 房源同步",
  "nc-watchdog": "NightClerk 看門狗",
  "site-monitor": "網站監控",
};
function scheduleLabel(s: string) {
  if (s === "* * * * *") return "每分鐘";
  const m = s.match(/^\*\/(\d+) \* \* \* \*$/);
  if (m) return `每 ${m[1]} 分鐘`;
  return s;
}
function cronLight(j: CronRow): Light {
  if (j.last_status === "failed") return "red";
  if (j.fails_24h > 0) return "yellow";
  return "green";
}

function CronList({ jobs }: { jobs: CronRow[] }) {
  return (
    <ul className="panel divide-y divide-border p-0">
      {jobs.map((j) => {
        const l = cronLight(j);
        return (
          <li key={j.jobname} className="flex items-start gap-3 px-4 py-3">
            <span className="pt-1.5">
              <Dot light={l} pulse={l === "red"} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{JOB_LABEL[j.jobname] ?? j.jobname}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {scheduleLabel(j.schedule)} · 24 小時跑了 {j.runs_24h} 次
                {j.fails_24h > 0 ? `，失敗 ${j.fails_24h} 次` : "，全部成功"} · 上次 {ago(j.last_end)}
                {!j.active && " · 已暫停"}
              </p>
              {j.last_status === "failed" && j.last_message && (
                <p className="mt-1 text-xs text-red-700">{j.last_message}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function MonAlertCard({ alert, onResolve, onMute, busy }: { alert: MonAlertRow; onResolve: () => void; onMute?: (() => void) | undefined; busy: boolean }) {
  return (
    <AlertCard
      alert={{ ...alert, monitor_id: alert.ref } as unknown as AlertRow}
      onResolve={onResolve}
      onMute={onMute}
      busy={busy}
    />
  );
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground">{children}</h2>
      {right}
    </div>
  );
}

function MonitorPage() {
  const nc = useMonitor();
  const mon = useSiteMonitor();
  const [tab, setTab] = useState<"own" | "client">("client");
  if (nc.error) return <DataError message={nc.error.message} retry={() => void nc.refetch()} />;
  if (mon.error) return <DataError message={mon.error.message} retry={() => void mon.refetch()} />;
  if (nc.isLoading || !nc.data || mon.isLoading || !mon.data) return <DataSkeleton />;

  const active = new Set(nc.data.monitors.map((m) => m.id));
  const ncOpen = nc.data.alerts.filter((a) => !a.resolved_at && active.has(a.monitor_id));
  const sites = mon.data.sites;
  const managed = sites.filter((s) => s.managed && !s.muted_at);
  const mutedCount = sites.filter((s) => s.muted_at).length;
  const mute = (domain: string) => {
    const site = sites.find((x) => x.domain === domain);
    const level = site?.status === "yellow" ? "yellow" : "red";
    mon.muteSite.mutate(
      { domain, level },
      {
        onSuccess: () => toast.success(`${site?.name ?? domain} 不用理了，之後不會再通報`),
        onError: (e) => toast.error(e.message),
      },
    );
  };
  const siteBad = managed.filter((s) => s.status === "red" || s.status === "yellow");
  const ncBad = nc.data.monitors.filter((m) => m.status !== "green");
  const jobBad = mon.data.jobs.filter((j) => j.active && cronLight(j) !== "green");
  const anyRed =
    managed.some((s) => s.status === "red") ||
    ncBad.some((m) => m.status === "red") ||
    jobBad.some((j) => cronLight(j) === "red");
  const badCount = siteBad.length + ncBad.length + jobBad.length;
  const lastCheck = sites.map((s) => s.last_checked_at).filter((v): v is string => Boolean(v)).sort().pop() ?? null;
  const order: Record<SiteLight, number> = { red: 0, yellow: 1, grey: 2, green: 3 };
  const shown = sites
    .filter((s) => s.grp === tab)
    .sort(
      (a, b) =>
        Number(Boolean(a.muted_at)) - Number(Boolean(b.muted_at)) ||
        Number(b.managed) - Number(a.managed) ||
        order[a.status] - order[b.status] ||
        a.name.localeCompare(b.name),
    );
  const count = (g: "own" | "client") => sites.filter((s) => s.grp === g).length;
  const totalAlerts = ncOpen.length + mon.data.alerts.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">監控</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          網站在不在線、網域到期、Google 收錄、自動同步和排程。紅燈推播到手機，黃燈寄信，綠燈不打擾你。
        </p>
      </div>

      <div className={cn("panel flex flex-wrap items-center gap-3 p-4", badCount ? "" : "bg-st-almost-bg")}>
        <Dot light={anyRed ? "red" : badCount ? "yellow" : "green"} pulse={anyRed} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {badCount === 0 ? "全部正常" : `${badCount} 個要看一下`}
          </p>
          <p className="text-xs text-muted-foreground">
            {sites.length} 個網站 · {nc.data.monitors.length} 個同步 · {mon.data.jobs.length} 個排程{mutedCount ? ` · 不用理 ${mutedCount} 個` : ""} · 上次檢查 {ago(lastCheck)}
          </p>
        </div>
        <button
          type="button"
          disabled={mon.runNow.isPending}
          onClick={() =>
            mon.runNow.mutate(undefined, {
              onSuccess: () => toast.success("檢查完成"),
              onError: (e) => toast.error(e.message),
            })
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", mon.runNow.isPending && "animate-spin")} />
          {mon.runNow.isPending ? "檢查中…" : "立即檢查"}
        </button>
      </div>

      {totalAlerts > 0 && (
        <section>
          <SectionTitle>未處理的警示</SectionTitle>
          <ul className="space-y-3">
            {mon.data.alerts.map((a) => (
              <MonAlertCard
                key={`m${a.id}`}
                alert={a}
                busy={mon.resolveAlert.isPending || mon.muteSite.isPending}
                onResolve={() => mon.resolveAlert.mutate(a.id)}
                onMute={a.kind === "site" ? () => mute(a.ref) : undefined}
              />
            ))}
            {ncOpen.map((a) => (
              <AlertCard key={`n${a.id}`} alert={a} busy={nc.resolve.isPending} onResolve={() => nc.resolve.mutate(a.id)} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionTitle
          right={
            <div className="inline-flex rounded-xl border border-border bg-card p-1">
              {(["client", "own"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setTab(g)}
                  className={cn("h-9 rounded-lg px-3.5 text-sm transition-colors", tab === g ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {g === "client" ? "客人" : "自己的"} <span className="tabular-nums opacity-70">{count(g)}</span>
                </button>
              ))}
            </div>
          }
        >
          網站 · 每 10 分鐘檢查
        </SectionTitle>
        <div className="panel overflow-hidden p-0">
          {shown.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">這裡還沒有網站</p>
          ) : (
            <ul className="divide-y divide-border">
              {shown.map((s) => (
                <SiteItem
                  key={s.domain}
                  s={s}
                  onRemove={() => {
                    if (window.confirm(`停止監控 ${s.name}？`)) mon.removeSite.mutate(s.domain);
                  }}
                  onMute={() => mute(s.domain)}
                  onUnmute={() =>
                    mon.unmuteSite.mutate(s.domain, {
                      onSuccess: () => toast.success(`${s.name} 恢復監控`),
                      onError: (e) => toast.error(e.message),
                    })
                  }
                />
              ))}
            </ul>
          )}
          <AddSite busy={mon.addSite.isPending} onAdd={(v) => mon.addSite.mutateAsync(v)} />
        </div>
      </section>

      <section>
        <SectionTitle>自動同步 · NightClerk</SectionTitle>
        {nc.data.monitors.length === 0 ? (
          <div className="panel p-10 text-center text-sm text-muted-foreground">還沒有接上任何同步</div>
        ) : (
          <div className="space-y-3">
            {nc.data.monitors.map((m) => (
              <MonitorCard key={m.id} m={m} runs={nc.data.runs.filter((r) => r.monitor_id === m.id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle>排程 · 後台自動工作</SectionTitle>
        {mon.data.jobs.length === 0 ? (
          <div className="panel p-10 text-center text-sm text-muted-foreground">沒有排程</div>
        ) : (
          <CronList jobs={mon.data.jobs} />
        )}
      </section>
    </div>
  );
}

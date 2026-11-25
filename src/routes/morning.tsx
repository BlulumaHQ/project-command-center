import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronDown, CircleCheck, ExternalLink, Pause, Play, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { useAutopilot, type ProposalRow } from "@/data/autopilot";
import { useStore } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { relativeActivityTime } from "@/data/mapping";
import { DataError, DataSkeleton } from "@/components/DataState";
import { RobotAvatar } from "@/components/RobotAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/morning")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "晨報 · Bluluma HQ" },
      { name: "description", content: "AI 主管昨晚整理好的決定、確認和你的下一步。" },
      { property: "og:title", content: "晨報 · Bluluma HQ" },
    ],
  }),
  component: MorningPage,
});

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const today = () => { const d = new Date(); return `${d.getMonth() + 1}/${d.getDate()} 週${WEEK[d.getDay()]}`; };

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {title}{typeof count === "number" && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

function DecisionCard({ p, projectName, onAnswer }: { p: ProposalRow; projectName?: string | undefined; onAnswer: (choice: string, note: string) => void }) {
  const [note, setNote] = useState("");
  const [writing, setWriting] = useState(false);
  return (
    <article className="panel p-4 sm:p-5">
      {projectName && <p className="text-xs font-medium text-muted-foreground">{projectName}</p>}
      <h3 className="mt-1 font-semibold leading-snug">{p.question}</h3>
      {p.reason && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.reason}</p>}
      <div className="mt-3 grid gap-2">
        {p.options.map((o) => {
          const rec = o.key === p.recommended;
          return (
            <button key={o.key} type="button" onClick={() => onAnswer(o.key, note)}
              className={cn("flex min-h-14 w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-accent", rec ? "border-primary bg-primary/5" : "border-border")}>
              <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold", rec ? "bg-primary text-primary-foreground" : "bg-muted")}>{o.key}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium">{o.label}{rec && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">推薦</span>}</span>
                {o.detail && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{o.detail}</span>}
              </span>
            </button>
          );
        })}
      </div>
      {writing && <Textarea className="mt-3" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="給主管的意見（選了方案後一起送出）" autoFocus />}
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" className="h-10 flex-1" onClick={() => setWriting((v) => !v)}>{writing ? "收起意見" : "寫意見"}</Button>
        <Button variant="ghost" className="h-10 flex-1 text-muted-foreground" onClick={() => onAnswer("skip", note)}>先不要</Button>
      </div>
    </article>
  );
}

function MorningPage() {
  const ap = useAutopilot();
  const store = useStore();
  const [showDone, setShowDone] = useState(false);
  if (ap.error) return <DataError message={ap.error} retry={ap.retry} />;
  if (ap.loading || store.loading) return <DataSkeleton />;
  const nameOf = (id: string | null) => (id ? store.getProject(id)?.name : undefined);
  const agents = store.getAgents();
  const manager = agents.find((a) => a.is_manager);
  const lastNight = ap.health.recent.filter((r) => r.agent_id === "memo" || r.agent_id === "atlas");
  const healthy = !ap.settings.paused && ap.health.ok && ap.stuck.length === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {manager && <RobotAvatar id={manager.avatar} size={52} />}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">晨報 <span className="text-base font-normal text-muted-foreground">{today()}</span></h1>
            <p className="text-sm text-muted-foreground">{ap.decisions.length + ap.confirms.length === 0 ? "今天沒有要你決定的事" : `${ap.decisions.length} 個要你決定 · ${ap.confirms.length} 個要確認`}</p>
          </div>
        </div>
        <Button variant={ap.settings.paused ? "default" : "outline"} className="h-10 shrink-0" onClick={() => void ap.setPaused(!ap.settings.paused)}>
          {ap.settings.paused ? <><Play className="h-4 w-4" />恢復</> : <><Pause className="h-4 w-4" />全部暫停</>}
        </Button>
      </div>

      <div className={cn("flex items-start gap-3 rounded-2xl p-3.5 text-sm", healthy ? "bg-st-almost-bg text-st-almost-fg" : "bg-amber-50 text-amber-900")}>
        {healthy ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
        <div className="min-w-0 space-y-0.5">
          <p className="font-medium">{ap.settings.paused ? "自動化已暫停，排程醒來只看一眼就結束" : healthy ? "系統健康：全部正常" : lastNight.length === 0 ? "系統健康：昨晚夜班還沒跑" : "系統健康：有地方要看一下"}</p>
          {ap.health.problems.map((r) => <p key={r.id} className="text-xs">{r.agent_id}：{r.error ?? (r.finished_at ? r.summary : "跑太久沒結束")}</p>)}
          {ap.stuck.map((t) => <p key={t.id} className="text-xs">卡住：{t.title}{t.fail_count >= 2 ? `（失敗 ${t.fail_count} 次）` : ""}</p>)}
          {healthy && lastNight.slice(0, 2).map((r) => <p key={r.id} className="text-xs opacity-80">{r.summary}</p>)}
        </div>
      </div>

      {ap.decisions.length > 0 && (
        <Section title="要你決定" count={ap.decisions.length}>
          {ap.decisions.map((p) => <DecisionCard key={p.id} p={p} projectName={nameOf(p.project_id)} onAnswer={(c, n) => void ap.answer(p, c, n)} />)}
        </Section>
      )}

      {ap.confirms.length > 0 && (
        <Section title="做完了嗎？" count={ap.confirms.length}>
          <div className="panel divide-y divide-border">
            {ap.confirms.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{p.question.replace(/做完了嗎？?$/, "")}</p>
                  {p.reason && <p className="mt-0.5 text-xs text-muted-foreground">{p.reason}</p>}
                </div>
                <Button size="icon" variant="outline" className="h-11 w-11 shrink-0" aria-label="做完了" onClick={() => void ap.answer(p, "yes")}><Check className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost" className="h-11 w-11 shrink-0" aria-label="還沒" onClick={() => void ap.answer(p, "no")}><X className="h-5 w-5" /></Button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {ap.sonySteps.length > 0 && (
        <Section title="只剩你的一步">
          <ul className="panel divide-y divide-border">
            {ap.sonySteps.map((t) => (
              <li key={t.id}>
                <Link to="/project/$id" params={{ id: t.project_id }} className="flex min-h-14 items-center justify-between gap-3 p-3 hover:bg-accent">
                  <span className="min-w-0"><span className="block text-sm font-medium leading-snug">{t.title}</span><span className="text-xs text-muted-foreground">{nameOf(t.project_id)}{t.due_date ? ` · ${t.due_date.slice(5).replace("-", "/")} 前` : ""}</span></span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="昨晚做好" count={ap.doneOvernight.length}>
        {ap.doneOvernight.length === 0 ? <p className="text-sm text-muted-foreground">過去 24 小時還沒有完成的 task。</p> : (
          <div className="panel">
            <button type="button" className="flex min-h-12 w-full items-center justify-between px-3 text-sm" onClick={() => setShowDone((v) => !v)}>
              <span>{ap.doneOvernight.slice(0, 2).map((t) => t.title).join("、")}{ap.doneOvernight.length > 2 ? ` 等 ${ap.doneOvernight.length} 項` : ""}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", showDone && "rotate-180")} />
            </button>
            {showDone && (
              <ul className="divide-y divide-border border-t border-border">
                {ap.doneOvernight.map((t) => (
                  <li key={t.id} className="p-3 text-sm">
                    <p className="font-medium leading-snug">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{nameOf(t.project_id)} · {relativeActivityTime(Date.parse(t.done_at!))}{t.evidence ? ` · ${t.evidence}` : ""}</p>
                    {t.result_url && <a href={t.result_url} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-xs text-primary">打開成果 <ExternalLink className="h-3 w-3" /></a>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Section>

      <p className="text-xs text-muted-foreground">用量：過去 24 小時 AI 處理 {ap.touchedToday} 個 task{ap.modelsToday.length ? ` · ${ap.modelsToday.join("、")}` : ""} · 每天上限 {ap.settings.daily_task_cap} 個</p>
    </div>
  );
}

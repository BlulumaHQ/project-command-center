import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Copy, ExternalLink, Inbox, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore, type AgentRow, type AgentStatus, type DepartmentRow, type EscalationRule } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { RobotAvatar } from "@/components/RobotAvatar";
import { AgentOffice, deskTitle } from "@/components/AgentOffice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { relativeActivityTime } from "@/data/mapping";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/team")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "AI 團隊 · Bluluma HQ" },
      { name: "description", content: "每位 AI 員工的職責、狀態與工作紀錄。" },
      { property: "og:title", content: "AI 團隊 · Bluluma HQ" },
    ],
  }),
  component: TeamPage,
});

const statusMeta: Record<AgentStatus, { label: string; dot: string; chip: string }> = {
  ok: { label: "正常", dot: "bg-st-almost-bar", chip: "bg-st-almost-bg text-st-almost-fg" },
  check: { label: "待確認", dot: "bg-amber-500", chip: "bg-amber-100 text-amber-800" },
  broken: { label: "出錯", dot: "bg-st-deadline-bar", chip: "bg-st-deadline-bg text-st-deadline-fg" },
  idle: { label: "還沒上班", dot: "bg-muted-foreground/50", chip: "bg-muted text-muted-foreground" },
};

function StatusPill({ status }: { status: AgentStatus }) {
  const m = statusMeta[status];
  return <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", m.chip)}><span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />{m.label}</span>;
}

function fixPrompt(agent: AgentRow, problem: string) {
  const target = agent.skill ? `skill「${agent.skill}」` : `「${agent.name}」這個自動化`;
  return [
    `我的 AI 員工 ${agent.name}（${agent.name_zh}）需要修理。`,
    `它負責：${agent.role}`,
    `問題：${problem.trim() || "（請先問我哪裡出錯）"}`,
    "",
    `請讀 ${target} 現在的內容，找出原因，用 propose_skills 改好讓我存檔。改完後把 Bluluma HQ 裡 pcc_agents 這位員工的 status 改回 ok，並在 pcc_agent_runs 記一筆修理紀錄。`,
  ].join("\n");
}

function FixDialog({ agent, onClose, onReported }: { agent: AgentRow | null; onClose: () => void; onReported: (a: AgentRow, problem: string) => void }) {
  const [problem, setProblem] = useState("");
  if (!agent) return null;
  const prompt = fixPrompt(agent, problem);
  const openClaude = () => {
    onReported(agent, problem);
    window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`, "_blank", "noopener");
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); toast.success("已複製，貼到 Claude 就好"); onReported(agent, problem); }
    catch { toast.error("複製失敗"); }
  };
  return (
    <Dialog open onOpenChange={(o) => { if (!o) { setProblem(""); onClose(); } }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <RobotAvatar id={agent.avatar} size={48} />
            <div className="text-left">
              <DialogTitle>修理 {agent.name}</DialogTitle>
              <DialogDescription>{agent.role}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <label className="block text-sm font-medium" htmlFor="fix-problem">哪裡做錯了？</label>
        <Textarea id="fix-problem" value={problem} onChange={(e) => setProblem(e.target.value)} rows={4} autoFocus
          placeholder="例如：上線後 favicon 沒換、Contact form 收不到信…" />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={openClaude} disabled={!problem.trim()} className="h-11"><ExternalLink className="h-4 w-4" />交給 Claude 修</Button>
          <Button variant="outline" onClick={() => void copy()} disabled={!problem.trim()} className="h-11"><Copy className="h-4 w-4" />複製指令</Button>
        </div>
        <p className="text-xs text-muted-foreground">Claude 改好 skill 後，你按存檔就完成。這位員工會先標成「待確認」。</p>
      </DialogContent>
    </Dialog>
  );
}

function AgentCard({ agent, lastRun, runs, onFix, manager = false }: {
  agent: AgentRow; lastRun: number; runs: { id: string; summary: string; created_at: string }[]; onFix: () => void; manager?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article id={`agent-${agent.id}`} className={cn("panel flex scroll-mt-24 flex-col p-4 sm:p-5", manager && "border-primary/40")}>
      <div className="flex items-start gap-3">
        <RobotAvatar id={agent.avatar} size={manager ? 72 : 60} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold">{agent.name} <span className="font-normal text-muted-foreground">{agent.name_zh}</span></h3>
            <StatusPill status={agent.status} />
          </div>
          <p className="mt-1 text-sm leading-relaxed">{agent.role}</p>
        </div>
      </div>
      {agent.status_note && <p className="mt-3 rounded-xl bg-muted p-2.5 text-xs text-muted-foreground">{agent.status_note}</p>}
      <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
        {agent.trigger_hint && <div className="flex gap-2"><dt className="shrink-0">怎麼叫他</dt><dd className="text-foreground">{agent.trigger_hint}</dd></div>}
        <div className="flex gap-2"><dt className="shrink-0">上次工作</dt><dd className="text-foreground">{relativeActivityTime(lastRun)}</dd></div>
        {agent.skill && <div className="flex gap-2"><dt className="shrink-0">Skill</dt><dd className="truncate font-mono">{agent.skill.replace(/-?lovable-?/gi, "-").replace(/^-|-$/g, "")}</dd></div>}
      </dl>
      {open && (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
          {runs.length === 0 ? <li className="text-muted-foreground">還沒有工作紀錄</li> : runs.slice(0, 5).map((r) => (
            <li key={r.id} className="flex gap-2"><span className="shrink-0 text-muted-foreground">{relativeActivityTime(Date.parse(r.created_at))}</span><span>{r.summary}</span></li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex gap-2 pt-4">
        <Button variant="outline" className="h-10 flex-1" onClick={() => setOpen((v) => !v)}>{open ? "收起紀錄" : "工作紀錄"}</Button>
        <Button variant="outline" className="h-10 flex-1" onClick={onFix}><Wrench className="h-4 w-4" />修理</Button>
      </div>
    </article>
  );
}

const PHASE_LABEL: Record<DepartmentRow["phase"], string> = { hq: "統籌", pre: "上線前", post: "上線後營運" };

/** 部門說明卡: what the department owns, when it runs, what it hands you, when it wakes you. */
function DeptCard({ d }: { d: DepartmentRow }) {
  const rows: [string, string | null | undefined][] = [["負責", d.duty], ["什麼時候跑", d.schedule], ["交給你", d.output], ["什麼時候找你", d.escalate]];
  if (!rows.some(([, v]) => v)) return null;
  return (
    <dl className="grid gap-x-4 gap-y-1.5 rounded-2xl bg-muted/60 p-3 text-sm sm:grid-cols-2">
      {rows.filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className="flex gap-2"><dt className="w-[5.5rem] shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0">{v}</dd></div>
      ))}
    </dl>
  );
}

/** The one shared list every department follows: only these things interrupt Sony. */
function EscalationPanel({ rules }: { rules: EscalationRule[] }) {
  if (rules.length === 0) return null;
  const push = rules.filter((r) => r.push);
  const later = rules.filter((r) => !r.push);
  return (
    <section className="panel p-4 sm:p-5" aria-label="叫醒老闆清單">
      <h2 className="font-semibold">叫醒老闆清單</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">所有部門共用。只有清單上的事會打擾你，其他事各部門自己處理，結果放晨報。</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-st-deadline-fg"><BellRing className="h-3.5 w-3.5" />立刻推播到手機</p>
          <ul className="mt-1.5 space-y-1.5">{push.map((r) => <li key={r.key} className="text-sm"><span className="font-medium">{r.label}</span><span className="text-muted-foreground"> · {r.detail}</span></li>)}</ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Inbox className="h-3.5 w-3.5" />放晨報，不推播</p>
          <ul className="mt-1.5 space-y-1.5">{later.map((r) => <li key={r.key} className="text-sm"><span className="font-medium">{r.label}</span></li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function TeamPage() {
  const store = useStore();
  const [fixing, setFixing] = useState<AgentRow | null>(null);
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const agents = store.getAgents();
  const departments = store.getDepartments();
  const runsFor = (id: string) => store.getAgentRuns(id);
  const lastRun = (a: AgentRow) => Math.max(a.last_run_at ? Date.parse(a.last_run_at) : 0, ...runsFor(a.id).map((r) => Date.parse(r.created_at)));
  const counts = { ok: agents.filter((a) => a.status === "ok").length, attention: agents.filter((a) => a.status === "check" || a.status === "broken").length };
  const report = (a: AgentRow, problem: string) => { void store.setAgentStatus(a.id, "check", `修理中：${problem.trim().slice(0, 80)}`); };
  const known = new Set(departments.map((d) => d.id));
  const unassigned = agents.filter((a) => !a.department_id || !known.has(a.department_id));
  const staffed = departments.filter((d) => d.phase !== "hq" && agents.some((a) => a.department_id === d.id)).length;
  const deptCount = departments.filter((d) => d.phase !== "hq").length;

  const card = (a: AgentRow) => <AgentCard key={a.id} manager={a.is_manager} agent={a} lastRun={lastRun(a)} runs={runsFor(a.id)} onFix={() => setFixing(a)} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI 團隊</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {deptCount} 個部門 · {staffed} 個已上班 · {agents.length} 個 skill / 自動化{counts.attention > 0 && ` · ${counts.attention} 個要看一下`}
        </p>
      </div>
      <AgentOffice departments={departments} agents={agents} lastRunOf={lastRun} />
      <EscalationPanel rules={store.getEscalation()} />
      {departments.map((d) => {
        const members = agents.filter((a) => a.department_id === d.id);
        return (
          <section key={d.id} id={`dept-${d.id}`} className="scroll-mt-24 space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{PHASE_LABEL[d.phase]}</span>
              <h2 className="text-lg font-semibold">{deskTitle(d)}</h2>
              {d.summary && <p className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1">{d.summary}</p>}
            </div>
            <DeptCard d={d} />
            {members.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">籌備中：這個部門的 skill 還沒寫。</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{members.map(card)}</div>
            )}
          </section>
        );
      })}
      {unassigned.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-b border-border pb-2 text-lg font-semibold">未分部門</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{unassigned.map(card)}</div>
        </section>
      )}
      <FixDialog agent={fixing} onClose={() => setFixing(null)} onReported={report} />
    </div>
  );
}

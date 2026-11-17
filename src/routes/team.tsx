import { createFileRoute } from "@tanstack/react-router";
import { Copy, ExternalLink, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore, type AgentRow, type AgentStatus } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { RobotAvatar } from "@/components/RobotAvatar";
import { AgentOffice } from "@/components/AgentOffice";
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
          placeholder="例如：上線後 favicon 還是 Lovable 的、忘了關 badge…" />
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
        {agent.skill && <div className="flex gap-2"><dt className="shrink-0">Skill</dt><dd className="truncate font-mono">{agent.skill}</dd></div>}
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

function TeamPage() {
  const store = useStore();
  const [fixing, setFixing] = useState<AgentRow | null>(null);
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const agents = store.getAgents();
  const manager = agents.find((a) => a.is_manager);
  const crew = agents.filter((a) => !a.is_manager);
  const runsFor = (id: string) => store.getAgentRuns(id);
  const lastRun = (a: AgentRow) => Math.max(a.last_run_at ? Date.parse(a.last_run_at) : 0, ...runsFor(a.id).map((r) => Date.parse(r.created_at)));
  const counts = { ok: agents.filter((a) => a.status === "ok").length, attention: agents.filter((a) => a.status === "check" || a.status === "broken").length };
  const report = (a: AgentRow, problem: string) => { void store.setAgentStatus(a.id, "check", `修理中：${problem.trim().slice(0, 80)}`); };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI 團隊</h1>
        <p className="mt-1 text-sm text-muted-foreground">{agents.length} 位員工 · {counts.ok} 位正常{counts.attention > 0 && ` · ${counts.attention} 位要看一下`}</p>
      </div>
      <AgentOffice agents={agents} lastRunOf={lastRun} />
      {manager && <AgentCard manager agent={manager} lastRun={lastRun(manager)} runs={runsFor(manager.id)} onFix={() => setFixing(manager)} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {crew.map((a) => <AgentCard key={a.id} agent={a} lastRun={lastRun(a)} runs={runsFor(a.id)} onFix={() => setFixing(a)} />)}
      </div>
      <FixDialog agent={fixing} onClose={() => setFixing(null)} onReported={report} />
    </div>
  );
}

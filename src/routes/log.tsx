import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { RobotAvatar } from "@/components/RobotAvatar";
import { vancouverDate } from "@/data/tasks";
import { formatDate } from "@/data/mapping";

export const Route = createFileRoute("/log")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "紀錄 · Bluluma HQ" },
      { name: "description", content: "所有專案進度與 AI 員工的工作紀錄。" },
      { property: "og:title", content: "紀錄 · Bluluma HQ" },
    ],
  }),
  component: LogPage,
});

interface Entry { id: string; at: string; text: string; projectId: string | null; agent: string; }

function LogPage() {
  const store = useStore();
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const names = new Map(store.getProjects().map((p) => [p.id, p.name]));
  const agentAvatar = new Map(store.getAgents().map((a) => [a.id, a.avatar]));
  const entries: Entry[] = [
    ...store.getAllLogs().map((l) => ({ id: `l${l.id}`, at: l.created_at, text: l.summary, projectId: l.project_id, agent: "memo" })),
    ...store.getAgentRuns().map((r) => ({ id: `r${r.id}`, at: r.created_at, text: r.summary, projectId: r.project_id, agent: agentAvatar.get(r.agent_id) ?? r.agent_id })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 150);

  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const day = vancouverDate(new Date(e.at));
    groups.set(day, [...(groups.get(day) ?? []), e]);
  }
  const today = vancouverDate();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">紀錄</h1>
        <p className="mt-1 text-sm text-muted-foreground">每次收工和 AI 員工做的事，都在這裡。</p>
      </div>
      {entries.length === 0 && <div className="panel p-10 text-center text-sm text-muted-foreground">還沒有紀錄</div>}
      {[...groups].map(([day, list]) => (
        <section key={day}>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">{day === today ? "今天" : day.slice(5).replace("-", "/")}</h2>
          <ul className="panel divide-y divide-border">
            {list.map((e) => (
              <li key={e.id} className="flex gap-3 p-3.5">
                <RobotAvatar id={e.agent} size={32} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed">{e.text}</p>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(e.at, true).slice(6)}
                    {e.projectId && names.has(e.projectId) && <> · <Link to="/project/$id" params={{ id: e.projectId }} className="hover:underline">{names.get(e.projectId)}</Link></>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

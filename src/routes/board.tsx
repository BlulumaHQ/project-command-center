import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Loader2, Plus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { requireSignedIn } from "@/lib/auth";
import { DIRECTORS, meetingPrompt, type Director } from "@/lib/board";
import { useBoard, type BoardTurn, type MeetingRow } from "@/data/board-store";
import { BoardRoom } from "@/components/BoardRoom";
import { RobotAvatar } from "@/components/RobotAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { relativeActivityTime } from "@/data/mapping";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/board")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "董事會 · Bluluma HQ" },
      { name: "description", content: "Bluluma 董事會：多位名人視角一起討論你的決策。" },
      { property: "og:title", content: "董事會 · Bluluma HQ" },
    ],
  }),
  component: BoardPage,
});

const byId = (id: string): Director | undefined => DIRECTORS.find((d) => d.id === id);

const EXAMPLE_PROMPTS = [
  "例如：明年要把 recurring revenue 拉到總營收的 50%，應該優先投資 AI 自動化、white-label 合作夥伴，還是高端品牌專案？",
  "例如：Bluluma 應該從按專案報價，轉型成月費制的 growth partner 嗎？這對 cash flow、客戶留存和品牌定位各有什麼影響？",
  "例如：要鞏固 Bluluma 的 premium 定位，該走垂直產業專精（醫療、地產），還是加深 brand strategy 服務？",
];

function Minutes({ turn }: { turn: BoardTurn }) {
  const m = turn.minutes;
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm text-ink-foreground">
        {turn.question}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {m.round1.map((r) => {
          const d = byId(r.id);
          return (
            <article key={r.id} className="panel p-4">
              <div className="flex items-center gap-2.5">
                <RobotAvatar id={r.id} size={40} className="shrink-0" />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">{d?.name ?? r.id}</h3>
                  {d && (
                    <p className="text-xs font-medium" style={{ color: d.color }}>
                      {d.focus}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-3 font-semibold leading-snug">{r.verdict}</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                {r.points.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden>•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm">❓ {r.ask}</p>
            </article>
          );
        })}
      </div>

      {m.roast.length > 0 && (
        <section className="panel p-4">
          <h3 className="text-sm font-semibold">⚔️ Roast</h3>
          <ul className="mt-2 space-y-3">
            {m.roast.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <RobotAvatar id={r.from} size={32} className="shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {byId(r.from)?.name ?? r.from} → {byId(r.to)?.name ?? r.to}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{r.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel space-y-3 border-primary/40 p-4">
        <h3 className="text-sm font-semibold">🧑‍⚖️ 主席總結</h3>
        {m.summary.chair && <p className="text-sm leading-relaxed">{m.summary.chair}</p>}
        {m.summary.consensus.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">✅ 共識</p>
            <ul className="mt-1 space-y-1 text-sm">
              {m.summary.consensus.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>
        )}
        {m.summary.split.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">⚔️ 分歧</p>
            <ul className="mt-1 space-y-1 text-sm">
              {m.summary.split.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-xs font-semibold text-primary">👉 下一步</p>
          <p className="mt-1 font-semibold leading-snug">{m.summary.next}</p>
        </div>
      </section>
    </div>
  );
}

function BoardPage() {
  const board = useBoard();
  const [topic, setTopic] = useState("");
  const [examplePrompt] = useState(
    () => EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)],
  );
  const [picked, setPicked] = useState<string[]>([]); // empty = everyone
  const [activeId, setActiveId] = useState<string | null>(null);
  const active: MeetingRow | null = board.meetings.find((m) => m.id === activeId) ?? null;
  const busy = board.ask.isPending;

  const isOn = (id: string) => picked.length === 0 || picked.includes(id);
  const toggle = (id: string) => {
    setPicked((cur) => {
      const base = cur.length === 0 ? DIRECTORS.map((d) => d.id) : cur;
      const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
      if (next.length === 0) return cur; // keep at least one director
      return next.length === DIRECTORS.length ? [] : next;
    });
  };
  const seated = DIRECTORS.filter((d) => isOn(d.id));

  const start = () => {
    const question = topic.trim();
    if (!question || busy) return;
    board.ask.mutate(
      { meeting: active, question, directors: seated },
      {
        onSuccess: ({ row, saveError }) => {
          setActiveId(row.id);
          setTopic("");
          if (saveError) toast.error(`會議紀錄儲存失敗：${saveError}`);
        },
        onError: (e) => toast.error(e.message, { duration: 8000 }),
      },
    );
  };
  const openInClaude = () =>
    window.open(
      `https://claude.ai/new?q=${encodeURIComponent(meetingPrompt(topic, picked))}`,
      "_blank",
      "noopener",
    );

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">董事會</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {seated.length} 位董事出席 · 點機器人可以請他離席或回來
          </p>
        </div>
        {active && (
          <Button variant="outline" size="sm" onClick={() => setActiveId(null)} disabled={busy}>
            <Plus className="h-4 w-4" />
            新會議
          </Button>
        )}
      </div>

      <BoardRoom directors={DIRECTORS} picked={picked} onToggle={toggle} />

      {active && (
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground">
            會議：{active.topic} · {relativeActivityTime(Date.parse(active.created_at))}
          </p>
          {active.turns.map((t, i) => (
            <Minutes key={i} turn={t} />
          ))}
        </div>
      )}

      <section className="panel space-y-3 p-4 sm:p-5">
        <label htmlFor="board-topic" className="block font-semibold">
          {active ? "追問董事" : "今天要討論什麼？"}
        </label>
        <Textarea
          id="board-topic"
          rows={3}
          value={topic}
          disabled={busy}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) start();
          }}
          placeholder={
            active ? "例如：那 Developer 應該定多少？" : examplePrompt
          }
        />
        {busy ? (
          <div className="flex h-11 items-center justify-center gap-2 rounded-xl bg-muted text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {seated.length} 位董事討論中…大約 30–60 秒
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
            <Button className="h-11" disabled={!topic.trim()} onClick={start}>
              <Send className="h-4 w-4" />
              {active ? "追問" : "開會"}
            </Button>
            <Button
              variant="outline"
              className="h-11"
              disabled={!topic.trim()}
              onClick={openInClaude}
            >
              <ExternalLink className="h-4 w-4" />在 Claude 開會
            </Button>
          </div>
        )}
      </section>

      {!active && board.meetings.length > 0 && (
        <section className="panel p-4 sm:p-5">
          <h2 className="font-semibold">過去的會議</h2>
          <ul className="mt-2 divide-y divide-border">
            {board.meetings.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(m.id)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.topic}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {relativeActivityTime(Date.parse(m.updated_at))} · {m.turns.length} 輪 ·{" "}
                      {m.turns.at(-1)?.minutes.summary.next}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!active && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIRECTORS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              aria-pressed={isOn(d.id)}
              className={cn(
                "panel flex flex-col p-4 text-left transition-opacity sm:p-5",
                !isOn(d.id) && "opacity-45",
              )}
            >
              <div className="flex items-start gap-3">
                <RobotAvatar id={d.id} size={56} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-sm font-medium" style={{ color: d.color }}>
                    {d.focus}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    isOn(d.id)
                      ? "bg-st-almost-bg text-st-almost-fg"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isOn(d.id) ? "出席" : "離席"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.lens}</p>
              <p className="mt-2 text-sm">必問：{d.asks}</p>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        董事觀點是根據公開資料模擬的思考框架，不是本人。
      </p>
    </div>
  );
}

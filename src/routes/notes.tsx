import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ListPlus, Pin, PinOff, Trash2, Undo2, X } from "lucide-react";
import { requireSignedIn } from "@/lib/auth";
import { useStore } from "@/data/store";
import { formatDate } from "@/data/mapping";
import { IDEA_STATUS, IDEA_TAGS, useIdeas, type IdeaRow } from "@/data/ideas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notes")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "隨手記 · Bluluma HQ" },
      { name: "description", content: "想到什麼先記下來，有空再排進任務。" },
      { property: "og:title", content: "隨手記 · Bluluma HQ" },
    ],
  }),
  component: NotesPage,
});

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-full border px-3 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 font-semibold text-primary"
          : "border-border text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function NotesPage() {
  const ideas = useIdeas();
  const store = useStore();
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);

  const visible = ideas.ideas.filter((i) => !filter || i.tag === filter);
  const open = visible.filter((i) => i.status === "new" || i.status === "planned");
  const closed = visible.filter((i) => i.status === "done" || i.status === "dropped");
  const usedTags = useMemo(
    () => Array.from(new Set(ideas.ideas.map((i) => i.tag).filter((t): t is string => Boolean(t)))),
    [ideas.ideas],
  );

  const save = () => {
    if (!body.trim()) return;
    ideas.add(body, tag);
    setBody("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">隨手記</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          想到什麼先記下來，有空再排進任務。也可以跟 HQ 助理說「幫我記一下……」。
        </p>
      </header>

      <section className="panel space-y-3 p-4 md:p-5">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="例如：普通網站客戶也可以做監控，server 當掉第一時間通知我"
          className="min-h-24 text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              save();
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          {IDEA_TAGS.map((t) => (
            <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
              {t}
            </Chip>
          ))}
          <Button className="ml-auto h-11 px-6" onClick={save} disabled={!body.trim()}>
            記下來
          </Button>
        </div>
      </section>

      {usedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip active={filter === null} onClick={() => setFilter(null)}>
            全部
          </Chip>
          {usedTags.map((t) => (
            <Chip key={t} active={filter === t} onClick={() => setFilter(filter === t ? null : t)}>
              {t}
            </Chip>
          ))}
        </div>
      )}

      {ideas.isPending ? (
        <p className="text-sm text-muted-foreground">載入中…</p>
      ) : ideas.error ? (
        <p className="text-sm text-destructive">讀取失敗：{ideas.error.message}</p>
      ) : open.length === 0 ? (
        <p className="panel p-6 text-center text-sm text-muted-foreground">
          目前沒有待處理的想法。
        </p>
      ) : (
        <ul className="space-y-3">
          {open.map((i) => (
            <IdeaCard key={i.id} idea={i} ideas={ideas} store={store} />
          ))}
        </ul>
      )}

      {closed.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowClosed((s) => !s)}
            className="min-h-10 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {showClosed ? "收起" : "顯示"}已完成／不做的（{closed.length}）
          </button>
          {showClosed && (
            <ul className="mt-3 space-y-3 opacity-70">
              {closed.map((i) => (
                <IdeaCard key={i.id} idea={i} ideas={ideas} store={store} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
  ideas,
  store,
}: {
  idea: IdeaRow;
  ideas: ReturnType<typeof useIdeas>;
  store: ReturnType<typeof useStore>;
}) {
  const [picking, setPicking] = useState(false);
  const [projectId, setProjectId] = useState("");
  const projects = store.getProjects().filter((p) => p.status !== "done");
  const projectName = idea.project_id ? store.getProject(idea.project_id)?.name : null;
  const isOpen = idea.status === "new" || idea.status === "planned";

  const makeTask = () => {
    if (!projectId) return;
    const title = (idea.body.split("\n")[0] ?? idea.body).slice(0, 120);
    const taskId = store.addTask(projectId, title);
    if (taskId) ideas.linkTask(idea.id, projectId, taskId);
    setPicking(false);
  };

  return (
    <li className={cn("panel p-4", idea.pinned && "ring-1 ring-primary/40")}>
      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{idea.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{formatDate(idea.created_at, true)}</span>
        {idea.tag && <span className="rounded-full bg-accent px-2 py-0.5">{idea.tag}</span>}
        <span
          className={cn(
            "rounded-full px-2 py-0.5",
            idea.status === "planned" && "bg-st-progress-bg text-st-progress-fg",
            idea.status === "done" && "bg-st-almost-bg text-st-almost-fg",
          )}
        >
          {IDEA_STATUS[idea.status]}
        </span>
        {projectName && idea.project_id && (
          <Link to="/project/$id" params={{ id: idea.project_id }} className="text-primary hover:underline">
            → {projectName}
          </Link>
        )}
      </div>

      {picking ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="排進哪個專案"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">選一個專案…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button className="h-11 flex-1" onClick={makeTask} disabled={!projectId}>
              加成任務
            </Button>
            <Button variant="ghost" className="h-11" onClick={() => setPicking(false)} aria-label="取消">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {isOpen ? (
            <>
              {idea.status === "new" && (
                <Button variant="outline" size="sm" className="h-9" onClick={() => setPicking(true)}>
                  <ListPlus className="mr-1 h-4 w-4" />
                  排進任務
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-9" onClick={() => ideas.setStatus(idea.id, "done")}>
                <Check className="mr-1 h-4 w-4" />
                做完了
              </Button>
              <Button variant="ghost" size="sm" className="h-9" onClick={() => ideas.togglePin(idea.id, !idea.pinned)}>
                {idea.pinned ? <PinOff className="mr-1 h-4 w-4" /> : <Pin className="mr-1 h-4 w-4" />}
                {idea.pinned ? "取消置頂" : "置頂"}
              </Button>
              <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={() => ideas.setStatus(idea.id, "dropped")}>
                不做了
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="h-9" onClick={() => ideas.setStatus(idea.id, "new")}>
                <Undo2 className="mr-1 h-4 w-4" />
                放回去
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-destructive"
                onClick={() => {
                  if (window.confirm("確定刪掉這則？刪了就找不回來。")) ideas.remove(idea.id);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                刪除
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
}

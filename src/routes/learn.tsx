import { createFileRoute } from "@tanstack/react-router";
import { Check, ExternalLink, Bookmark, X } from "lucide-react";
import { useState } from "react";
import { useStore, type LearnRow, type LearnStatus } from "@/data/store";
import { requireSignedIn } from "@/lib/auth";
import { DataError, DataSkeleton } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "學習 · Bluluma HQ" },
      { name: "description", content: "從 Facebook 短片整理出來、想學但還沒 follow up 的東西。" },
      { property: "og:title", content: "學習 · Bluluma HQ" },
    ],
  }),
  component: LearnPage,
});

type View = "open" | "todo" | "done";
const views: { id: View; label: string }[] = [
  { id: "open", label: "還沒看" }, { id: "todo", label: "要學" }, { id: "done", label: "學會了" },
];
const stars = (n: number | null) => n === 3 ? "優先學" : n === 2 ? "值得看" : "參考";
const starTone = (n: number | null) => n === 3 ? "bg-st-deadline-bg text-st-deadline-fg" : n === 2 ? "bg-st-progress-bg text-st-progress-fg" : "bg-muted text-muted-foreground";

function LearnCard({ item, onStatus }: { item: LearnRow; onStatus: (s: LearnStatus) => void }) {
  return (
    <article className="panel flex flex-col p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", starTone(item.usefulness))}>{stars(item.usefulness)}</span>
        {item.category && <span className="text-xs text-muted-foreground">{item.category}</span>}
      </div>
      <h3 className="mt-2 font-semibold leading-snug">{item.title}</h3>
      {item.summary && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>}
      {item.action && <p className="mt-3 rounded-xl bg-accent p-3 text-sm text-accent-foreground"><span className="font-medium">對你的用法　</span>{item.action}</p>}
      <div className="mt-1 pt-2 text-xs text-muted-foreground">{item.author}</div>
      <div className="mt-auto grid grid-cols-4 gap-2 pt-3">
        <Button asChild variant="outline" className="h-10 px-0"><a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="看影片"><ExternalLink className="h-4 w-4" />看</a></Button>
        <Button variant={item.status === "todo" ? "default" : "outline"} className="h-10 px-0" onClick={() => onStatus(item.status === "todo" ? "new" : "todo")}><Bookmark className="h-4 w-4" />要學</Button>
        <Button variant={item.status === "done" ? "default" : "outline"} className="h-10 px-0" onClick={() => onStatus(item.status === "done" ? "new" : "done")}><Check className="h-4 w-4" />會了</Button>
        <Button variant="ghost" className="h-10 px-0 text-muted-foreground" onClick={() => onStatus("skip")}><X className="h-4 w-4" />略過</Button>
      </div>
    </article>
  );
}

function LearnPage() {
  const store = useStore();
  const [view, setView] = useState<View>("open");
  const [cat, setCat] = useState("");
  if (store.error) return <DataError message={store.error} retry={store.retry} />;
  if (store.loading) return <DataSkeleton />;
  const all = store.getLearning().filter((l) => l.status !== "skip");
  const inView = (l: LearnRow) => view === "open" ? l.status === "new" : l.status === view;
  const cats = Array.from(new Set(all.filter(inView).map((l) => l.category).filter((c): c is string => Boolean(c))));
  const list = all.filter((l) => inView(l) && (!cat || l.category === cat)).sort((a, b) => (b.usefulness ?? 0) - (a.usefulness ?? 0));
  const count = (v: View) => all.filter((l) => v === "open" ? l.status === "new" : l.status === v).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">學習</h1>
        <p className="mt-1 text-sm text-muted-foreground">你傳給自己的短片，整理成一句話重點和對你的用法。</p>
      </div>
      <div className="inline-flex rounded-xl border border-border bg-card p-1">
        {views.map((v) => (
          <button key={v.id} onClick={() => { setView(v.id); setCat(""); }}
            className={cn("h-9 rounded-lg px-3.5 text-sm transition-colors", view === v.id ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground")}>
            {v.label} <span className="tabular-nums opacity-70">{count(v.id)}</span>
          </button>
        ))}
      </div>
      {cats.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {["", ...cats].map((c) => (
            <button key={c || "all"} onClick={() => setCat(c)}
              className={cn("h-8 shrink-0 rounded-full border px-3 text-sm", cat === c ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card text-muted-foreground")}>
              {c || "全部"}
            </button>
          ))}
        </div>
      )}
      {list.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-muted-foreground">{view === "open" ? "全部看過了" : view === "todo" ? "還沒有標「要學」的" : "還沒有學會的"}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => <LearnCard key={l.id} item={l} onStatus={(s) => void store.setLearnStatus(l.id, s)} />)}
        </div>
      )}
    </div>
  );
}

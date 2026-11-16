import { useState } from "react";
import { X } from "lucide-react";
import type { useStore } from "@/data/store";
import { formatDate } from "@/data/mapping";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type Store = ReturnType<typeof useStore>;

export function NotesBox({ store, projectId }: { store: Store; projectId?: string }) {
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("");
  const send = () => { if (!body.trim()) return; store.addNote(projectId ?? (target || null), body); setBody(""); };
  const notes = store.getNotes(projectId);
  const names = new Map(store.getProjects().map((p) => [p.id, p.name]));
  return (
    <div className="panel p-5">
      <h3 className="font-semibold">留言給 Claude</h3>
      {projectId ? (
        <div className="mt-3 space-y-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="跟 Claude 說：例如『Yu-Wei 回了，用 ×1.35』"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }} />
          <div className="flex justify-end"><Button onClick={send} disabled={!body.trim()}>送出</Button></div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select aria-label="指定專案" value={target} onChange={(e) => setTarget(e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3 text-sm sm:w-48">
            <option value="">（不指定）</option>
            {store.getProjects().map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="快速留言給 Claude" className="h-11 flex-1 rounded-xl"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} />
        </div>
      )}
      {notes.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {notes.map((n) => (
            <li key={n.id} className="flex gap-3 py-2.5">
              <span className={n.processed ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-st-almost-bar" : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50"} />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm">{n.body}</p>
                <div className="mt-0.5 text-xs text-muted-foreground">{formatDate(n.created_at, true)}{!projectId && n.project_id && ` · ${names.get(n.project_id) ?? n.project_id}`} · {n.processed ? "已處理" : "未處理"}</div>
                {n.processed && n.reply && <p className="mt-1 text-sm text-st-almost-fg">{n.reply}</p>}
              </div>
              {!n.processed && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="刪除留言" onClick={() => store.deleteNote(n.id)}><X className="h-3.5 w-3.5" /></Button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

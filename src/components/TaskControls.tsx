import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { dueTone, taskStatusLabel, vancouverDate, type TaskStatus } from "@/data/tasks";
import { cn } from "@/lib/utils";

const statusChip: Record<TaskStatus, string> = {
  todo: "bg-muted text-foreground",
  doing: "bg-st-progress-bg text-st-progress-fg",
  waiting: "bg-st-waiting-bg text-st-waiting-fg",
  done: "bg-st-almost-bg text-st-almost-fg",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export function StatusSelect({ value, onChange, className }: { value: TaskStatus; onChange: (s: TaskStatus) => void; className?: string }) {
  return (
    <select aria-label="狀態" value={value} onChange={(e) => onChange(e.target.value as TaskStatus)}
      className={cn("h-9 cursor-pointer rounded-full border-0 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring", statusChip[value], className)}>
      {(Object.keys(taskStatusLabel) as TaskStatus[]).map((s) => <option key={s} value={s}>{taskStatusLabel[s]}</option>)}
    </select>
  );
}

const toneClass = { overdue: "text-destructive font-semibold", soon: "text-st-deadline-bar font-medium", none: "text-muted-foreground" };
export function DueLabel({ due }: { due: string | null }) {
  if (!due) return null;
  return <span className={cn("text-xs tabular-nums", toneClass[dueTone(due, vancouverDate())])}>{due.slice(5).replace("-", "/")}</span>;
}

export function DuePicker({ value, onChange }: { value: string | null; onChange: (d: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="inline-flex h-9 min-w-16 items-center gap-1.5 rounded-lg px-2 text-sm hover:bg-muted" aria-label="設定期限">
            {value ? <DueLabel due={value} /> : <><CalendarIcon className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">期限</span></>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} onSelect={(d) => { if (d) onChange(format(d, "yyyy-MM-dd")); setOpen(false); }} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
      {value && <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="清除期限" onClick={() => onChange(null)}><X className="h-3.5 w-3.5" /></Button>}
    </div>
  );
}

export function EditableTitle({ title, onSave, done }: { title: string; onSave: (t: string) => void; done?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.select(); }, [editing]);
  if (!editing) return <button type="button" onClick={() => { setDraft(title); setEditing(true); }} className={cn("text-left text-sm hover:underline", done && "text-muted-foreground line-through")}>{title}</button>;
  return <input ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="編輯待辦"
    onKeyDown={(e) => { if (e.key === "Enter") { if (draft.trim() && draft.trim() !== title) onSave(draft); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
    onBlur={() => setEditing(false)} className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm" />;
}

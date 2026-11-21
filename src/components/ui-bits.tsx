import type { Status } from "@/data/types";
import { statusLabel } from "@/data/store";
import { cn } from "@/lib/utils";

const chip: Record<Status, string> = {
  progress: "bg-st-progress-bg text-st-progress-fg",
  waiting: "bg-st-waiting-bg text-st-waiting-fg",
  deadline: "bg-st-deadline-bg text-st-deadline-fg",
  almost: "bg-st-almost-bg text-st-almost-fg",
  done: "bg-st-almost-bg text-st-almost-fg",
};
export const barColor: Record<Status, string> = {
  progress: "bg-st-progress-bar", waiting: "bg-st-waiting-bar", deadline: "bg-st-deadline-bar", almost: "bg-st-almost-bar", done: "bg-st-almost-bar",
};

export function StatusChip({ status }: { status: Status }) {
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium", chip[status])}>{statusLabel[status]}</span>;
}

export function ProgressBar({ pct, status }: { pct: number; status: Status }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", barColor[status])} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Marks a card whose data source isn't wired up yet (HQ 2.0 rule: never fake a number silently). */
export function NotConnected({ label = "未接資料" }: { label?: string }) {
  return <span className="inline-flex shrink-0 items-center rounded-full bg-st-waiting-bg px-2 py-0.5 text-[11px] font-medium text-st-waiting-fg">{label}</span>;
}

/** Hide/show button for money and price pages. */
export function RevealButton({ shown, onToggle, showLabel, hideLabel }: { shown: boolean; onToggle: () => void; showLabel: string; hideLabel: string }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={shown}
      className={cn("inline-flex h-11 items-center gap-2 rounded-xl border border-primary px-4 text-sm font-semibold transition",
        shown ? "bg-background text-primary hover:bg-primary/5" : "bg-primary text-primary-foreground hover:brightness-110")}>
      {shown ? hideLabel : showLabel}
    </button>
  );
}

export const MASK = "••••";

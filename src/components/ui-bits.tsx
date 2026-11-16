import type { Status } from "@/data/types";
import { statusLabel } from "@/data/store";
import { cn } from "@/lib/utils";

const chip: Record<Status, string> = {
  progress: "bg-st-progress-bg text-st-progress-fg",
  waiting: "bg-st-waiting-bg text-st-waiting-fg",
  deadline: "bg-st-deadline-bg text-st-deadline-fg",
  almost: "bg-st-almost-bg text-st-almost-fg",
};
export const barColor: Record<Status, string> = {
  progress: "bg-st-progress-bar", waiting: "bg-st-waiting-bar", deadline: "bg-st-deadline-bar", almost: "bg-st-almost-bar",
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

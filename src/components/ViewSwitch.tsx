import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Toggle between the project cards and the cross-project task table. */
export function ViewSwitch({ current }: { current: "projects" | "tasks" }) {
  const item = (active: boolean) => cn("inline-flex h-9 items-center rounded-lg px-3.5 text-sm transition-colors", active ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground");
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1">
      <Link to="/projects" className={item(current === "projects")}>專案卡片</Link>
      <Link to="/tasks" className={item(current === "tasks")}>待辦表</Link>
    </div>
  );
}

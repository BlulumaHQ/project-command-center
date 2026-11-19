import { Link, useNavigate } from "@tanstack/react-router";
import { Bot, FolderKanban, GraduationCap, History, Landmark, LayoutGrid, LogOut, Sun } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "今天", icon: Sun, exact: true },
  { to: "/projects", label: "專案", icon: FolderKanban, exact: false },
  { to: "/learn", label: "學習", icon: GraduationCap, exact: false },
  { to: "/team", label: "AI 團隊", icon: Bot, exact: false },
  { to: "/board", label: "董事會", icon: Landmark, exact: false },
  { to: "/tools", label: "工具", icon: LayoutGrid, exact: false },
  { to: "/log", label: "紀錄", icon: History, exact: false },
] as const;

function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  return {
    busy,
    signOut: async () => {
      setBusy(true);
      await queryClient.cancelQueries();
      queryClient.clear();
      const { error } = await supabase.auth.signOut();
      setBusy(false);
      if (!error) await navigate({ to: "/login", replace: true });
    },
  };
}

export function AppHeader() {
  const [logoFailed, setLogoFailed] = useState(false);
  const { busy, signOut } = useSignOut();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          {logoFailed ? (
            <span className="text-[13px] font-bold tracking-[0.12em] text-foreground">BLULUMA</span>
          ) : (
            <img src="/images/bluluma-logo.svg" alt="Bluluma Design" className="h-9 w-auto" onError={() => setLogoFailed(true)} />
          )}
          <span className="h-5 w-px bg-border" aria-hidden />
          <span className="truncate text-sm font-medium text-muted-foreground">HQ</span>
        </Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="主選單">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }}
              className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-ink !text-ink-foreground hover:bg-ink" }}>
              <n.icon className="h-4 w-4" />{n.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" className="ml-auto" disabled={busy} onClick={signOut} aria-label="登出">
          <LogOut className="h-4 w-4" /><span className="hidden sm:inline">登出</span>
        </Button>
      </div>
    </header>
  );
}

/** Thumb-reachable tab bar for phones. */
export function MobileTabBar() {
  return (
    <nav aria-label="主選單"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-7">
        {NAV.map((n) => (
          <li key={n.to}>
            <Link to={n.to} activeOptions={{ exact: n.exact }}
              className={cn("flex h-16 flex-col items-center justify-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground")}
              activeProps={{ className: "!text-primary font-medium" }}>
              <n.icon className="h-5 w-5" />{n.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

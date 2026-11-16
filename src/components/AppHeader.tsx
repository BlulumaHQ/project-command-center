import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, ListChecks, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export function AppHeader() {
  const [logoFailed, setLogoFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  async function signOut() {
    setSigningOut(true); setSignOutError("");
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) { setSignOutError(error.message); setSigningOut(false); return; }
    await navigate({ to: "/login", replace: true });
  }
  const q = useRouterState({ select: (s) => (s.location.search as { q?: string }).q ?? "" });

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" search={{ q: undefined }} className="flex min-w-0 items-center gap-3">
          {logoFailed ? (
            <span className="text-[14px] font-bold tracking-[0.12em] text-foreground">BLULUMA DESIGN</span>
          ) : (
            <img src="/images/bluluma-logo.svg" alt="Bluluma Design" className="h-7 w-auto" onError={() => setLogoFailed(true)} />
          )}
          <span className="h-5 w-px bg-border" aria-hidden />
          <span className="truncate text-sm font-medium text-muted-foreground">Bluluma HQ</span>
        </Link>
        <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
          <label className="relative flex-1 sm:w-72 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => navigate({ to: "/", search: { q: e.target.value || undefined }, replace: true })}
              placeholder="搜尋專案、品牌、下一步"
              className="h-10 rounded-xl bg-card pl-9"
              aria-label="搜尋專案"
            />
          </label>
          <Button asChild variant="outline" className="h-10 rounded-xl" title="待辦表">
            <Link to="/tasks" aria-label="待辦表"><ListChecks className="h-4 w-4" /><span className="hidden sm:inline">待辦表</span></Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-xl" title="工具">
            <Link to="/tools" aria-label="工具"><LayoutGrid className="h-4 w-4" /><span className="hidden sm:inline">工具</span></Link>
          </Button>
          <Button className="h-10 rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> 新專案
          </Button>
          {user && <Button variant="ghost" size="sm" disabled={signingOut} onClick={signOut}>登出</Button>}
        </div>
        {signOutError && <p role="alert" className="w-full text-sm text-destructive">{signOutError}</p>}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>新專案</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="專案名稱" />
            <Input placeholder="品牌 / 類別" />
            <Input placeholder="下一步" />
          </div>
          {/* TODO: wire to store.addProject() once Supabase is connected */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={() => setOpen(false)}>建立</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

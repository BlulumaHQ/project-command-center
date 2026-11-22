import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  CircleDollarSign,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  History,
  Landmark,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  NotebookPen,
  ScanFace,
  Sun,
  Tag,
  Users,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { TOOLS } from "@/lib/tools";
import { passkeySupported, registerFaceId } from "@/lib/passkey";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

/** Every HQ tab, in sidebar order. */
export const NAV: NavItem[] = [
  { to: "/", label: "今日", icon: Sun, exact: true },
  { to: "/projects", label: "專案", icon: FolderKanban },
  { to: "/tasks", label: "任務", icon: ListChecks },
  { to: "/notes", label: "隨手記", icon: NotebookPen },
  { to: "/clients", label: "客戶", icon: Users },
  { to: "/pricing", label: "價目表", icon: Tag },
  { to: "/money", label: "財務", icon: CircleDollarSign },
  { to: "/team", label: "AI 團隊", icon: Bot },
  { to: "/board", label: "董事會", icon: Landmark },
  { to: "/monitor", label: "監控", icon: Activity },
  { to: "/learn", label: "學習", icon: GraduationCap },
  { to: "/tools", label: "工具 & 手冊", icon: LayoutGrid },
  { to: "/log", label: "紀錄", icon: History },
];

/** Phone bottom bar: four tabs + 更多. */
const MOBILE_TABS = ["/", "/projects", "/clients", "/money"];

/** Standalone apps that open in a new tab; `soon` ones are planned but not built. */
const APPS: { name: string; url?: string; soon?: boolean }[] = [
  { name: "SEO Hub", soon: true },
  ...TOOLS.map((t) => ({ name: t.name, url: t.url })),
];

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

function FaceIdSetup() {
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(passkeySupported()), []);
  if (!supported) return null;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await registerFaceId();
          toast.success("Face ID 設定好了，下次直接刷臉登入");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Face ID 設定失敗");
        } finally {
          setBusy(false);
        }
      }}
      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
    >
      <ScanFace className="h-4 w-4" />
      設定 Face ID 登入
    </button>
  );
}

function Logo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={cn("text-[13px] font-bold tracking-[0.12em] text-foreground", className)}>
      BLULUMA
    </span>
  ) : (
    <img
      src="/images/bluluma-logo.svg"
      alt="Bluluma Design"
      className={cn("h-9 w-auto", className)}
      onError={() => setFailed(true)}
    />
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {NAV.map((n) => (
        <li key={n.to}>
          <Link
            to={n.to}
            activeOptions={{ exact: Boolean(n.exact) }}
            onClick={onNavigate}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{ className: "!bg-primary/10 !text-primary font-semibold" }}
          >
            <n.icon className="h-[18px] w-[18px]" />
            {n.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function AppLinks() {
  return (
    <div>
      <p className="mb-1.5 px-3 text-xs font-semibold tracking-wide text-muted-foreground">
        獨立 App · 開新分頁
      </p>
      <ul className="space-y-0.5">
        {APPS.map((a) => (
          <li key={a.name}>
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <span className="min-w-0 flex-1 truncate">{a.name}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            ) : (
              <span className="flex min-h-10 items-center gap-2 px-3 text-sm text-muted-foreground">
                <span className="min-w-0 flex-1 truncate">{a.name}</span>
                <span className="rounded-full bg-st-deadline-bg px-2 py-0.5 text-[11px] text-st-deadline-fg">
                  即將推出
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Desktop sidebar (md and up). */
export function Sidebar() {
  const { busy, signOut } = useSignOut();
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col gap-6 overflow-y-auto border-r border-border bg-card px-3 py-5 md:flex">
      <Link to="/" className="px-3">
        <Logo />
      </Link>
      <nav aria-label="HQ 分頁">
        <NavLinks />
      </nav>
      <AppLinks />
      <div className="mt-auto">
        <FaceIdSetup />
      </div>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className=" flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        登出
      </button>
    </aside>
  );
}

/** Phone top bar: logo + the assistant button slot. */
export function MobileTopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
      <Link to="/">
        <Logo className="h-8" />
      </Link>
      {children}
    </header>
  );
}

/** Phone bottom bar: 今日 / 專案 / 客戶 / 財務 / 更多. */
export function MobileTabBar() {
  const [open, setOpen] = useState(false);
  const { busy, signOut } = useSignOut();
  const tabs = MOBILE_TABS.map((to) => NAV.find((n) => n.to === to)).filter((n): n is NavItem =>
    Boolean(n),
  );
  return (
    <>
      <nav
        aria-label="主選單"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {tabs.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                activeOptions={{ exact: Boolean(n.exact) }}
                className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
                activeProps={{ className: "!text-primary font-semibold" }}
              >
                <n.icon className="h-[22px] w-[22px]" />
                {n.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
            >
              <Menu className="h-[22px] w-[22px]" />
              更多
            </button>
          </li>
        </ul>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+16px)]"
        >
          <SheetHeader>
            <SheetTitle>全部分頁</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 px-2">
            <NavLinks onNavigate={() => setOpen(false)} />
            <AppLinks />
            <FaceIdSetup />
            <button
              type="button"
              onClick={signOut}
              disabled={busy}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RobotAvatar } from "@/components/RobotAvatar";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; actions?: string[] };

const STARTERS = [
  "我今天先做什麼？",
  "Tsai 的 SEO 報告做完了",
  "這禮拜有什麼到期？",
  "Bluluma realtor 方案多少？",
];

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

/** HQ 助理: a chat panel that can read and update HQ data through /api/assistant. */
export function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const desktop = useIsDesktop();
  const client = useQueryClient();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("請重新登入");
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (res.status === 401) throw new Error("請重新登入");
      const reply = (await res.json()) as { text: string; actions: string[] };
      setMessages((m) => [
        ...m,
        { role: "assistant", content: reply.text, actions: reply.actions },
      ]);
      if (reply.actions.length) void client.invalidateQueries({ queryKey: ["pcc"] });
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: e instanceof Error ? e.message : "出錯了，請再試一次。" },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const triggers = (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打開 HQ 助理"
        className="fixed bottom-6 right-6 z-30 hidden h-14 items-center gap-2 rounded-full bg-primary pl-2 pr-5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 md:flex"
      >
        <RobotAvatar id="atlas" size={40} className="rounded-full" />
        HQ 助理
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打開 HQ 助理"
        className="fixed right-4 top-[calc(env(safe-area-inset-top)+8px)] z-30 flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground md:hidden"
      >
        <Sparkles className="h-4 w-4" />
        助理
      </button>
    </>
  );

  return (
    <>
      {triggers}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={desktop ? "right" : "bottom"}
          className={cn(
            "flex flex-col gap-0 p-0",
            desktop ? "w-full sm:max-w-md" : "h-[92vh] rounded-t-3xl",
          )}
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <div className="flex items-center gap-3">
              <RobotAvatar id="atlas" size={40} />
              <div>
                <SheetTitle>HQ 助理</SheetTitle>
                <SheetDescription>可以新增任務、改進度、查客戶和價目表</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">試試看：</p>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="block min-h-11 w-full rounded-xl border border-border px-4 text-left text-sm hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.content}
                  {m.actions && m.actions.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                      {m.actions.map((a) => (
                        <li key={a}>✓ {a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                處理中…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
          >
            <label htmlFor="assistant-input" className="sr-only">
              跟 HQ 助理說
            </label>
            <textarea
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="跟助理說…"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="送出"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

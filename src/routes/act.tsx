import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CircleCheck, CircleAlert, Loader2, Undo2 } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

// Public page behind the one-tap buttons in the HQ 晨報 email. No login: the token in the URL is the secret.
// The action runs from JS (not on page load by the server), so mail-scanner link previews never trigger it.
export const Route = createFileRoute("/act")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ t: typeof s["t"] === "string" ? s["t"] : "" }),
  head: () => ({ meta: [{ title: "HQ 晨報 · Bluluma HQ" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ActPage,
});

type Result = { ok: boolean; message: string; undo?: string; already?: boolean };

async function call(action: "act" | "undo", token: string): Promise<Result> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/hq-morning`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ action, token }),
  });
  const body = (await res.json().catch(() => null)) as Result | null;
  return body ?? { ok: false, message: "連不上 HQ，稍後再按一次。" };
}

function ActPage() {
  const { t } = Route.useSearch();
  const [state, setState] = useState<"working" | "done" | "undone" | "error">("working");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!t) { setResult({ ok: false, message: "這個按鈕無效。" }); setState("error"); return; }
    void call("act", t)
      .then((r) => { setResult(r); setState(r.ok ? "done" : "error"); })
      .catch(() => { setResult({ ok: false, message: "連不上 HQ，稍後再按一次。" }); setState("error"); });
  }, [t]);

  const undo = async () => {
    if (!result?.undo) return;
    setBusy(true);
    const r = await call("undo", result.undo).catch(() => ({ ok: false, message: "撤銷失敗，請到 HQ 晨報改。" }));
    setBusy(false);
    setResult(r);
    setState(r.ok ? "undone" : "error");
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-2 text-center">
      <img src="/images/bluluma-logo.svg" alt="Bluluma Design" className="mb-8 h-6 w-auto" />
      {state === "working" ? (
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-label="處理中" />
      ) : state === "error" ? (
        <CircleAlert className="h-12 w-12 text-amber-600" aria-hidden />
      ) : (
        <CircleCheck className={state === "undone" ? "h-12 w-12 text-muted-foreground" : "h-12 w-12 text-st-almost-bar"} aria-hidden />
      )}
      <p className="mt-5 text-lg font-semibold leading-snug">
        {state === "working" ? "記錄中…" : result?.message}
      </p>
      {state === "done" && result?.undo && (
        <Button variant="outline" className="mt-6 h-11 px-5" disabled={busy} onClick={() => void undo()}>
          <Undo2 className="h-4 w-4" />
          {busy ? "撤銷中…" : "按錯了，撤銷"}
        </Button>
      )}
      {state !== "working" && (
        <p className="mt-8 text-sm text-muted-foreground">可以關掉這頁，回到 email 繼續按。</p>
      )}
      <a href="/morning" className="mt-3 text-sm text-primary underline-offset-2 hover:underline">打開 HQ 晨報</a>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink } from "lucide-react";
import { requireSignedIn } from "@/lib/auth";
import { TOOLS } from "@/lib/tools";
import { SOPS, type Sop } from "@/lib/sops";

export const Route = createFileRoute("/tools")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "工具 · Bluluma HQ" },
      { name: "description", content: "所有後台工具的快速入口。" },
      { property: "og:title", content: "工具 · Bluluma HQ" },
    ],
  }),
  component: ToolsPage,
});

function host(url: string) {
  try { return new URL(url).host; } catch { return url; }
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "已複製" : label}
    </button>
  );
}

function SopCard({ sop }: { sop: Sop }) {
  return (
    <details className="panel group/sop p-0 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{sop.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{sop.desc}</p>
        </div>
        <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-open/sop:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-5 border-t px-5 pb-5 pt-4">
        <p className="text-xs text-muted-foreground">在哪裡做：{sop.where}</p>
        <ol className="space-y-4">
          {sop.steps.map((s) => (
            <li key={s.title} className="space-y-2">
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.detail}</p>
              {s.copy && (
                <div className="flex flex-col gap-2 rounded-md bg-muted/60 p-3 sm:flex-row sm:items-start">
                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">{s.copy}</p>
                  <CopyButton text={s.copy} />
                </div>
              )}
            </li>
          ))}
        </ol>
        {sop.troubleshooting && sop.troubleshooting.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">卡關時</p>
            <ul className="space-y-2">
              {sop.troubleshooting.map((t) => (
                <li key={t.problem} className="text-sm">
                  <span className="font-medium">{t.problem}</span>
                  <span className="text-muted-foreground"> → {t.fix}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

function ToolsPage() {
  const groups = Array.from(new Set(TOOLS.map((t) => t.group)));
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">工具</h1>
        <p className="mt-1 text-sm text-muted-foreground">後台按一下在新分頁打開；操作手冊點開看步驟、按 Copy 複製指令。</p>
      </div>
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">操作手冊</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {SOPS.map((s) => (
            <SopCard key={s.id} sop={s} />
          ))}
        </div>
      </section>
      {groups.map((g) => (
        <section key={g} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{g}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.filter((t) => t.group === g).map((t) => (
              <a
                key={t.url}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="panel group flex min-h-28 flex-col justify-between gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
                </div>
                <p className="truncate text-xs text-muted-foreground">{host(t.url)}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

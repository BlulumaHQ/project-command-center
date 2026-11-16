import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { requireSignedIn } from "@/lib/auth";
import { TOOLS } from "@/lib/tools";

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

function ToolsPage() {
  const groups = Array.from(new Set(TOOLS.map((t) => t.group)));
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">工具</h1>
        <p className="mt-1 text-sm text-muted-foreground">按一下在新分頁打開。</p>
      </div>
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

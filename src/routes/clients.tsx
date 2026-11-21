import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ExternalLink, Mail, Phone, Search } from "lucide-react";
import { requireSignedIn } from "@/lib/auth";
import { daysUntil, useClients, type ClientRow } from "@/data/hq2";
import { vancouverDate } from "@/data/tasks";
import { DataError, DataSkeleton } from "@/components/DataState";
import { NotConnected } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clients")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "客戶 · Bluluma HQ" },
      { name: "description", content: "每個客戶一頁：聯絡、服務、帳號在哪、續約到期。" },
      { property: "og:title", content: "客戶 · Bluluma HQ" },
    ],
  }),
  component: ClientsPage,
});

const BRAND_FILTERS = ["全部", "Bluluma", "Sonykun", "SwiftLift", "SwiftSite"];

function nextRenewal(c: ClientRow, today: string) {
  return (c.renewals ?? [])
    .filter((r) => r.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

function ClientsPage() {
  const clients = useClients();
  const [brand, setBrand] = useState("全部");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const today = vancouverDate();

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (clients.data ?? [])
      .filter(
        (c) => brand === "全部" || (c.brand ?? "").toLowerCase().includes(brand.toLowerCase()),
      )
      .filter((c) => !term || JSON.stringify(c).toLowerCase().includes(term));
  }, [clients.data, brand, q]);

  if (clients.error)
    return <DataError message={clients.error.message} retry={() => void clients.refetch()} />;
  if (clients.isPending) return <DataSkeleton />;

  const all = clients.data ?? [];
  const selected = list.find((c) => c.id === selectedId) ?? null;
  const soon = all.filter((c) => {
    const r = nextRenewal(c, today);
    return r && daysUntil(r.date, today) <= 30;
  }).length;

  if (all.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">客戶</h1>
        <section className="panel space-y-2 p-6">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">還沒匯入客戶</h2>
            <NotConnected label="下一步" />
          </div>
          <p className="text-sm text-muted-foreground">
            下一步把「Bluluma 客戶總表」匯進
            HQ。匯入後每個客戶會有自己一頁：聯絡方式、買了什麼、帳號在哪、續約到期、網站健康。
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className={cn(selected && "max-lg:hidden")}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">客戶</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {all.length} 個客戶 · {soon} 個 30 天內到期
        </p>
      </header>

      <div className={cn("flex flex-wrap items-center gap-2", selected && "max-lg:hidden")}>
        {BRAND_FILTERS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBrand(b)}
            aria-pressed={brand === b}
            className={cn(
              "h-9 rounded-full border px-3.5 text-[13px] font-semibold",
              brand === b
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            {b}
          </button>
        ))}
        <label className="ml-auto flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 text-muted-foreground sm:w-64">
          <Search className="h-4 w-4" />
          <span className="sr-only">搜尋客戶</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋客戶…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
          />
        </label>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ul className={cn("panel space-y-0.5 p-2", selected && "max-lg:hidden")}>
          {list.map((c) => {
            const r = nextRenewal(c, today);
            const hot = r && daysUntil(r.date, today) <= 30;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors",
                    c.id === selected?.id ? "bg-primary/10" : "hover:bg-accent",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        hot ? "bg-st-deadline-bar" : "bg-st-almost-bar",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                      {c.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.brand}</span>
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {[c.contact_name, (c.services ?? []).join(" / ")].filter(Boolean).join(" · ")}
                  </span>
                  {r && (
                    <span
                      className={cn(
                        "text-xs",
                        hot ? "text-st-deadline-fg" : "text-muted-foreground",
                      )}
                    >
                      下次到期：{r.title} · {r.date}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="p-3 text-sm text-muted-foreground">沒有符合的客戶</li>
          )}
        </ul>

        {selected ? (
          <ClientDetail client={selected} today={today} onBack={() => setSelectedId(null)} />
        ) : (
          <div className="panel hidden p-8 text-center text-sm text-muted-foreground lg:block">
            選一個客戶看詳細資料
          </div>
        )}
      </div>
    </div>
  );
}

function ClientDetail({
  client: c,
  today,
  onBack,
}: {
  client: ClientRow;
  today: string;
  onBack: () => void;
}) {
  const renewals = [...(c.renewals ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 items-center gap-1 text-sm text-muted-foreground lg:hidden"
      >
        <ChevronLeft className="h-4 w-4" />
        所有客戶
      </button>
      <section className="panel space-y-4 p-5">
        <div>
          <p className="text-[13px] text-muted-foreground">
            {[c.brand, c.since && `${c.since} 起`].filter(Boolean).join(" · ")}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{c.name}</h2>
          {c.contact_name && (
            <p className="mt-1 text-sm text-muted-foreground">聯絡人：{c.contact_name}</p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {c.phone && (
            <a
              href={`tel:${c.phone}`}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 text-sm font-semibold text-primary"
            >
              <Phone className="h-4 w-4" />
              打電話
            </a>
          )}
          {c.email && (
            <a
              href={`mailto:${c.email}`}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 text-sm font-semibold text-primary"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
          {c.website && (
            <a
              href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 text-sm font-semibold text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              網站
            </a>
          )}
        </div>
        {(c.services ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(c.services ?? []).map((s) => (
              <span
                key={s}
                className="rounded-full bg-st-progress-bg px-3 py-1 text-xs font-semibold text-st-progress-fg"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <h3 className="font-semibold">帳號在哪裡</h3>
          {(c.accounts ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">還沒填</p>
          ) : (
            <ul className="mt-2 divide-y divide-border text-sm">
              {(c.accounts ?? []).map((a) => (
                <li key={a.label} className="flex min-h-10 items-center gap-3 py-2">
                  <span className="w-28 shrink-0 text-muted-foreground">{a.label}</span>
                  <span className="min-w-0 flex-1 font-medium">{a.value}</span>
                  {a.owner && (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">
                      {a.owner}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted-foreground">不存密碼，只記帳號在誰名下</p>
        </section>
        <section className="panel p-5">
          <h3 className="font-semibold">續約 & 到期</h3>
          {renewals.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">還沒填</p>
          ) : (
            <ul className="mt-2 divide-y divide-border text-sm">
              {renewals.map((r) => {
                const d = daysUntil(r.date, today);
                return (
                  <li key={r.date + r.title} className="flex min-h-11 items-center gap-3 py-2">
                    <span className="w-24 shrink-0 tabular-nums text-muted-foreground">
                      {r.date}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{r.title}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                        r.auto
                          ? "bg-st-almost-bg text-st-almost-fg"
                          : d <= 30
                            ? "bg-st-deadline-bg text-st-deadline-fg"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {r.auto ? "自動續約" : d < 0 ? "已過期" : `${d} 天後`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">網站健康</h3>
          <NotConnected />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          接上 Cloudflare 之後顯示：網站有沒有在線、表單最後一筆是什麼時候。
        </p>
      </section>

      {c.notes && (
        <section className="panel p-5">
          <h3 className="font-semibold">筆記</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{c.notes}</p>
        </section>
      )}
    </div>
  );
}

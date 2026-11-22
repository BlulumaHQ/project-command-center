import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { requireSignedIn } from "@/lib/auth";
import { useClients, usePrices, type PriceRow } from "@/data/hq2";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { DataError, DataSkeleton } from "@/components/DataState";
import { MASK, RevealButton } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "價目表 · 報價 · Bluluma HQ" },
      { name: "description", content: "各品牌內部價目表，勾選項目直接出報價。" },
      { property: "og:title", content: "價目表 · Bluluma HQ" },
    ],
  }),
  component: PricingPage,
});

const TABS = [
  {
    id: "bluluma",
    label: "Bluluma Design",
    cur: "CAD",
    note: "只做 Healthcare、Realtor、Pre-sale/Developer，其他 Get a Quote。不給 partner。",
    partner: false,
  },
  {
    id: "sonykun",
    label: "Sonykun Design",
    cur: "CAD",
    note: "零售價跟 sonykundesign.com/pricing 一致。Partner 價 = 7 折，hosting 與月費固定。",
    partner: true,
  },
  {
    id: "swiftlift",
    label: "SwiftLift",
    cur: "USD",
    note: "零售價跟 swiftlift.app 一致。Partner 價 = 7 折，Care Plan 等固定。",
    partner: true,
  },
  {
    id: "swiftsite",
    label: "SwiftSite",
    cur: "CAD",
    note: "價格跟 swiftsite.ca 一致。不給 partner。Hosting & care 必須綁。",
    partner: false,
  },
  {
    id: "design",
    label: "設計服務（共用）",
    cur: "CAD",
    note: "Standard 價用在 Sonykun，Premium 價用在 Bluluma。製作與印刷另計。Partner 價 = Standard 7 折。",
    partner: true,
  },
] as const;
type TabId = (typeof TABS)[number]["id"];

function CopyLink({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-primary hover:bg-accent"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "已複製" : "付款連結"}
    </button>
  );
}

function PricingPage() {
  const prices = usePrices();
  const clients = useClients();
  const [mode, setMode] = useState<"list" | "quote">("list");
  const [tab, setTab] = useState<TabId>("bluluma");
  const [shown, setShown] = useState(false);
  const [partner, setPartner] = useState(false);
  const [q, setQ] = useState("");
  const meta = TABS.find((t) => t.id === tab) ?? TABS[0];
  const showPartner = meta.partner && partner;

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const rows = (prices.data ?? [])
      .filter((p) => p.brand === tab)
      .filter((p) => showPartner || p.note !== "Partner 專屬")
      .filter(
        (p) =>
          !term || `${p.service} ${p.category} ${p.included ?? ""}`.toLowerCase().includes(term),
      );
    const out: { cat: string; items: PriceRow[] }[] = [];
    for (const r of rows) {
      const g = out.find((x) => x.cat === r.category);
      if (g) g.items.push(r);
      else out.push({ cat: r.category, items: [r] });
    }
    return out;
  }, [prices.data, tab, q, showPartner]);

  if (prices.error)
    return <DataError message={prices.error.message} retry={() => void prices.refetch()} />;
  if (prices.isPending) return <DataSkeleton />;

  const show = (v: string | null) => (v ? (shown ? v : MASK) : "—");
  const isDesign = tab === "design";

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {mode === "list" ? "價目表" : "報價"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "list"
              ? "內部用 · 價錢預設隱藏"
              : "選公司 → 選客戶 → 勾項目 → 在 Gmail 開成草稿"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="模式"
            className="flex gap-1 rounded-xl border border-border bg-card p-1"
          >
            {(
              [
                ["list", "價目表"],
                ["quote", "報價"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
                className={cn(
                  "h-9 rounded-lg px-4 text-sm font-semibold transition",
                  mode === id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "list" && (
            <RevealButton
              shown={shown}
              onToggle={() => setShown((s) => !s)}
              showLabel="顯示價錢"
              hideLabel="隱藏價錢"
            />
          )}
        </div>
      </header>

      <div
        role="tablist"
        aria-label="品牌"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab}
            onClick={() => setTab(t.id)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition",
              t.id === tab
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-primary/10 px-4 py-3">
        <p className="text-sm font-semibold text-primary">
          {meta.label} · {meta.cur}
        </p>
        <p className="min-w-0 flex-1 basis-64 text-sm">{meta.note}</p>
        {meta.partner && mode === "list" && (
          <button
            type="button"
            onClick={() => setPartner((p) => !p)}
            aria-pressed={showPartner}
            className={cn(
              "h-9 rounded-full border border-purple-700 px-3 text-[13px] font-semibold",
              showPartner ? "bg-purple-700 text-white" : "bg-card text-purple-700",
            )}
          >
            Partner 價：{showPartner ? "開" : "關"}
          </button>
        )}
      </div>

      {mode === "quote" ? (
        <QuoteBuilder
          key={tab}
          brand={meta}
          prices={prices.data ?? []}
          clients={clients.data ?? []}
        />
      ) : (
        <>
          <label className="flex h-11 max-w-md items-center gap-2 rounded-xl border border-border bg-card px-3 text-muted-foreground">
            <Search className="h-4 w-4" />
            <span className="sr-only">搜尋項目</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜尋項目，例如 logo、SEO、名片…"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
            />
          </label>

          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">找不到符合的項目。</p>
          )}
          {groups.map((g) => (
            <section key={g.cat} className="panel p-4 sm:p-5">
              <h2 className="mb-2 font-semibold">{g.cat}</h2>
              <ul className="divide-y divide-border">
                {g.items.map((p) => (
                  <li
                    key={p.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_120px_120px_auto]"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold">{p.service}</p>
                      {p.note && <p className="mt-0.5 text-xs text-st-deadline-fg">{p.note}</p>}
                    </div>
                    <p className="col-span-2 row-start-2 text-[13px] leading-relaxed text-muted-foreground md:col-span-1 md:row-start-auto">
                      {p.included}
                    </p>
                    <div className="text-right md:text-left">
                      <p className="text-base font-bold tabular-nums">
                        {show(p.price)}
                        {isDesign && (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            Std
                          </span>
                        )}
                      </p>
                      {isDesign && (
                        <p className="text-sm font-bold tabular-nums text-primary">
                          {show(p.price_premium)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            Premium
                          </span>
                        </p>
                      )}
                      {showPartner && (
                        <p className="text-[13px] font-semibold tabular-nums text-purple-700">
                          Partner {show(p.partner_price)}
                        </p>
                      )}
                    </div>
                    <p className="hidden text-[13px] text-muted-foreground md:block">{p.billing}</p>
                    <div className="hidden md:block">
                      {p.stripe_link ? <CopyLink url={p.stripe_link} /> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
      <p className="text-xs text-muted-foreground">
        資料來源：Bluluma Group – Master Price List 2026（存在 HQ 資料庫，只有你登入看得到）。
      </p>
    </div>
  );
}

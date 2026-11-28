import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { requireSignedIn } from "@/lib/auth";
import { MASK, NotConnected, RevealButton } from "@/components/ui-bits";
import { AiCostSection } from "@/components/AiCostSection";
import { delta, useBizWeekly, type BizRow } from "@/data/biz-weekly";

export const Route = createFileRoute("/money")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "財務 · Bluluma HQ" },
      { name: "description", content: "每月固定收入、應收帳款、各品牌損益、GST 門檻。" },
      { property: "og:title", content: "財務 · Bluluma HQ" },
    ],
  }),
  component: MoneyPage,
});

/** Every amount comes from pcc_biz_weekly; missing = null and shows "—" (never a made-up number). */
type Amount = number | null;
type Kpi = {
  label: string;
  value: Amount;
  foot: string;
  source: string;
  bar?: number;
  diff?: string | null;
};
function money(v: Amount | undefined, shown: boolean, currency = "CAD") {
  if (!shown) return MASK;
  return v == null
    ? "—"
    : new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(v);
}
const num = (v: number | null | undefined) => (v == null ? "—" : String(v));
const md = (iso: string) => `${+iso.slice(5, 7)}/${+iso.slice(8, 10)}`;

function Delta({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const up = text.startsWith("+") || text === "新";
  const down = text.startsWith("-");
  return (
    <span
      className={
        up
          ? "text-xs font-semibold text-st-almost-fg"
          : down
            ? "text-xs font-semibold text-st-deadline-fg"
            : "text-xs text-muted-foreground"
      }
    >
      {text} vs 上週
    </span>
  );
}

function MoneyPage() {
  const [shown, setShown] = useState(false);
  const biz = useBizWeekly();
  const v = biz.data;
  const t: BizRow | null = v?.total ?? null;
  const p: BizRow | null = v?.prevTotal ?? null;
  const KPIS: Kpi[] = [
    {
      label: "MRR 每月固定收入",
      value: t?.mrr ?? null,
      foot: "hosting · care · SEO 月費（年費 ÷ 12）",
      source: "Stripe",
      diff: delta(t?.mrr, p?.mrr),
    },
    {
      label: "本週收入",
      value: t?.revenue ?? null,
      foot: "已收款 · 4 個品牌合計",
      source: "Stripe",
      diff: delta(t?.revenue, p?.revenue),
    },
    {
      label: "未付發票",
      value: t?.unpaid ?? null,
      foot: `還沒付的發票${t?.unpaid_count ? ` · ${t.unpaid_count} 張` : ""}`,
      source: "Stripe",
    },
    {
      label: "GST 門檻累計",
      value: null,
      foot: "過去 4 季 / $30,000 · 到了要註冊",
      source: "Stripe + Wave",
      bar: 0,
    },
  ];
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">財務</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            4 個品牌 · 金額預設隱藏
            {v?.week && ` · 數字是 ${md(v.week)} 那週（每週一更新）`}
          </p>
        </div>
        <RevealButton
          shown={shown}
          onToggle={() => setShown((s) => !s)}
          showLabel="顯示金額"
          hideLabel="隱藏金額"
        />
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="panel flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-muted-foreground">{k.label}</p>
              {k.value === null && <NotConnected />}
            </div>
            <p className="text-3xl font-bold tabular-nums">{money(k.value, shown)}</p>
            {shown && <Delta text={k.diff} />}
            {k.bar !== undefined && (
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${k.bar}%` }} />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {k.foot} · 來源：{k.source}
            </p>
          </div>
        ))}
      </div>

      <AiCostSection shown={shown} />

      <WeeklySection shown={shown} loading={biz.isPending} error={biz.error?.message} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">應收帳款（誰欠錢）</h2>
            {!t && <NotConnected />}
          </div>
          <ul className="mt-3 divide-y divide-border text-sm">
            {(v?.brands ?? []).map((b) => (
              <li key={b.brand} className="flex min-h-10 items-center gap-3 py-2">
                <span className="min-w-0 flex-1 font-medium">{b.brand}</span>
                <span className="text-xs text-muted-foreground">
                  {b.row?.unpaid_count ? `${b.row.unpaid_count} 張` : ""}
                </span>
                <span className="w-24 text-right tabular-nums">
                  {money(b.row?.unpaid, shown, b.row?.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Pipeline（本週）</h2>
            {!t && <NotConnected />}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { k: "新 Leads", v: num(t?.leads) },
              { k: "成交", v: num(t?.sales) },
              { k: "轉換率", v: v?.conversion == null ? "—" : `${v.conversion}%` },
            ].map((x) => (
              <div key={x.k} className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground">{x.k}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{x.v}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">數量不算金額，不用按顯示也看得到</p>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">
        財務部每週一清晨從 4 個 Stripe 帳號和 Leads 表整理數字，晨報會附上週 vs 前一週。還沒接：GST
        門檻、廣告花費。
      </p>
    </div>
  );
}

function WeeklySection({
  shown,
  loading,
  error,
}: {
  shown: boolean;
  loading: boolean;
  error: string | undefined;
}) {
  const biz = useBizWeekly();
  const v = biz.data;
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">每週生意數字 · 各品牌</h2>
        {!v?.week && !loading && <NotConnected label="週一第一次更新" />}
      </div>
      {error && <p className="mt-2 text-sm text-st-deadline-fg">{error}</p>}
      {v?.total?.note && (
        <p className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
          {v.total.note}
        </p>
      )}

      {/* phone: one card per brand */}
      <ul className="mt-3 space-y-2 md:hidden">
        {(v?.brands ?? []).map((b) => (
          <li key={b.brand} className="rounded-xl bg-muted p-3">
            <p className="font-semibold">{b.brand}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm tabular-nums">
              <span className="text-muted-foreground">MRR</span>
              <span className="text-right">{money(b.row?.mrr, shown, b.row?.currency)}</span>
              <span className="text-muted-foreground">本週收入</span>
              <span className="text-right">{money(b.row?.revenue, shown, b.row?.currency)}</span>
              <span className="text-muted-foreground">成交 / Leads</span>
              <span className="text-right">
                {num(b.row?.sales)} / {num(b.row?.leads)}
              </span>
            </div>
            {shown && (
              <div className="mt-1 text-right">
                <Delta text={delta(b.row?.revenue, b.prev?.revenue)} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* desktop: table */}
      <div className="mt-3 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[560px] text-sm tabular-nums">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-2 text-left font-semibold">品牌</th>
              <th className="pb-2 text-right font-semibold">MRR</th>
              <th className="pb-2 text-right font-semibold">本週收入</th>
              <th className="pb-2 text-right font-semibold">vs 上週</th>
              <th className="pb-2 text-right font-semibold">成交</th>
              <th className="pb-2 text-right font-semibold">Leads</th>
            </tr>
          </thead>
          <tbody>
            {(v?.brands ?? []).map((b) => (
              <tr key={b.brand} className="border-t border-border">
                <td className="py-3 font-medium">
                  {b.brand}
                  {b.row?.currency && b.row.currency !== "CAD" && (
                    <span className="ml-1 text-xs text-muted-foreground">{b.row.currency}</span>
                  )}
                </td>
                <td className="py-3 text-right">{money(b.row?.mrr, shown, b.row?.currency)}</td>
                <td className="py-3 text-right">{money(b.row?.revenue, shown, b.row?.currency)}</td>
                <td className="py-3 text-right">
                  {shown ? (delta(b.row?.revenue, b.prev?.revenue) ?? "—") : MASK}
                </td>
                <td className="py-3 text-right">{num(b.row?.sales)}</td>
                <td className="py-3 text-right">{num(b.row?.leads)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-5 text-sm font-semibold">30 天內續約</h3>
      {(v?.renewals ?? []).length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">30 天內沒有續約</p>
      ) : (
        <ul className="mt-1 divide-y divide-border text-sm">
          {(v?.renewals ?? []).map((r) => (
            <li
              key={`${r.brand}-${r.client}-${r.date}`}
              className="flex min-h-10 items-center gap-3 py-2"
            >
              <span className="w-12 shrink-0 tabular-nums text-muted-foreground">{md(r.date)}</span>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{r.client}</span>
                <span className="text-muted-foreground"> · {r.item}</span>
              </span>
              <span className="shrink-0 tabular-nums">{money(r.amount ?? null, shown)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { requireSignedIn } from "@/lib/auth";
import { MASK, NotConnected, RevealButton } from "@/components/ui-bits";

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

const BRANDS = ["Bluluma Design", "Sonykun Design", "SwiftLift", "SwiftSite"];

/** Until Stripe / Wave are connected every amount is null and shows "—" (never a made-up number). */
type Amount = number | null;
const KPIS: { label: string; value: Amount; foot: string; source: string; bar?: number }[] = [
  { label: "MRR 每月固定收入", value: null, foot: "hosting · care · SEO 月費", source: "Stripe" },
  { label: "本月收入", value: null, foot: "已收款 · 4 個品牌合計", source: "Stripe + Wave" },
  { label: "應收帳款", value: null, foot: "還沒付的發票", source: "Wave" },
  {
    label: "GST 門檻累計",
    value: null,
    foot: "過去 4 季 / $30,000 · 到了要註冊",
    source: "Stripe + Wave",
    bar: 0,
  },
];

function money(v: Amount, shown: boolean) {
  if (!shown) return MASK;
  return v === null
    ? "—"
    : new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      }).format(v);
}

function MoneyPage() {
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">財務</h1>
          <p className="mt-1 text-sm text-muted-foreground">4 個品牌 · 金額預設隱藏</p>
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

      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">各品牌本月損益</h2>
          <NotConnected />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm tabular-nums">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="pb-2 text-left font-semibold">品牌</th>
                <th className="pb-2 text-right font-semibold">收入</th>
                <th className="pb-2 text-right font-semibold">工具支出</th>
                <th className="pb-2 text-right font-semibold">廣告</th>
                <th className="pb-2 text-right font-semibold">淨利</th>
              </tr>
            </thead>
            <tbody>
              {BRANDS.map((b) => (
                <tr key={b} className="border-t border-border">
                  <td className="py-3 font-medium">{b}</td>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="py-3 text-right text-muted-foreground">
                      {money(null, shown)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">應收帳款（誰欠錢）</h2>
            <NotConnected />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            接上 Wave 之後，這裡會列出每張沒付的發票、金額和逾期天數，可以一鍵寄提醒。
          </p>
        </section>
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Pipeline</h2>
            <NotConnected />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Leads", "已報價", "成交（本月）"].map((s) => (
              <div key={s} className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground">{s}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{money(null, shown)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">
        資料接入順序：Stripe（4 個帳號）→ Wave → 廣告花費。每次進來金額都是隱藏的。
      </p>
    </div>
  );
}

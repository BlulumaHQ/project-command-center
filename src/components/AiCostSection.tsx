import { useState } from "react";
import { MASK } from "@/components/ui-bits";
import {
  FEATURE_LABEL,
  PROVIDER_LABEL,
  summarize,
  useAiCost,
  type LimitRow,
} from "@/data/ai-cost-store";

function fmt(usd: number, rate: number, shown: boolean) {
  if (!shown) return MASK;
  const cad = usd * rate;
  const digits = cad < 10 ? 2 : 0;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cad);
}
function fmtUsd(usd: number, shown: boolean) {
  if (!shown) return MASK;
  return `US$${usd < 1 ? usd.toFixed(3) : usd.toFixed(2)}`;
}
const when = (iso: string) =>
  new Intl.DateTimeFormat("zh-TW", {
    timeZone: "America/Vancouver",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function AiCostSection({ shown }: { shown: boolean }) {
  const { data, isLoading, error, setLimit } = useAiCost();
  const [tab, setTab] = useState<"client" | "feature" | "month" | "recent">("client");

  if (isLoading)
    return <section className="panel p-5 text-sm text-muted-foreground">AI 成本載入中…</section>;
  if (error || !data)
    return (
      <section className="panel p-5 text-sm text-destructive">
        AI 成本讀取失敗：{error instanceof Error ? error.message : "未知錯誤"}
      </section>
    );

  const s = summarize(data.rows, data.clients);
  const money = (usd: number) => fmt(usd, data.rate, shown);
  const spentOf = (f: string) => s.byFeatureMonth.find((g) => g.key === f)?.cost ?? 0;

  const tabs = [
    ["client", "每個客戶"],
    ["feature", "每個功能"],
    ["month", "每月"],
    ["recent", "最近紀錄"],
  ] as const;

  return (
    <section className="panel space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">AI 成本</h2>
          <p className="text-xs text-muted-foreground">
            每次 API 呼叫自動記帳 · 以 CAD 顯示（1 USD = {data.rate} CAD）
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["本月 AI 花費", money(s.monthTotal)],
          ["本月呼叫次數", String(s.monthCalls)],
          ["本月畫圖張數", String(s.monthImages)],
          ["平均每張圖", s.avgPerImage === null ? "—" : money(s.avgPerImage)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 text-sm">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 font-medium ${
              tab === k ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {data.rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          還沒有任何 AI 花費紀錄。董事會、HQ 助理、畫圖用過之後就會出現在這裡。
        </p>
      )}

      {tab === "client" && s.byClient.length > 0 && (
        <ul className="divide-y divide-border text-sm">
          {s.byClient.map((g) => (
            <li key={g.key} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{g.key}</p>
                <p className="text-xs text-muted-foreground">
                  {g.calls} 次{g.images ? ` · ${g.images} 張圖` : ""} · 本月 {money(g.month)}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">{money(g.cost)}</p>
            </li>
          ))}
        </ul>
      )}

      {tab === "feature" && (
        <ul className="divide-y divide-border text-sm">
          {data.limits.map((l) => (
            <LimitRowView
              key={l.feature}
              limit={l}
              spent={spentOf(l.feature)}
              money={money}
              shown={shown}
              onSave={(v) => setLimit.mutate({ feature: l.feature, monthly_usd: v })}
            />
          ))}
          {s.byProviderMonth.length > 0 && (
            <li className="pt-3 text-xs text-muted-foreground">
              本月各平台：
              {s.byProviderMonth
                .map((g) => `${PROVIDER_LABEL[g.key] ?? g.key} ${shown ? money(g.cost) : MASK}`)
                .join(" · ")}
            </li>
          )}
        </ul>
      )}

      {tab === "month" && s.byMonth.length > 0 && (
        <ul className="divide-y divide-border text-sm">
          {s.byMonth.map((g) => (
            <li key={g.key} className="flex items-center justify-between py-3">
              <span className="font-medium">{g.key}</span>
              <span className="text-xs text-muted-foreground">
                {g.calls} 次{g.images ? ` · ${g.images} 張圖` : ""}
              </span>
              <span className="font-semibold tabular-nums">{money(g.cost)}</span>
            </li>
          ))}
        </ul>
      )}

      {tab === "recent" && s.recent.length > 0 && (
        <ul className="divide-y divide-border text-sm">
          {s.recent.map((r) => (
            <li key={r.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate font-medium">{r.summary ?? r.model}</p>
                <p className="shrink-0 tabular-nums">{fmtUsd(r.cost_usd, shown)}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {when(r.created_at)} · {FEATURE_LABEL[r.feature] ?? r.feature} ·{" "}
                {PROVIDER_LABEL[r.provider] ?? r.provider} {r.model}
                {r.client_id ? ` · ${data.clients.get(r.client_id) ?? ""}` : ""}
                {r.status !== "ok" ? ` · ${r.status === "blocked" ? "預算用完被擋" : "出錯"}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LimitRowView({
  limit,
  spent,
  money,
  shown,
  onSave,
}: {
  limit: LimitRow;
  spent: number;
  money: (usd: number) => string;
  shown: boolean;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(limit.monthly_usd));
  const pct = Math.min(100, limit.monthly_usd ? (spent / limit.monthly_usd) * 100 : 0);
  return (
    <li className="space-y-2 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{FEATURE_LABEL[limit.feature] ?? limit.feature}</p>
        {editing ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = Number(value);
              if (v > 0) onSave(v);
              setEditing(false);
            }}
          >
            <span className="text-xs text-muted-foreground">US$</span>
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-1 text-primary-foreground"
            >
              存
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground underline"
          >
            {shown ? `${money(spent)} / 上限 ${money(limit.monthly_usd)}` : "改上限"}
          </button>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${pct >= 90 ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

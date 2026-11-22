import { useMemo, useState } from "react";
import { Check, Copy, Mail, Minus, Plus, RotateCcw } from "lucide-react";
import type { ClientRow, PriceRow } from "@/data/hq2";
import { cn } from "@/lib/utils";

export interface QuoteBrand {
  id: string;
  label: string;
  cur: string;
}

/** "$1,688" → 1688. Non-numeric prices ("報價") → null. */
export function parsePrice(v: string | null): number | null {
  if (!v) return null;
  const m = v.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

/** Monthly if the billing text says 每月 / month. */
export function isMonthly(billing: string | null): boolean {
  return /每月|month|\/mo/i.test(billing ?? "");
}

/** Per-unit items (每頁 / 每支 / 每小時 …) get a quantity stepper. */
function isPerUnit(billing: string | null): boolean {
  return /^每(頁|支|小時|個|名字|SKU)/.test(billing ?? "");
}

const money = (n: number, cur: string) =>
  `${cur === "USD" ? "US$" : "$"}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

interface Line {
  qty: number;
  custom?: number | undefined;
}

export function QuoteBuilder({
  brand,
  prices,
  clients,
}: {
  brand: QuoteBrand;
  prices: PriceRow[];
  clients: ClientRow[];
}) {
  const [lines, setLines] = useState<Record<string, Line>>({});
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [premium, setPremium] = useState(brand.id === "design");
  const [copied, setCopied] = useState(false);

  const rows = useMemo(
    () => prices.filter((p) => p.brand === brand.id && p.note !== "Partner 專屬"),
    [prices, brand.id],
  );

  const unitPrice = (p: PriceRow, l?: Line) => {
    if (l?.custom != null) return l.custom;
    const raw = brand.id === "design" && premium ? (p.price_premium ?? p.price) : p.price;
    return parsePrice(raw);
  };

  const picked = rows.filter((p) => lines[p.id]);
  let oneTime = 0;
  let monthly = 0;
  for (const p of picked) {
    const l = lines[p.id] ?? { qty: 1 };
    const amt = (unitPrice(p, l) ?? 0) * l.qty;
    if (isMonthly(p.billing)) monthly += amt;
    else oneTime += amt;
  }

  const toggle = (p: PriceRow) =>
    setLines((s) => {
      const n = { ...s };
      if (n[p.id]) delete n[p.id];
      else n[p.id] = { qty: 1 };
      return n;
    });
  const setQty = (id: string, d: number) =>
    setLines((s) => (s[id] ? { ...s, [id]: { ...s[id], qty: Math.max(1, s[id].qty + d) } } : s));
  const setCustom = (id: string, v: string) =>
    setLines((s) => ({
      ...s,
      [id]: { ...(s[id] ?? { qty: 1 }), custom: v ? Number(v) : undefined },
    }));

  const pickClient = (id: string) => {
    setClientId(id);
    const c = clients.find((x) => x.id === id);
    if (c) {
      setName(c.contact_name || c.name);
      setEmail(c.email ?? "");
    }
  };
  const company = clients.find((c) => c.id === clientId)?.name ?? "";
  const first = (name || "").trim().split(/\s+/)[0];

  const itemLines = picked.map((p) => {
    const l = lines[p.id] ?? { qty: 1 };
    const u = unitPrice(p, l) ?? 0;
    const qty = l.qty > 1 ? ` × ${l.qty}` : "";
    const per = isMonthly(p.billing) ? (lang === "en" ? "/month" : "／月") : "";
    return `• ${p.service}${qty}: ${money(u * l.qty, brand.cur)}${per}`;
  });

  const subject =
    lang === "en"
      ? `Your quote from ${brand.label}${company ? ` — ${company}` : ""}`
      : `${brand.label} 報價${company ? `｜${company}` : ""}`;
  const body =
    lang === "en"
      ? [
          `Hi ${first || "there"},`,
          "",
          "Here is your quote:",
          "",
          ...itemLines,
          "",
          oneTime ? `One-time total: ${money(oneTime, brand.cur)}` : "",
          monthly ? `Monthly: ${money(monthly, brand.cur)}` : "",
          "",
          "Reply to this email to confirm and we'll get started.",
          "",
          "Sony Lin",
          brand.label,
        ]
      : [
          `${first || ""} 您好，`,
          "",
          "以下是這次的報價：",
          "",
          ...itemLines,
          "",
          oneTime ? `一次性總計：${money(oneTime, brand.cur)}` : "",
          monthly ? `每月：${money(monthly, brand.cur)}` : "",
          "",
          "確認的話直接回覆這封信，我們就開始進行。",
          "",
          "Sony Lin",
          brand.label,
        ];
  const text = body.filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n");

  const gmailUrl =
    "https://mail.google.com/mail/?authuser=sony@bluluma.com&view=cm&fs=1" +
    `&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  const reset = () => {
    setLines({});
    setClientId("");
    setName("");
    setEmail("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-5">
        <section className="panel space-y-3 p-4 sm:p-5">
          <h2 className="font-semibold">1 · 客戶</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              從客戶列表選
              <select
                value={clientId}
                onChange={(e) => pickClient(e.target.value)}
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground"
              >
                <option value="">新客戶（自己填）</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              聯絡人
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如 Mei Tan"
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@email.com"
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground"
              />
            </label>
          </div>
        </section>

        <section className="panel p-4 sm:p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">2 · 勾選項目</h2>
            {brand.id === "design" && (
              <div className="flex gap-1 rounded-full border border-border p-1 text-xs font-semibold">
                {[
                  [false, "Standard"],
                  [true, "Premium"],
                ].map(([v, l]) => (
                  <button
                    key={String(l)}
                    type="button"
                    onClick={() => setPremium(v as boolean)}
                    aria-pressed={premium === v}
                    className={cn(
                      "h-8 rounded-full px-3",
                      premium === v ? "bg-primary text-primary-foreground" : "",
                    )}
                  >
                    {l as string}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ul className="divide-y divide-border">
            {rows.map((p) => {
              const l = lines[p.id];
              const u = unitPrice(p, l);
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={Boolean(l)}
                    aria-label={p.service}
                    onClick={() => toggle(p)}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                      l
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {l && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(p)}
                    className="min-w-0 flex-1 basis-48 text-left"
                  >
                    <span className="block text-[15px] font-semibold">{p.service}</span>
                    <span className="block text-xs text-muted-foreground">{p.billing}</span>
                  </button>
                  {l && isPerUnit(p.billing) && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="減少數量"
                        onClick={() => setQty(p.id, -1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {l.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="增加數量"
                        onClick={() => setQty(p.id, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {l ? (
                    <label className="flex items-center gap-1 text-sm">
                      <span className="sr-only">{p.service} 價錢</span>$
                      <input
                        inputMode="decimal"
                        value={l.custom ?? u ?? ""}
                        placeholder="輸入價錢"
                        onChange={(e) => setCustom(p.id, e.target.value.replace(/[^\d.]/g, ""))}
                        className="h-9 w-24 rounded-lg border border-border bg-card px-2 text-right font-semibold tabular-nums"
                      />
                    </label>
                  ) : (
                    <span className="w-24 text-right text-sm font-semibold tabular-nums text-muted-foreground">
                      {p.price}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4">
        <section className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <p className="text-xs opacity-80">
            {brand.label} · {brand.cur}
          </p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-sm">一次性</span>
            <span className="text-3xl font-bold tabular-nums">{money(oneTime, brand.cur)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm">每月</span>
            <span className="text-xl font-semibold tabular-nums">{money(monthly, brand.cur)}</span>
          </div>
          <p className="mt-2 text-xs opacity-80">已選 {picked.length} 項</p>
        </section>

        <section className="panel space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">3 · Email</h2>
            <div className="flex gap-1 rounded-full border border-border p-1 text-xs font-semibold">
              {(["en", "zh"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLang(v)}
                  aria-pressed={lang === v}
                  className={cn(
                    "h-8 rounded-full px-3",
                    lang === v ? "bg-primary text-primary-foreground" : "",
                  )}
                >
                  {v === "en" ? "English" : "中文"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">主旨：{subject}</p>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-3 font-sans text-[13px] leading-relaxed">
            {text}
          </pre>
          <a
            href={picked.length ? gmailUrl : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!picked.length}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground",
              !picked.length && "pointer-events-none opacity-40",
            )}
          >
            <Mail className="h-4 w-4" />在 Gmail 開成草稿
          </a>
          <p className="text-center text-xs text-muted-foreground">
            會用 sony@bluluma.com 開新信，Gmail 自動存成草稿；你檢查完自己按寄出
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!picked.length}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${subject}\n\n${text}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* clipboard blocked */
                }
              }}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold disabled:opacity-40"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "已複製" : "複製內容"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              清空
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Copy, Download, ImageOff, Search } from "lucide-react";
import { requireSignedIn } from "@/lib/auth";
import { StylePreview } from "@/components/StylePreview";
import { LogoDemo } from "@/components/LogoDemo";
import {
  FAMILIES,
  LOGO_COMBOS,
  LOGO_STYLES,
  LOGO_TYPES,
  PRINT_STYLES,
  SAMPLE_FONTS_URL,
  WEB_STYLES,
  findIndustry,
  getStyle,
  type Family,
  type Style,
} from "@/lib/styles";
import { cn } from "@/lib/utils";
import { ART_FOLLOWUP_PROMPT, ILLUS_STYLES, illusImg, type IllusStyle } from "@/lib/illustration-styles";

type Tab = "web" | "print" | "logo" | "illus";
type Search = { tab?: Tab | undefined; s?: string | undefined };

export const Route = createFileRoute("/styles")({
  ssr: false,
  beforeLoad: requireSignedIn,
  validateSearch: (search: Record<string, unknown>): Search => ({
    tab: search["tab"] === "print" || search["tab"] === "logo" || search["tab"] === "illus" ? search["tab"] : undefined,
    s: typeof search["s"] === "string" ? search["s"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "風格庫 · Bluluma HQ" },
      { name: "description", content: "設計風格對照表：Web、Print、Logo。說出風格名，設計就往那個方向走。" },
      { property: "og:title", content: "風格庫 · Bluluma HQ" },
    ],
    links: [{ rel: "stylesheet", href: SAMPLE_FONTS_URL }],
  }),
  component: StylesPage,
});

const TABS: { id: Tab; label: string; count: number }[] = [
  { id: "web", label: "Web", count: WEB_STYLES.length },
  { id: "print", label: "Print", count: PRINT_STYLES.length },
  { id: "logo", label: "Logo", count: LOGO_TYPES.length + LOGO_STYLES.length },
  { id: "illus", label: "插畫", count: ILLUS_STYLES.length },
];

function CopyKeyword({ text }: { text: string }) {
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
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-ink px-4 text-ink-foreground"
    >
      <span className="font-mono text-[15px]">{text}</span>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "已複製" : "Copy"}
      </span>
    </button>
  );
}

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "good" | "bad" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "good" && "bg-st-almost-bg text-st-almost-fg",
        tone === "bad" && "bg-st-deadline-bg text-st-deadline-fg",
      )}
    >
      {children}
    </span>
  );
}

function StyleCard({ style, tab }: { style: Style; tab: Tab }) {
  return (
    <Link
      to="/styles"
      search={{ tab: tab === "web" ? undefined : tab, s: style.id }}
      className="panel group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
    >
      <div className="h-[220px] sm:h-[240px]" aria-hidden>
        <StylePreview id={style.id} />
      </div>
      <div className="flex flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[17px] font-semibold tracking-tight">{style.name}</h2>
          <span className="font-mono text-xs text-muted-foreground">{style.no}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{style.tagline}</p>
        <div className="flex flex-wrap gap-1.5">
          {style.bestFor.slice(0, 3).map((b) => (
            <Chip key={b}>{b}</Chip>
          ))}
        </div>
      </div>
    </Link>
  );
}

function IndustryFinder({ tab }: { tab: Tab }) {
  const [q, setQ] = useState("");
  const hit = findIndustry(q);
  const picks = hit
    ? ([
        ["A · SAFE", hit.a],
        ["B · CONVERSION", hit.b],
        ["C · WILDCARD", hit.c],
      ] as const)
    : [];
  return (
    <section aria-label="Industry 找風格" className="panel flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-end lg:gap-5">
      <div className="flex flex-col gap-2 lg:w-72 lg:shrink-0">
        <label htmlFor="industry" className="text-sm font-semibold">
          Industry → 建議 style
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="industry"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="例如 pet care、牙醫、咖啡"
            className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      {hit ? (
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
          {picks.map(([label, id]) => {
            const s = getStyle(id);
            if (!s) return null;
            const wild = label.startsWith("C");
            return (
              <Link
                key={label}
                to="/styles"
                search={{ tab: tab === "web" ? undefined : tab, s: id }}
                className={cn(
                  "flex min-h-14 flex-col justify-center gap-0.5 rounded-xl border px-3.5 py-2.5 transition-colors hover:bg-accent",
                  wild ? "border-2 border-foreground" : "border-border",
                )}
              >
                <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
                <span className="text-[15px] font-semibold">{s.name}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="flex-1 text-sm text-muted-foreground">
          {q ? "沒找到這個 industry，下面的卡片可以直接挑。" : "輸入行業，給你 A / B / C 三個方向，C 是跳脫的 wildcard。"}
        </p>
      )}
    </section>
  );
}

function StyleGrid({ tab }: { tab: "web" | "print" }) {
  const [family, setFamily] = useState<Family | "">("");
  const list = (tab === "web" ? WEB_STYLES : PRINT_STYLES).filter((s) => !family || s.family === family);
  const printOnly = tab === "print" ? list.filter((s) => s.medium === "print") : [];
  const shared = tab === "print" ? list.filter((s) => s.medium === "web") : list;
  return (
    <>
      <IndustryFinder tab={tab} />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="風格家族">
        {[{ id: "" as const, label: "All" }, ...FAMILIES].map((f) => (
          <button
            key={f.id || "all"}
            type="button"
            onClick={() => setFamily(f.id)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-4 text-sm transition-colors",
              family === f.id ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {printOnly.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">印刷專屬</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {printOnly.map((s) => <StyleCard key={s.id} style={s} tab={tab} />)}
          </div>
        </section>
      )}
      <section className="space-y-3">
        {tab === "print" && <h2 className="text-sm font-semibold text-muted-foreground">Web 風格也適用於印刷</h2>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shared.map((s) => <StyleCard key={s.id} style={s} tab={tab} />)}
        </div>
      </section>
      {list.length === 0 && <p className="text-sm text-muted-foreground">這個家族在這裡沒有風格。</p>}
    </>
  );
}

function StyleDetail({ style, tab }: { style: Style; tab: Tab }) {
  const rows: { label: string; body: React.ReactNode }[] = [
    { label: "Fonts", body: style.fonts },
    { label: "Type scale", body: style.typeScale },
    {
      label: "Layout moves",
      body: (
        <ul className="list-disc space-y-1 pl-5">
          {style.layout.map((l) => <li key={l}>{l}</li>)}
        </ul>
      ),
    },
    { label: "Decoration · brand device", body: style.decoration },
    {
      label: "Palette",
      body: (
        <div className="flex gap-2">
          {style.palette.map((c) => (
            <span key={c} title={c} className="h-11 w-11 rounded-lg border border-border" style={{ background: c }} />
          ))}
        </div>
      ),
    },
    { label: "Best for", body: <div className="flex flex-wrap gap-1.5">{style.bestFor.map((b) => <Chip key={b} tone="good">{b}</Chip>)}</div> },
    { label: "Avoid for", body: <div className="flex flex-wrap gap-1.5">{style.avoidFor.map((b) => <Chip key={b} tone="bad">{b}</Chip>)}</div> },
    { label: "C wildcard pairs", body: style.pairs },
  ];
  return (
    <div className="space-y-5">
      <Link
        to="/styles"
        search={{ tab: tab === "web" ? undefined : tab }}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 風格庫 / {tab === "web" ? "Web" : tab === "print" ? "Print" : "Logo"}
      </Link>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <div className="panel overflow-hidden p-0">
          <div className="h-[260px] sm:h-[420px]" aria-hidden>
            <StylePreview id={style.id} />
          </div>
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">Live sample · 假品牌示範</p>
        </div>
        <aside className="space-y-4">
          <div className="space-y-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              {style.no} · {FAMILIES.find((f) => f.id === style.family)?.label}
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{style.name}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{style.tagline}</p>
          </div>
          <CopyKeyword text={`style: ${style.name}`} />
          <dl className="panel divide-y divide-border p-0">
            {rows.map((r) => (
              <div key={r.label} className="space-y-1.5 px-4 py-3.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</dt>
                <dd className="text-sm leading-relaxed">{r.body}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}

function LogoTab() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted-foreground">AXIS 1</span>
          <h2 className="text-lg font-semibold">類型 · Structure</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {LOGO_TYPES.map((t) => (
            <article key={t.id} className="panel flex flex-col overflow-hidden p-0">
              <div className="h-[130px] sm:h-[160px]" aria-hidden><LogoDemo id={t.id} /></div>
              <div className="space-y-1 p-3.5 sm:p-4">
                <h3 className="text-[15px] font-semibold leading-snug">{t.name}</h3>
                <p className="text-xs text-muted-foreground sm:text-[13px]">{t.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted-foreground">AXIS 2</span>
          <h2 className="text-lg font-semibold">風格 · Technique</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {LOGO_STYLES.map((t) => (
            <article key={t.id} className="panel flex flex-col overflow-hidden p-0">
              <div className="h-[150px] sm:h-[190px]" aria-hidden><LogoDemo id={t.id} /></div>
              <div className="space-y-1 p-3.5 sm:p-4">
                <h3 className="text-[15px] font-semibold leading-snug">{t.name}</h3>
                <p className="text-xs text-muted-foreground sm:text-[13px]">{t.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted-foreground">COMBINE</span>
          <h2 className="text-lg font-semibold">類型 × 風格 · 常用組合</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LOGO_COMBOS.map((c) => (
            <div key={c.combo} className="flex flex-col gap-1.5 rounded-2xl bg-ink p-4 text-ink-foreground">
              <span className="font-mono text-sm">{c.combo}</span>
              <span className="text-sm opacity-75">{c.use}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className="panel space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
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
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-ink-foreground"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "已複製" : "Copy"}
        </button>
      </div>
      <p className={cn("whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground", !open && "line-clamp-4")}>{text}</p>
      {text.length > 280 && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-h-10 text-sm font-semibold">
          {open ? "收起" : "展開全文"}
        </button>
      )}
    </div>
  );
}

function IllusImage({ style, kind, label, ratio }: { style: IllusStyle; kind: "before" | "compare" | "art"; label: string; ratio: string }) {
  return (
    <figure className="flex min-w-0 flex-col gap-1.5">
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted" style={{ aspectRatio: ratio }}>
        {style.hasSample ? (
          <img src={illusImg(style.no, kind)} alt={`${style.name} ${label}`} loading="lazy" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOff className="h-5 w-5" aria-hidden />
            <span className="text-xs">範例待生成</span>
          </div>
        )}
      </div>
      <figcaption className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</figcaption>
    </figure>
  );
}

function IllusTab() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ILLUS_STYLES.map((st) => (
        <Link key={st.no} to="/styles" search={{ tab: "illus", s: st.no }} className="panel flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:p-5">
          <div className="grid grid-cols-2 gap-2.5">
            <IllusImage style={st} kind="before" label="Before" ratio="4 / 5" />
            <IllusImage style={st} kind="art" label="After" ratio="4 / 5" />
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-semibold tracking-tight">{st.name}</h2>
            <span className="font-mono text-xs text-muted-foreground">{st.no} · {st.en}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{st.desc}</p>
          <div className="flex flex-wrap gap-1.5">
            <Chip tone="good">適合：{st.goodFor}</Chip>
          </div>
        </Link>
      ))}
    </div>
  );
}

function IllusDetail({ style }: { style: IllusStyle }) {
  return (
    <div className="space-y-5">
      <Link to="/styles" search={{ tab: "illus" }} className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 風格庫 / 插畫
      </Link>
      <div className="space-y-1.5">
        <span className="font-mono text-xs text-muted-foreground">{style.no} · {style.en}</span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{style.name}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{style.desc}</p>
        <div className="flex flex-wrap gap-1.5 pt-1"><Chip tone="good">適合：{style.goodFor}</Chip></div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <IllusImage style={style} kind="before" label="Before · 原照" ratio="4 / 5" />
        <IllusImage style={style} kind="art" label="After · 單張作品" ratio="4 / 5" />
        <div className="col-span-2 lg:col-span-1">
          <IllusImage style={style} kind="compare" label="對照海報 3:4" ratio="3 / 4" />
        </div>
      </div>
      {style.hasSample && (
        <div className="flex flex-wrap gap-2">
          <a href={illusImg(style.no, "art")} download className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-accent">
            <Download className="h-4 w-4" /> 下載單張作品
          </a>
          <a href={illusImg(style.no, "compare")} download className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-accent">
            <Download className="h-4 w-4" /> 下載對照海報
          </a>
        </div>
      )}
      {style.credit && <p className="text-xs text-muted-foreground">原照：{style.credit}</p>}
      <CopyKeyword text={`插畫藝術風格 ${style.no}`} />
      <CopyBlock label="① 對照海報 prompt（貼到 ChatGPT，附上原照）" text={style.prompt} />
      <CopyBlock label="② 單張作品追加指令（第 ① 張出圖後再貼）" text={ART_FOLLOWUP_PROMPT} />
    </div>
  );
}

function StylesPage() {
  const { tab: rawTab, s } = Route.useSearch();
  const tab: Tab = rawTab ?? "web";
  const navigate = useNavigate();
  const selected = s ? getStyle(s) : undefined;

  if (tab === "illus" && s) {
    const illus = ILLUS_STYLES.find((x) => x.no === s);
    if (illus) return <IllusDetail style={illus} />;
  }
  if (selected && tab !== "logo" && tab !== "illus") return <StyleDetail style={selected} tab={tab} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">風格庫</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "logo"
              ? "Logo = 類型 × 風格，例如「Monogram × Geometric」。"
              : tab === "illus"
                ? "照片 → 插畫海報（ChatGPT 生圖）。說「插畫藝術風格 01」到「10」，每張原照出對照海報＋單張作品。"
                : "每個風格一個 keyword。說出名字，整個設計就往那個方向走。"}
          </p>
        </div>
        <div role="tablist" aria-label="媒材" className="inline-flex self-start rounded-xl border border-border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => navigate({ to: "/styles", search: { tab: t.id === "web" ? undefined : t.id } })}
              className={cn(
                "h-10 rounded-lg px-4 text-sm transition-colors",
                tab === t.id ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label} <span className="tabular-nums opacity-70">{t.count}</span>
            </button>
          ))}
        </div>
      </div>
      {tab === "logo" ? <LogoTab /> : tab === "illus" ? <IllusTab /> : <StyleGrid key={tab} tab={tab} />}
    </div>
  );
}


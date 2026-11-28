import { useState } from "react";
import { Check, ExternalLink, Flame, X } from "lucide-react";
import { GMAIL_DRAFTS, LEAD_STATUS, isActive, useLeads, type LeadRow } from "@/data/leads";
import { relativeActivityTime } from "@/data/mapping";
import { cn } from "@/lib/utils";

/** 業務部 leads on the 客戶 page: who to reply to today, without a new tab. */
export function LeadsPanel() {
  const leads = useLeads();
  const [showAll, setShowAll] = useState(false);
  if (leads.isPending || leads.error) return null;
  const all = leads.data ?? [];
  const active = all.filter(isActive);
  const waiting = active.filter((l) => l.status === "drafted" || l.status === "new");
  const closed = all.filter((l) => !isActive(l));
  const shown = showAll ? all : active;

  return (
    <section className="panel p-4 sm:p-5" aria-label="Leads">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-lg font-semibold">Leads</h2>
        <span className="text-sm text-muted-foreground">
          {waiting.length > 0 ? `${waiting.length} 個草稿等你寄` : "沒有要回的 lead"} ·
          業務部每小時檢查一次
        </span>
        {waiting.length > 0 && (
          <a
            href={GMAIL_DRAFTS}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
          >
            打開 Gmail 草稿 <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {all.length === 0
            ? "還沒有 lead。新的詢問一進來，業務部會擬好回覆放進 Gmail 草稿，這裡也會出現。"
            : "目前沒有進行中的 lead。"}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {shown.map((l) => (
            <LeadItem key={l.id} lead={l} onStatus={(s) => leads.setStatus(l.id, s)} />
          ))}
        </ul>
      )}
      {closed.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 h-9 text-sm font-medium text-primary"
        >
          {showAll ? "只看進行中" : `看全部（含成交 / 冷掉 ${closed.length} 個）`}
        </button>
      )}
    </section>
  );
}

function LeadItem({
  lead: l,
  onStatus,
}: {
  lead: LeadRow;
  onStatus: (s: LeadRow["status"]) => void;
}) {
  const st = LEAD_STATUS[l.status];
  const last = Date.parse(l.last_inbound_at ?? l.created_at);
  return (
    <li className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {l.hot && (
            <span className="inline-flex items-center gap-1 rounded-full bg-st-deadline-bg px-2 py-0.5 text-xs font-semibold text-st-deadline-fg">
              <Flame className="h-3 w-3" />熱
            </span>
          )}
          <span className="font-semibold">{l.name ?? "（沒留名字）"}</span>
          {l.brand && <span className="text-xs text-muted-foreground">{l.brand}</span>}
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", st.cls)}>
            {st.label}
          </span>
          {l.followups > 0 && (
            <span className="text-xs text-muted-foreground">已追 {l.followups} 次</span>
          )}
        </div>
        {l.ask && <p className="mt-1 text-sm leading-relaxed">{l.ask}</p>}
        {l.draft_note && isActive(l) && (
          <p className="mt-0.5 text-xs text-primary">{l.draft_note}</p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {l.email ?? l.phone ?? ""}
          {l.email || l.phone ? " · " : ""}最後來信{" "}
          {Number.isFinite(last) ? relativeActivityTime(last) : "—"}
          {l.status === "replied" &&
            l.next_followup_at &&
            ` · ${l.next_followup_at.slice(5, 10).replace("-", "/")} 會擬追蹤信`}
        </p>
      </div>
      {isActive(l) && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onStatus("won")}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium hover:bg-accent"
          >
            <Check className="h-4 w-4" />
            成交
          </button>
          <button
            type="button"
            onClick={() => onStatus("ignored")}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
            不用追
          </button>
        </div>
      )}
    </li>
  );
}

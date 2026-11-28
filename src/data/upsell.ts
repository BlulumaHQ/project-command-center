// Upsell ladder: from what a client already bought, work out the next offer and when to bring it up.
// Pure + browser-safe so the clients page and tests use the same rules. No prices here on purpose
// (HQ is sometimes shown to friends/clients); prices live on the 價目表 page.
import type { ClientRow } from "@/data/hq2";

export type LadderId = "healthcare" | "realtor" | "shop" | "swift" | "standard";

export interface Step {
  id: string;
  label: string;
  /** matches against the client's services text */
  has: RegExp;
}

export const LADDERS: Record<LadderId, { name: string; steps: Step[] }> = {
  healthcare: {
    name: "Bluluma 醫療",
    steps: [
      { id: "site", label: "網站 + 月費", has: /網站|web|site|brand package|hosting/i },
      { id: "seo", label: "Premium SEO", has: /seo/i },
      { id: "flow", label: "Patient Flow", has: /patient flow|廣告|ads/i },
    ],
  },
  realtor: {
    name: "Realtor",
    steps: [
      { id: "site", label: "網站 + 月費", has: /網站|web|site|hosting/i },
      { id: "housvis", label: "Housvis", has: /housvis/i },
    ],
  },
  shop: {
    name: "電商",
    steps: [
      { id: "site", label: "網站 / Shopify", has: /網站|web|site|shopify|managed service/i },
      { id: "seo", label: "SEO", has: /seo/i },
      { id: "nightclerk", label: "NightClerk 自動化", has: /nightclerk|自動化|sync/i },
    ],
  },
  swift: {
    name: "SwiftSite / SwiftLift",
    steps: [
      { id: "site", label: "建站 + 月費", has: /網站|web|site|hosting/i },
      { id: "seo", label: "SEO 包", has: /seo/i },
    ],
  },
  standard: {
    name: "標準",
    steps: [
      { id: "site", label: "網站", has: /網站|web|site|package/i },
      { id: "hosting", label: "Managed Hosting", has: /hosting|managed service/i },
      { id: "lang", label: "第二語言", has: /中文|雙語|第二語言|bilingual|中英|korean|韓/i },
      { id: "seo", label: "SEO 3 個月", has: /seo/i },
      { id: "care", label: "SEO Ongoing Care", has: /ongoing|care/i },
    ],
  },
};

/** Clients Sony marked 不用理, agencies that send him work, and unsigned prospects get no upsell. */
const SKIP_NAME = /代理商|chinese culture festival|cesc/i;
const PROSPECT = /^(提案|報價)$/;

export function pickLadder(c: Pick<ClientRow, "name" | "brand" | "services">): LadderId {
  const text = `${c.name} ${(c.services ?? []).join(" ")}`;
  const brand = c.brand ?? "";
  if (/swift/i.test(brand)) return "swift";
  // Healthcare / realtor ladders are Bluluma products; Sonykun clients stay on the standard ladder.
  if (/sonykun/i.test(brand)) return /shop|shopify|store|電商/i.test(text) ? "shop" : "standard";
  if (/dental|orthodont|clinic|wellness|health|medical|牙|診所/i.test(text)) return "healthcare";
  if (/realt|realtor|地產/i.test(text)) return "realtor";
  if (/shop|shopify|store|toy|電商/i.test(text)) return "shop";
  return "standard";
}

export interface Upsell {
  ladder: LadderId;
  ladderName: string;
  steps: { id: string; label: string; state: "done" | "next" | "later" }[];
  next: string | null;
  /** short timing hint, e.g. "現在可以推" / "續約前一起推 · 6/1" */
  when: string | null;
  /** true when the right moment is now (within the 30-day windows) */
  now: boolean;
}

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const md = (iso: string) => `${+iso.slice(5, 7)}/${+iso.slice(8, 10)}`;

export function upsellFor(c: ClientRow, today: string): Upsell | null {
  if (SKIP_NAME.test(c.name)) return null;
  const services = c.services ?? [];
  if (services.length === 0) return null;
  if (PROSPECT.test((c.status ?? "").trim())) return null;

  const ladder = pickLadder(c);
  const text = services.join(" / ");
  const have = LADDERS[ladder].steps.map((s) => s.has.test(text));
  // Anyone with a paid service is already a client, so the first rung counts as done.
  have[0] = true;
  const nextIdx = have.findIndex((h) => !h);
  const steps = LADDERS[ladder].steps.map((s, i) => ({
    id: s.id,
    label: s.label,
    state: (have[i] ? "done" : i === nextIdx ? "next" : "later") as "done" | "next" | "later",
  }));
  const next = nextIdx === -1 ? null : (LADDERS[ladder].steps[nextIdx]?.label ?? null);
  if (!next)
    return { ladder, ladderName: LADDERS[ladder].name, steps, next, when: null, now: false };

  // Timing: 30 days after delivery, and again 30 days before a renewal.
  const renewal = (c.renewals ?? [])
    .map((r) => r.date)
    .filter((d) => d >= today)
    .sort()[0];
  const afterDelivery = c.since ? addDays(c.since, 30) : null;
  let when: string;
  let now = false;
  if (renewal && renewal <= addDays(today, 30)) {
    when = `續約前一起推 · ${md(renewal)} 到期`;
    now = true;
  } else if (afterDelivery && afterDelivery > today) {
    when = `交件滿 30 天再推 · ${md(afterDelivery)}`;
  } else if (afterDelivery || /live/i.test(c.status ?? "")) {
    when = renewal ? `現在可以推（下次續約 ${md(renewal)}）` : "現在可以推";
    now = true;
  } else if (renewal) {
    when = `續約前 30 天推 · ${md(addDays(renewal, -30))}`;
  } else {
    when = "交件滿 30 天後推";
  }
  return { ladder, ladderName: LADDERS[ladder].name, steps, next, when, now };
}

// Weekly business numbers (財務部 / Ledger). Written every Monday by the scheduled 財務部 run
// from the 4 Stripe accounts + the Leads tab. Browser-only, RLS limits the table to Sony.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const TOTAL = "合計";
export const BIZ_BRANDS = ["Bluluma Design", "Sonykun Design", "SwiftLift", "SwiftSite"];

export interface Renewal {
  client: string;
  item: string;
  date: string;
  amount?: number | null;
}
export interface BizRow {
  id: number;
  week: string;
  brand: string;
  currency: string;
  mrr: number | null;
  revenue: number | null;
  sales: number | null;
  new_customers: number | null;
  leads: number | null;
  unpaid: number | null;
  unpaid_count: number | null;
  renewals: Renewal[] | null;
  note: string | null;
  created_at: string;
}

export interface WeekView {
  week: string | null;
  prevWeek: string | null;
  total: BizRow | null;
  prevTotal: BizRow | null;
  brands: { brand: string; row: BizRow | null; prev: BizRow | null }[];
  renewals: (Renewal & { brand: string })[];
  /** lead → sale conversion of the latest week, 0–100, null when there were no leads */
  conversion: number | null;
}

/** Pure: pick the latest and previous week from the rows. */
export function summarizeWeeks(rows: BizRow[]): WeekView {
  const weeks = [...new Set(rows.map((r) => r.week))].sort().reverse();
  const [week = null, prevWeek = null] = weeks;
  const find = (w: string | null, b: string) =>
    (w && rows.find((r) => r.week === w && r.brand === b)) || null;
  const total = find(week, TOTAL);
  const brands = BIZ_BRANDS.map((brand) => ({
    brand,
    row: find(week, brand),
    prev: find(prevWeek, brand),
  }));
  const renewals = brands
    .flatMap((b) => (b.row?.renewals ?? []).map((r) => ({ ...r, brand: b.brand })))
    .sort((a, b) => a.date.localeCompare(b.date));
  const leads = total?.leads ?? null;
  const conversion =
    leads && leads > 0 && total?.sales != null ? Math.round((total.sales / leads) * 100) : null;
  return { week, prevWeek, total, prevTotal: find(prevWeek, TOTAL), brands, renewals, conversion };
}

/** Pure: change vs last week as a short label, e.g. "+12%" / "持平"; null when not comparable. */
export function delta(now: number | null | undefined, before: number | null | undefined) {
  if (now == null || before == null) return null;
  if (before === 0) return now === 0 ? "持平" : "新";
  const pct = Math.round(((now - before) / Math.abs(before)) * 100);
  return pct === 0 ? "持平" : `${pct > 0 ? "+" : ""}${pct}%`;
}

async function load() {
  if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
  const { data, error } = await supabase
    .from("pcc_biz_weekly")
    .select("*")
    .order("week", { ascending: false })
    .limit(40);
  if (error) throw new Error(`pcc_biz_weekly: ${error.message}`);
  return summarizeWeeks((data ?? []) as BizRow[]);
}

export function useBizWeekly() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["pcc", user?.id, "biz-weekly"],
    queryFn: load,
    enabled: ready && Boolean(user),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

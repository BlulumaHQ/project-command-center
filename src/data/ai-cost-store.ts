// AI 成本帳: browser-only, auth-gated (same rules as the main data store).
// Rows in pcc_ai_usage are written by edge functions / HQ 助理 through the pcc_log_ai_usage RPC.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface UsageRow {
  id: string;
  created_at: string;
  provider: string;
  model: string;
  kind: string;
  feature: string;
  client_id: string | null;
  brand: string | null;
  images: number;
  cost_usd: number;
  summary: string | null;
  result_ref: string | null;
  status: string;
}
export interface LimitRow {
  feature: string;
  monthly_usd: number;
  note: string | null;
}

export const FEATURE_LABEL: Record<string, string> = {
  "image-gen": "畫圖",
  "board-meeting": "董事會",
  "hq-assistant": "HQ 助理",
  studio: "BluLuma Studio",
};
export const PROVIDER_LABEL: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  kimi: "Kimi",
  anthropic: "Claude",
};

async function load() {
  const since = new Date();
  since.setMonth(since.getMonth() - 11, 1);
  since.setHours(0, 0, 0, 0);
  const [u, l, c, m] = await Promise.all([
    supabase
      .from("pcc_ai_usage")
      .select(
        "id, created_at, provider, model, kind, feature, client_id, brand, images, cost_usd, summary, result_ref, status",
      )
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase.from("pcc_ai_limits").select("feature, monthly_usd, note").order("feature"),
    supabase.from("pcc_clients").select("id, name"),
    supabase.from("pcc_meta").select("value").eq("key", "usd_cad").maybeSingle(),
  ]);
  if (u.error) throw new Error(u.error.message);
  if (l.error) throw new Error(l.error.message);
  const rows = ((u.data ?? []) as UsageRow[])
    .filter((r) => r.summary !== "__TEST__")
    .map((r) => ({ ...r, cost_usd: Number(r.cost_usd) || 0 }));
  const clients = new Map<string, string>(
    ((c.data ?? []) as { id: string; name: string }[]).map((x) => [x.id, x.name]),
  );
  const rate = Number((m.data?.value as { rate?: number } | undefined)?.rate) || 1.38;
  return {
    rows,
    limits: ((l.data ?? []) as LimitRow[]).map((x) => ({
      ...x,
      monthly_usd: Number(x.monthly_usd),
    })),
    clients,
    rate,
  };
}

export function useAiCost() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = ["ai-cost", user?.id];
  const query = useQuery({
    queryKey: key,
    queryFn: load,
    enabled: ready && Boolean(user),
    staleTime: 60_000,
    retry: 1,
  });
  const setLimit = useMutation({
    mutationFn: async ({ feature, monthly_usd }: { feature: string; monthly_usd: number }) => {
      const { error } = await supabase
        .from("pcc_ai_limits")
        .update({ monthly_usd })
        .eq("feature", feature);
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
  return { ...query, setLimit };
}

/** Pure summary helpers (browser-safe, testable). */
export function monthKey(iso: string) {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(d);
  return `${p.find((x) => x.type === "year")?.value}-${p.find((x) => x.type === "month")?.value}`;
}

export function summarize(rows: UsageRow[], clients: Map<string, string>, now = new Date()) {
  const thisMonth = monthKey(now.toISOString());
  const month = rows.filter((r) => monthKey(r.created_at) === thisMonth);
  const sum = (xs: UsageRow[]) => xs.reduce((n, r) => n + r.cost_usd, 0);
  const images = rows.filter((r) => r.kind === "image" && r.status === "ok");
  const imageCount = images.reduce((n, r) => n + (r.images || 0), 0);

  const group = (xs: UsageRow[], keyOf: (r: UsageRow) => string) => {
    const m = new Map<string, { cost: number; calls: number; images: number }>();
    for (const r of xs) {
      const k = keyOf(r);
      const g = m.get(k) ?? { cost: 0, calls: 0, images: 0 };
      g.cost += r.cost_usd;
      g.calls += 1;
      g.images += r.images || 0;
      m.set(k, g);
    }
    return [...m.entries()].map(([k, v]) => ({ key: k, ...v })).sort((a, b) => b.cost - a.cost);
  };

  const clientName = (r: UsageRow) =>
    r.client_id ? (clients.get(r.client_id) ?? "（已刪除的客戶）") : "自己 / 沒指定客戶";
  const monthTotals = new Map(group(month, clientName).map((g) => [g.key, g.cost]));

  return {
    monthTotal: sum(month),
    monthCalls: month.length,
    monthImages: month.reduce((n, r) => n + (r.images || 0), 0),
    avgPerImage: imageCount ? sum(images) / imageCount : null,
    byClient: group(rows, clientName).map((g) => ({ ...g, month: monthTotals.get(g.key) ?? 0 })),
    byFeatureMonth: group(month, (r) => r.feature),
    byProviderMonth: group(month, (r) => r.provider),
    byMonth: group(rows, (r) => monthKey(r.created_at)).sort((a, b) => b.key.localeCompare(a.key)),
    recent: rows.slice(0, 20),
  };
}

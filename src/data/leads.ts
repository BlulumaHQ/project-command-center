// Leads (業務部). Written by the hourly 業務部 scheduled run (Dash 快手 first replies, Chase 阿追 follow-ups):
// every new inquiry from email / website forms / ads becomes a row, and each reply waits as a Gmail draft.
// Browser-only, RLS limits the table to Sony.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type LeadStatus = "new" | "drafted" | "replied" | "won" | "lost" | "cold" | "ignored";

export interface LeadRow {
  id: string;
  brand: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  subject: string | null;
  ask: string | null;
  status: LeadStatus;
  hot: boolean;
  followups: number;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  next_followup_at: string | null;
  draft_note: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const GMAIL_DRAFTS = "https://mail.google.com/mail/?authuser=sony@bluluma.com#drafts";

export const LEAD_STATUS: Record<LeadStatus, { label: string; cls: string }> = {
  new: { label: "新進來", cls: "bg-amber-100 text-amber-800" },
  drafted: { label: "草稿等你寄", cls: "bg-primary/10 text-primary" },
  replied: { label: "已回，等對方", cls: "bg-muted text-muted-foreground" },
  won: { label: "成交", cls: "bg-st-almost-bg text-st-almost-fg" },
  lost: { label: "沒成", cls: "bg-muted text-muted-foreground" },
  cold: { label: "冷了", cls: "bg-muted text-muted-foreground" },
  ignored: { label: "不用追", cls: "bg-muted text-muted-foreground" },
};

const ACTIVE: LeadStatus[] = ["new", "drafted", "replied"];
export const isActive = (l: LeadRow) => ACTIVE.includes(l.status);

/** Pure: what Sony should look at first — waiting drafts (hot first), then the rest by last contact. */
export function sortLeads(rows: LeadRow[]): LeadRow[] {
  const rank = (l: LeadRow) =>
    l.status === "drafted" || l.status === "new" ? 0 : isActive(l) ? 1 : 2;
  const time = (l: LeadRow) => Date.parse(l.last_inbound_at ?? l.created_at) || 0;
  return [...rows].sort(
    (a, b) => rank(a) - rank(b) || Number(b.hot) - Number(a.hot) || time(b) - time(a),
  );
}

export function useLeads() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = ["pcc", user?.id, "pcc_leads"];
  const query = useQuery({
    queryKey: key,
    enabled: ready && Boolean(user),
    staleTime: 30_000,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pcc_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(`pcc_leads: ${error.message}`);
      return sortLeads((data ?? []) as LeadRow[]);
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from("pcc_leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: ({ id, status }) => {
      client.setQueryData<LeadRow[]>(key, (list) =>
        (list ?? []).map((l) => (l.id === id ? { ...l, status } : l)),
      );
    },
    onError: (e) => {
      toast.error(`儲存失敗：${e.message}`);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
  return {
    ...query,
    setStatus: (id: string, status: LeadStatus) => setStatus.mutate({ id, status }),
  };
}

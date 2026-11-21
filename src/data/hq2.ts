// Browser-only queries for the HQ 2.0 tables (pcc_clients, pcc_prices). RLS limits both to Sony.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface ClientAccount {
  label: string;
  value: string;
  owner?: string;
}
export interface ClientRenewal {
  date: string;
  title: string;
  auto?: boolean;
}
export interface ClientRow {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  brand: string | null;
  services: string[] | null;
  accounts: ClientAccount[] | null;
  renewals: ClientRenewal[] | null;
  notes: string | null;
  since: string | null;
  status: string | null;
  sort: number | null;
}
export interface PriceRow {
  id: string;
  brand: string;
  category: string;
  service: string;
  included: string | null;
  price: string | null;
  price_premium: string | null;
  partner_price: string | null;
  billing: string | null;
  note: string | null;
  stripe_link: string | null;
  sort: number | null;
}

async function read<T>(table: string): Promise<T[]> {
  if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
  const { data, error } = await supabase.from(table).select("*").order("sort", { ascending: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

function useTable<T>(table: string) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["pcc", user?.id, table],
    queryFn: () => read<T>(table),
    enabled: ready && Boolean(user),
    staleTime: 60_000,
    retry: 1,
  });
}

export const useClients = () => useTable<ClientRow>("pcc_clients");
export const usePrices = () => useTable<PriceRow>("pcc_prices");

/** Days from today (Vancouver) to an ISO date; negative = past. */
export function daysUntil(date: string, today: string) {
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000,
  );
}

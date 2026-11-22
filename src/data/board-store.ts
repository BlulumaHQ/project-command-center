// Board meetings: browser-only, auth-gated (same rules as the main data store).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { GUEST_ID, GUEST_POOL, type Director } from "@/lib/board";

export interface Minutes {
  round1: { id: string; verdict: string; points: string[]; ask: string }[];
  roast: { from: string; to: string; line: string }[];
  summary: { consensus: string[]; split: string[]; chair: string; next: string };
  /** Who sat in the 神秘嘉賓 seat (round1/roast use id "guest"). */
  guest?: { id: string; name: string; focus: string; reason: string };
}
export interface BoardTurn {
  question: string;
  minutes: Minutes;
  at: string;
}
export interface MeetingRow {
  id: string;
  topic: string;
  directors: string[];
  turns: BoardTurn[];
  source: string;
  created_at: string;
  updated_at: string;
}

const TABLE = "pcc_board_meetings";

async function callBoard(
  question: string,
  directors: Director[],
  history: BoardTurn[],
): Promise<Minutes> {
  const withGuest = directors.some((d) => d.id === GUEST_ID);
  // Keep the same guest for follow-ups in one meeting.
  const prevGuest = [...history].reverse().find((t) => t.minutes.guest)?.minutes.guest?.id;
  const { data, error } = await supabase.functions.invoke("board-meeting", {
    body: {
      question,
      guestPool: withGuest ? GUEST_POOL : [],
      ...(withGuest && prevGuest ? { guestId: prevGuest } : {}),
      directors: directors
        .filter((d) => d.id !== GUEST_ID)
        .map(({ id, name, focus, lens, asks }) => ({
          id,
          name,
          focus,
          lens,
          asks,
        })),
      history,
    },
  });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const body = (await error.context.json()) as { error?: string };
        if (body.error) msg = body.error;
      } catch {
        /* keep default message */
      }
    }
    throw new Error(msg);
  }
  const minutes = (data as { minutes?: Minutes } | null)?.minutes;
  if (!minutes?.summary) throw new Error("董事會沒有產出紀錄，請再試一次");
  return {
    round1: minutes.round1 ?? [],
    roast: minutes.roast ?? [],
    summary: {
      consensus: minutes.summary.consensus ?? [],
      split: minutes.summary.split ?? [],
      chair: minutes.summary.chair ?? "",
      next: minutes.summary.next ?? "",
    },
    ...(minutes.guest ? { guest: minutes.guest } : {}),
  };
}

export function useBoard() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = ["pcc", user?.id, TABLE];
  const meetings = useQuery({
    queryKey: key,
    enabled: ready && Boolean(user),
    staleTime: 30_000,
    retry: 1,
    queryFn: async () => {
      if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw new Error(error.message);
      return (data ?? []) as MeetingRow[];
    },
  });

  const ask = useMutation({
    mutationFn: async (input: {
      meeting: MeetingRow | null;
      question: string;
      directors: Director[];
    }) => {
      const history = input.meeting?.turns ?? [];
      const minutes = await callBoard(input.question, input.directors, history);
      const turn: BoardTurn = { question: input.question, minutes, at: new Date().toISOString() };
      const now = new Date().toISOString();
      const row: MeetingRow = input.meeting
        ? { ...input.meeting, turns: [...history, turn], updated_at: now }
        : {
            id: crypto.randomUUID(),
            topic: input.question.slice(0, 120),
            directors: input.directors.map((d) => d.id),
            turns: [turn],
            source: "hq",
            created_at: now,
            updated_at: now,
          };
      // Show the result even if saving fails; saving error is surfaced separately.
      client.setQueryData<MeetingRow[]>(key, (list) => [
        row,
        ...(list ?? []).filter((m) => m.id !== row.id),
      ]);
      const { error } = await supabase.from(TABLE).upsert({
        id: row.id,
        topic: row.topic,
        directors: row.directors,
        turns: row.turns,
        source: row.source,
        updated_at: row.updated_at,
      });
      return { row, saveError: error?.message ?? null };
    },
  });

  return {
    meetings: meetings.data ?? [],
    loading: meetings.isPending && Boolean(user),
    ask,
  };
}

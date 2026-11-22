// 隨手記: Sony's idea inbox (pcc_ideas). Browser-only, RLS limits rows to Sony.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type IdeaStatus = "new" | "planned" | "done" | "dropped";
export interface IdeaRow {
  id: string;
  body: string;
  tag: string | null;
  status: IdeaStatus;
  pinned: boolean;
  project_id: string | null;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}

export const IDEA_TAGS = ["Bluluma", "Sonykun", "SwiftLift", "SwiftSite", "Night Clerk", "HQ", "個人"];

export const IDEA_STATUS: Record<IdeaStatus, string> = {
  new: "還沒做",
  planned: "已排進任務",
  done: "做完了",
  dropped: "不做了",
};

/** Pinned first, then open ideas newest first, closed ones last. */
export function sortIdeas(list: IdeaRow[]) {
  const open = (s: IdeaStatus) => (s === "new" || s === "planned" ? 0 : 1);
  return [...list].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      open(a.status) - open(b.status) ||
      Date.parse(b.created_at) - Date.parse(a.created_at),
  );
}

export function useIdeas() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const key = ["pcc", user?.id, "pcc_ideas"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      if (typeof window === "undefined") throw new Error("資料僅在登入後於瀏覽器讀取");
      const { data, error } = await supabase
        .from("pcc_ideas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(`pcc_ideas: ${error.message}`);
      return (data ?? []) as IdeaRow[];
    },
    enabled: ready && Boolean(user),
    staleTime: 30_000,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: async (op: {
      apply: (list: IdeaRow[]) => IdeaRow[];
      exec: () => PromiseLike<{ error: { message: string } | null }>;
    }) => {
      const { error } = await op.exec();
      if (error) throw new Error(error.message);
    },
    onMutate: async (op) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<IdeaRow[]>(key);
      client.setQueryData<IdeaRow[]>(key, (list) => op.apply(list ?? []));
      return { previous };
    },
    onError: (error, _op, ctx) => {
      if (ctx?.previous) client.setQueryData(key, ctx.previous);
      toast.error(`儲存失敗：${error.message}`);
    },
    onSettled: () => void client.invalidateQueries({ queryKey: key }),
  });

  const patch = (id: string, changes: Partial<IdeaRow>) =>
    mutation.mutate({
      apply: (list) => list.map((i) => (i.id === id ? { ...i, ...changes } : i)),
      exec: () =>
        supabase
          .from("pcc_ideas")
          .update({ ...changes, updated_at: new Date().toISOString() })
          .eq("id", id),
    });

  return {
    ...query,
    ideas: sortIdeas(query.data ?? []),
    add: (body: string, tag: string | null) => {
      const clean = body.trim();
      if (!clean) return;
      const now = new Date().toISOString();
      const row: IdeaRow = {
        id: crypto.randomUUID(),
        body: clean,
        tag,
        status: "new",
        pinned: false,
        project_id: null,
        task_id: null,
        created_at: now,
        updated_at: now,
      };
      mutation.mutate({
        apply: (list) => [row, ...list],
        exec: () =>
          supabase.from("pcc_ideas").insert({ id: row.id, body: row.body, tag: row.tag }),
      });
    },
    setStatus: (id: string, status: IdeaStatus) => patch(id, { status }),
    togglePin: (id: string, pinned: boolean) => patch(id, { pinned }),
    linkTask: (id: string, projectId: string, taskId: string) =>
      patch(id, { status: "planned", project_id: projectId, task_id: taskId }),
    remove: (id: string) =>
      mutation.mutate({
        apply: (list) => list.filter((i) => i.id !== id),
        exec: () => supabase.from("pcc_ideas").delete().eq("id", id),
      }),
  };
}

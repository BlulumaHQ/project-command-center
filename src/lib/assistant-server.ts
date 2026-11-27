// Server-only: HQ 助理. Runs Claude with a small set of tools over Sony's pcc_* tables.
// Every database call uses the signed-in user's own token, so Supabase RLS still applies.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase";

const MODEL = "claude-sonnet-5-5";
const MAX_TURNS = 6;
const FEATURE = "hq-assistant";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AssistantReply = { text: string; actions: string[] };

/** Worker secrets: with nodejs_compat (compat date 2025-04+) Cloudflare copies them into process.env; Nitro also keeps them on globalThis.__env__. */
function readSecret(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  if (fromProcess) return fromProcess;
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const value = env?.[name];
  return typeof value === "string" && value ? value : undefined;
}

const TOOLS = [
  {
    name: "list_projects",
    description: "列出所有進行中的專案（id、名稱、狀態、下一步、進度%）。",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "list_open_tasks",
    description: "列出未完成的任務；可只看某個專案。",
    input_schema: { type: "object", properties: { project_id: { type: "string" } } },
  },
  {
    name: "add_task",
    description: "在某個專案新增一個任務。",
    input_schema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        title: { type: "string" },
        due_date: { type: "string", description: "YYYY-MM-DD，可省略" },
        later: { type: "boolean", description: "true = 放到「之後」" },
      },
      required: ["project_id", "title"],
    },
  },
  {
    name: "set_task_status",
    description: "改任務狀態：todo / doing / waiting / done。",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string" },
        status: { type: "string", enum: ["todo", "doing", "waiting", "done", "cancelled"] },
      },
      required: ["task_id", "status"],
    },
  },
  {
    name: "update_project",
    description: "更新專案的下一步或狀態。",
    input_schema: {
      type: "object",
      properties: {
        project_id: { type: "string" },
        next_step: { type: "string" },
        status: { type: "string", enum: ["progress", "waiting", "deadline", "almost", "done"] },
      },
      required: ["project_id"],
    },
  },
  {
    name: "add_note",
    description: "把一段 brain-dump 存進 HQ 收件匣（之後收工時處理）。",
    input_schema: {
      type: "object",
      properties: { body: { type: "string" }, project_id: { type: "string" } },
      required: ["body"],
    },
  },
  {
    name: "add_idea",
    description: "把 Sony 隨口想到的點子／之後想做的事記進「隨手記」。Sony 說「幫我記一下」「我想到一個點子」時用這個。",
    input_schema: {
      type: "object",
      properties: {
        body: { type: "string" },
        tag: {
          type: "string",
          description: "Bluluma / Sonykun / SwiftLift / SwiftSite / Night Clerk / HQ / 個人，看不出來就省略",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "find_clients",
    description: "查客戶：名稱、聯絡人、服務、帳號在哪、續約日。query 可留空列出全部。",
    input_schema: { type: "object", properties: { query: { type: "string" } } },
  },
  {
    name: "find_prices",
    description:
      "查價目表。brand: bluluma / sonykun / swiftlift / swiftsite / design。回傳零售價、Premium 價、Partner 價。",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" }, brand: { type: "string" } },
    },
  },
] as const;

type ToolInput = {
  project_id?: unknown;
  title?: unknown;
  due_date?: unknown;
  later?: unknown;
  task_id?: unknown;
  status?: unknown;
  next_step?: unknown;
  body?: unknown;
  query?: unknown;
  brand?: unknown;
  tag?: unknown;
};
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

async function runTool(
  db: SupabaseClient,
  name: string,
  input: ToolInput,
  actions: string[],
): Promise<unknown> {
  switch (name) {
    case "list_projects": {
      const { data, error } = await db
        .from("pcc_projects")
        .select("id,name,brand,status,next_step,pct")
        .eq("archived", false)
        .order("sort");
      if (error) throw new Error(error.message);
      return data;
    }
    case "list_open_tasks": {
      let q = db
        .from("pcc_tasks")
        .select("id,project_id,title,status,grp,due_date")
        .not("status", "in", "(done,cancelled)")
        .order("sort")
        .limit(80);
      if (str(input.project_id)) q = q.eq("project_id", str(input.project_id));
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data;
    }
    case "add_task": {
      const projectId = str(input.project_id);
      const title = str(input.title);
      if (!projectId || !title) throw new Error("需要 project_id 和 title");
      const row = {
        id: crypto.randomUUID(),
        project_id: projectId,
        title,
        grp: input.later ? "later" : "next",
        status: "todo",
        due_date: str(input.due_date) || null,
        sort: Date.now() % 1_000_000,
      };
      const { error } = await db.from("pcc_tasks").insert(row);
      if (error) throw new Error(error.message);
      actions.push(`新增任務：${title}`);
      return { ok: true, id: row.id };
    }
    case "set_task_status": {
      const status = str(input.status);
      const patch: Record<string, unknown> = {
        status,
        done: status === "done" || status === "cancelled",
        done_at: status === "done" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await db
        .from("pcc_tasks")
        .update(patch)
        .eq("id", str(input.task_id))
        .select("title")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("找不到這個任務");
      actions.push(`任務「${(data as { title: string }).title}」→ ${status}`);
      return { ok: true };
    }
    case "update_project": {
      const patch: { updated_at: string; next_step?: string; status?: string } = {
        updated_at: new Date().toISOString(),
      };
      if (str(input.next_step)) patch.next_step = str(input.next_step);
      if (str(input.status)) patch.status = str(input.status);
      const { data, error } = await db
        .from("pcc_projects")
        .update(patch)
        .eq("id", str(input.project_id))
        .select("name")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("找不到這個專案");
      actions.push(`更新專案：${(data as { name: string }).name}`);
      return { ok: true };
    }
    case "add_note": {
      const body = str(input.body);
      if (!body) throw new Error("內容是空的");
      const { error } = await db
        .from("pcc_notes")
        .insert({ id: crypto.randomUUID(), body, project_id: str(input.project_id) || null });
      if (error) throw new Error(error.message);
      actions.push("存進收件匣");
      return { ok: true };
    }
    case "add_idea": {
      const body = str(input.body);
      if (!body) throw new Error("內容是空的");
      const { error } = await db
        .from("pcc_ideas")
        .insert({ body, tag: str(input.tag) || null });
      if (error) throw new Error(error.message);
      actions.push("記進隨手記");
      return { ok: true };
    }
    case "find_clients": {
      const { data, error } = await db
        .from("pcc_clients")
        .select("name,contact_name,phone,email,website,brand,services,accounts,renewals,notes")
        .order("sort")
        .limit(60);
      if (error) throw new Error(error.message);
      const q = str(input.query).toLowerCase();
      return (data ?? []).filter((c) => !q || JSON.stringify(c).toLowerCase().includes(q));
    }
    case "find_prices": {
      let query = db
        .from("pcc_prices")
        .select("brand,category,service,included,price,price_premium,partner_price,billing,note")
        .order("sort");
      if (str(input.brand)) query = query.eq("brand", str(input.brand).toLowerCase());
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      const q = str(input.query).toLowerCase();
      return (data ?? [])
        .filter(
          (p) => !q || `${p.service} ${p.category} ${p.included ?? ""}`.toLowerCase().includes(q),
        )
        .slice(0, 40);
    }
    default:
      throw new Error(`未知工具：${name}`);
  }
}

function systemPrompt(today: string) {
  return [
    "你是 Bluluma HQ 助理，幫 Sony（Bluluma Design / Sonykun Design / SwiftLift / SwiftSite 的老闆）管理 HQ 裡的專案、任務、客戶和價目表。",
    `今天是 ${today}（溫哥華時間）。`,
    "一律用繁體中文書面語回答，可以夾英文技術名詞，不用廣東話口語。回答簡短直接，一次一個建議。",
    "要改資料前先用 list_projects / list_open_tasks 找到正確的 id，不要猜 id。",
    "使用者要刪除東西時，你沒有刪除工具：請他到頁面上自己刪。",
    "你只能動 HQ 的資料。改網站 code、寄 email、操作瀏覽器這些事，請他回 Claude app 做。",
  ].join("\n");
}

type ContentBlock =
  { type: "text"; text: string } | { type: "tool_use"; id: string; name: string; input: ToolInput };

export async function runAssistant(
  token: string,
  messages: ChatMessage[],
): Promise<AssistantReply> {
  const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: who, error: authError } = await db.auth.getUser(token);
  if (authError || who.user?.email !== "sony@bluluma.com") {
    throw new Response("Unauthorized", { status: 401 });
  }

  const apiKey = readSecret("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return {
      text: "HQ 助理還沒接上：Cloudflare 的 Worker 還沒設定 ANTHROPIC_API_KEY。",
      actions: [],
    };
  }

  // AI 成本帳: monthly budget check before, one usage row after (pcc_ai_usage, feature 'hq-assistant').
  const { data: budgetOk } = await db.rpc("pcc_ai_budget_ok", { p_feature: FEATURE });
  if (budgetOk === false) {
    return { text: "本月 HQ 助理的 AI 預算已用完（財務 → AI 成本可以調整上限）。", actions: [] };
  }
  const usage = { input: 0, cached: 0, output: 0 };
  const lastUser = messages[messages.length - 1]?.content ?? "";
  let failed: string | null = null;
  try {
    return await runLoop(db, apiKey, messages, usage, (e) => (failed = e));
  } finally {
    if (usage.input + usage.output > 0 || failed) {
      await db.rpc("pcc_log_ai_usage", {
        p_provider: "anthropic",
        p_model: MODEL,
        p_feature: FEATURE,
        p_kind: "text",
        p_input_tokens: usage.input,
        p_cached_input_tokens: usage.cached,
        p_output_tokens: usage.output,
        p_summary: `HQ 助理：${lastUser.slice(0, 100)}`,
        p_status: failed ? "error" : "ok",
        p_error: failed,
      });
    }
  }
}

type Usage = { input: number; cached: number; output: number };

async function runLoop(
  db: SupabaseClient,
  apiKey: string,
  messages: ChatMessage[],
  usage: Usage,
  onError: (e: string) => void,
): Promise<AssistantReply> {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver" }).format(
    new Date(),
  );
  const convo: { role: string; content: unknown }[] = messages
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));
  const actions: string[] = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: systemPrompt(today),
        tools: TOOLS,
        messages: convo,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("anthropic error", res.status, detail);
      onError(`${res.status} ${detail.slice(0, 200)}`);
      return { text: `HQ 助理暫時連不上（${res.status}）。`, actions };
    }
    const body = (await res.json()) as {
      content: ContentBlock[];
      stop_reason: string;
      usage?: {
        input_tokens?: number;
        output_tokens?: number;
        cache_read_input_tokens?: number;
        cache_creation_input_tokens?: number;
      };
    };
    usage.input += (body.usage?.input_tokens ?? 0) + (body.usage?.cache_creation_input_tokens ?? 0);
    usage.cached += body.usage?.cache_read_input_tokens ?? 0;
    usage.output += body.usage?.output_tokens ?? 0;
    convo.push({ role: "assistant", content: body.content });
    const uses = body.content.filter(
      (b): b is Extract<ContentBlock, { type: "tool_use" }> => b.type === "tool_use",
    );
    if (body.stop_reason !== "tool_use" || uses.length === 0) {
      const text = body.content
        .filter((b): b is Extract<ContentBlock, { type: "text" }> => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { text: text || "好了。", actions };
    }
    const results = [];
    for (const use of uses) {
      try {
        const out = await runTool(db, use.name, use.input ?? {}, actions);
        results.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: JSON.stringify(out).slice(0, 20_000),
        });
      } catch (e) {
        results.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: `錯誤：${e instanceof Error ? e.message : String(e)}`,
          is_error: true,
        });
      }
    }
    convo.push({ role: "user", content: results });
  }
  return { text: "這件事步驟太多，我先做到這裡。", actions };
}

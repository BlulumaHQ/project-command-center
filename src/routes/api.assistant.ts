import { createFileRoute } from "@tanstack/react-router";
import { runAssistant, type ChatMessage } from "@/lib/assistant-server";

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });
        let messages: ChatMessage[] = [];
        try {
          const body = (await request.json()) as { messages?: unknown };
          messages = (Array.isArray(body.messages) ? body.messages : [])
            .filter(
              (m): m is ChatMessage =>
                !!m &&
                typeof m === "object" &&
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string",
            )
            .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        if (messages.length === 0 || messages[messages.length - 1]?.role !== "user")
          return new Response("Bad request", { status: 400 });
        try {
          return Response.json(await runAssistant(token, messages));
        } catch (e) {
          if (e instanceof Response) return e;
          console.error(e);
          return Response.json(
            { text: "HQ 助理出錯了，請再試一次。", actions: [] },
            { status: 500 },
          );
        }
      },
    },
  },
});

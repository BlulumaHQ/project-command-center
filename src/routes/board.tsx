import { createFileRoute } from "@tanstack/react-router";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { requireSignedIn } from "@/lib/auth";
import { DIRECTORS, meetingPrompt } from "@/lib/board";
import { BoardRoom } from "@/components/BoardRoom";
import { RobotAvatar } from "@/components/RobotAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/board")({
  ssr: false,
  beforeLoad: requireSignedIn,
  head: () => ({
    meta: [
      { title: "董事會 · Bluluma HQ" },
      { name: "description", content: "Bluluma 董事會：多位名人視角一起討論你的決策。" },
      { property: "og:title", content: "董事會 · Bluluma HQ" },
    ],
  }),
  component: BoardPage,
});

function BoardPage() {
  const [topic, setTopic] = useState("");
  const [picked, setPicked] = useState<string[]>([]); // empty = everyone
  const isOn = (id: string) => picked.length === 0 || picked.includes(id);
  const toggle = (id: string) => {
    setPicked((cur) => {
      const base = cur.length === 0 ? DIRECTORS.map((d) => d.id) : cur;
      const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
      if (next.length === 0) return cur; // keep at least one director
      return next.length === DIRECTORS.length ? [] : next;
    });
  };
  const seated = picked.length === 0 ? DIRECTORS.length : picked.length;
  const prompt = meetingPrompt(topic, picked);
  const open = () =>
    window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`, "_blank", "noopener");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("已複製，貼到 Claude 就開會");
    } catch {
      toast.error("複製失敗");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">董事會</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {seated} 位董事出席 · 點機器人可以請他離席或回來
        </p>
      </div>

      <BoardRoom directors={DIRECTORS} picked={picked} onToggle={toggle} />

      <section className="panel space-y-3 p-4 sm:p-5">
        <label htmlFor="board-topic" className="block font-semibold">
          今天要討論什麼？
        </label>
        <Textarea
          id="board-topic"
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：SwiftSite 要不要從 $99 漲到 $149？"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button className="h-11" disabled={!topic.trim()} onClick={open}>
            <ExternalLink className="h-4 w-4" />
            開董事會（Claude）
          </Button>
          <Button
            variant="outline"
            className="h-11"
            disabled={!topic.trim()}
            onClick={() => void copy()}
          >
            <Copy className="h-4 w-4" />
            複製開會指令
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          目前會在 Claude 開會；之後會直接在這個視窗跟董事對話。
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DIRECTORS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => toggle(d.id)}
            aria-pressed={isOn(d.id)}
            className={cn(
              "panel flex flex-col p-4 text-left transition-opacity sm:p-5",
              !isOn(d.id) && "opacity-45",
            )}
          >
            <div className="flex items-start gap-3">
              <RobotAvatar id={d.id} size={56} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{d.name}</h3>
                <p className="text-sm font-medium" style={{ color: d.color }}>
                  {d.focus}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  isOn(d.id)
                    ? "bg-st-almost-bg text-st-almost-fg"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isOn(d.id) ? "出席" : "離席"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.lens}</p>
            <p className="mt-2 text-sm">必問：{d.asks}</p>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        董事觀點是根據公開資料模擬的思考框架，不是本人。
      </p>
    </div>
  );
}

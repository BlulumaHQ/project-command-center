import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AgentRow, DepartmentRow } from "@/data/store";
import { robotArt } from "@/components/RobotAvatar";

/**
 * A small animated office where each AI agent works at a desk.
 * Animation mirrors real status: ok = typing / walking, check = "?", broken = smoke + "!",
 * idle = asleep, finished work in the last 30 min = sparkle.
 * Healthy agents rotate through small "office life" actions (coffee, whiteboard, stretch,
 * chat, phone, thinking, celebrating) so the room feels alive.
 */

type Action = "work" | "coffee" | "board" | "stretch" | "chat" | "phone" | "think" | "celebrate";
const ACTION_MS: Record<Action, number> = {
  work: 0, coffee: 10000, board: 10000, stretch: 4000, chat: 5000, phone: 6000, think: 5000, celebrate: 3000,
};
interface ActState { action: Action; until: number; key: number }

const BODY: Record<string, string> = {
  atlas: "#1E3A8A", memo: "#14B8A6", rocket: "#F97316", checky: "#22C55E",
  pixel: "#8B5CF6", guido: "#3B82F6", mia: "#EC4899", scout: "#D97706",
  bolt: "#EAB308", compass: "#4F46E5",
  blueprint: "#2F5FAF", sentinel: "#1E3A8A", justice: "#57534E", echo: "#C2410C",
  deal: "#1F2937", sunny: "#F59E0B", ally: "#BE8A5C", ledger: "#065F46",
  mirror: "#A855F7", duel: "#DC2626", dash: "#E11D48", chase: "#0EA5E9",
};


// Office plan (viewBox units). The general manager's glass office on the left; pre-launch departments
// in the back row, post-launch in the front row, one partitioned room per department. Every agent row
// in pcc_agents gets its own desk inside its department's room, so a new skill / department added in
// Supabase shows up here automatically.
const W = 1100;
const H = 404;
const HQ_ROOM = { x: 14, y: 46, w: 178, h: 342 };
const ROOM_X0 = 204;
const ROOM_W = 172;
const ROOM_GAP = 4;
const BACK_ROW = { y: 46, h: 156 };
const FRONT_ROW = { y: 232, h: 156 };
const BOT_SCALE = 0.74;
const MAX_IN_ROOM = 4;

const CSS = `
.hqo text{font-family:inherit}
.hqo-type{animation:hqo-type .45s ease-in-out infinite alternate}
@keyframes hqo-type{to{transform:translateY(-1.6px)}}
.hqo-walk{animation:hqo-walk 16s ease-in-out infinite}
@keyframes hqo-walk{0%,30%{transform:translateX(0)}42%,58%{transform:translateX(var(--dx))}70%,100%{transform:translateX(0)}}
.hqo-sweat{animation:hqo-sweat 3.2s ease-in infinite;opacity:0}
@keyframes hqo-sweat{0%,55%{opacity:0;transform:translateY(0)}62%{opacity:1}100%{opacity:0;transform:translateY(9px)}}
.hqo-bob{animation:hqo-bob 1.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
@keyframes hqo-bob{to{transform:translateY(-3px) scale(1.06)}}
.hqo-smoke{animation:hqo-smoke 2.4s ease-out infinite;opacity:0}
@keyframes hqo-smoke{0%{opacity:.7;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(4px,-22px) scale(1.4)}}
.hqo-z{animation:hqo-z 3s ease-in-out infinite;opacity:0}
@keyframes hqo-z{0%{opacity:0;transform:translate(0,0)}30%{opacity:1}100%{opacity:0;transform:translate(10px,-18px)}}
.hqo-sleep{animation:hqo-sleep 3s ease-in-out infinite alternate}
@keyframes hqo-sleep{from{transform:translateY(14px) rotate(-10deg)}to{transform:translateY(18px) rotate(-10deg)}}
.hqo-spark{animation:hqo-spark 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes hqo-spark{0%,100%{opacity:.2;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.15) rotate(45deg)}}
.hqo-steam{animation:hqo-smoke 2.8s ease-out infinite}
.hqo-screen{animation:hqo-screen 2.2s steps(2) infinite}
@keyframes hqo-screen{50%{opacity:.55}}
.hqo-go{animation:hqo-go 10s ease-in-out forwards}
@keyframes hqo-go{0%{transform:translateX(0)}25%,75%{transform:translateX(var(--dx))}100%{transform:translateX(0)}}
.hqo-step{animation:hqo-step .32s ease-in-out infinite alternate}
@keyframes hqo-step{to{transform:translateY(-1.5px)}}
.hqo-arm{transform-box:fill-box;transform-origin:50% 8%;transition:transform .5s ease}
.hqo-cup{animation:hqo-cup 10s ease-in-out forwards;opacity:0}
@keyframes hqo-cup{0%,27%{opacity:0}32%,70%{opacity:1}74%,100%{opacity:0}}
.hqo-sip{animation:hqo-sip 10s ease-in-out forwards}
@keyframes hqo-sip{0%,30%{transform:rotate(0)}38%,48%{transform:rotate(-150deg)}54%,62%{transform:rotate(-110deg)}70%,100%{transform:rotate(0)}}
.hqo-draw{animation:hqo-draw 10s ease-in-out forwards}
@keyframes hqo-draw{0%,28%{transform:rotate(0)}32%{transform:rotate(-150deg)}38%{transform:rotate(-120deg)}44%{transform:rotate(-155deg)}50%{transform:rotate(-115deg)}56%{transform:rotate(-150deg)}62%{transform:rotate(-120deg)}70%,100%{transform:rotate(0)}}
.hqo-stretch{animation:hqo-stretch 4s ease-in-out forwards}
@keyframes hqo-stretch{0%{transform:translateY(0)}20%,75%{transform:translateY(-5px)}100%{transform:translateY(0)}}
.hqo-arms-up-l{animation:hqo-up-l 4s ease-in-out forwards}
.hqo-arms-up-r{animation:hqo-up-r 4s ease-in-out forwards}
@keyframes hqo-up-l{0%{transform:rotate(0)}22%,72%{transform:rotate(165deg)}45%{transform:rotate(150deg)}100%{transform:rotate(0)}}
@keyframes hqo-up-r{0%{transform:rotate(0)}22%,72%{transform:rotate(-165deg)}45%{transform:rotate(-150deg)}100%{transform:rotate(0)}}
.hqo-dots circle{animation:hqo-dot 1.2s ease-in-out infinite}
@keyframes hqo-dot{0%,100%{opacity:.25}50%{opacity:1}}
.hqo-pop{animation:hqo-pop .35s ease-out both;transform-box:fill-box;transform-origin:0% 100%}
@keyframes hqo-pop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}
.hqo-nod{animation:hqo-nod 1.6s ease-in-out infinite alternate}
@keyframes hqo-nod{to{transform:translateY(-1.5px)}}
.hqo-look{transform:translateY(2px)}
.hqo-glow{animation:hqo-screen 1.4s steps(2) infinite}
.hqo-blink{animation:hqo-blink .6s steps(2) infinite}
@keyframes hqo-blink{50%{opacity:.15}}
.hqo-jump{animation:hqo-jump .75s cubic-bezier(.3,0,.4,1) 4}
@keyframes hqo-jump{0%,100%{transform:translateY(0)}45%{transform:translateY(-10px)}}
.hqo-burst{animation:hqo-burst 1.5s ease-out 2;opacity:0}
@keyframes hqo-burst{0%{opacity:0;transform:translate(0,0) scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(var(--bx),var(--by)) scale(1.1)}}
.hqo-wave{animation:hqo-wave .8s ease-in-out infinite alternate}
@keyframes hqo-wave{from{transform:rotate(-30deg)}to{transform:rotate(-60deg)}}
.hqo-agent{cursor:pointer}
.hqo-agent:hover .hqo-head{filter:brightness(1.08)}
`;


function Bubble({ status, recent }: { status: AgentRow["status"]; recent: boolean }) {
  if (status === "check") {
    return (
      <g className="hqo-bob" transform="translate(14,-30)">
        <circle r={8} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={1.4} />
        <text textAnchor="middle" y={4} fontSize={11} fontWeight={700} fill="#B45309">?</text>
      </g>
    );
  }
  if (status === "broken") {
    return (
      <g transform="translate(14,-30)">
        <g className="hqo-bob">
          <circle r={8} fill="#FEE2E2" stroke="#EF4444" strokeWidth={1.4} />
          <text textAnchor="middle" y={4} fontSize={11} fontWeight={700} fill="#B91C1C">!</text>
        </g>
      </g>
    );
  }
  if (status === "idle") {
    return (
      <g transform="translate(10,-20)" fill="#64748B" fontWeight={700}>
        <text className="hqo-z" fontSize={9}>z</text>
        <text className="hqo-z" fontSize={11} style={{ animationDelay: "1s" }}>z</text>
        <text className="hqo-z" fontSize={13} style={{ animationDelay: "2s" }}>Z</text>
      </g>
    );
  }
  if (recent) {
    return (
      <g transform="translate(15,-24)">
        <polygon className="hqo-spark" points="0,-6 1.6,-1.6 6,0 1.6,1.6 0,6 -1.6,1.6 -6,0 -1.6,-1.6" fill="#FACC15" />
      </g>
    );
  }
  return null;
}

const STAR = "0,-5 1.3,-1.3 5,0 1.3,1.3 0,5 -1.3,1.3 -5,0 -1.3,-1.3";

function Arm({ side, color, cls }: { side: "l" | "r"; color: string; cls?: string | undefined }) {
  const x = side === "l" ? -17 : 13;
  return (
    <g className={`hqo-arm${cls ? ` ${cls}` : ""}`}>
      <rect x={x} y={16} width={4} height={11} rx={2} fill={color} />
      <circle cx={x + 2} cy={27.5} r={2.6} fill="#94A3B8" />
    </g>
  );
}

function Extras({ action, actKey }: { action: Action; actKey: number }) {
  if (action === "chat") {
    return (
      <g key={actKey} className="hqo-pop" transform="translate(12,-30)">
        <rect x={0} y={0} width={24} height={13} rx={6} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.2} />
        <path d="M4,12 l-3,5 l7,-5z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.2} strokeLinejoin="round" />
        <g className="hqo-dots" fill="#64748B">
          <circle cx={7} cy={6.5} r={1.7} />
          <circle cx={12} cy={6.5} r={1.7} style={{ animationDelay: ".2s" }} />
          <circle cx={17} cy={6.5} r={1.7} style={{ animationDelay: ".4s" }} />
        </g>
      </g>
    );
  }
  if (action === "think") {
    return (
      <g transform="translate(0,-26)">
        <line x1={0} y1={6} x2={0} y2={0} stroke="#64748B" strokeWidth={1.5} />
        <circle className="hqo-blink" cy={-1.5} r={3} fill="#F43F5E" />
        <circle cy={-1.5} r={5.5} fill="#F43F5E" opacity={0.18} className="hqo-blink" />
      </g>
    );
  }
  if (action === "celebrate") {
    const bursts: [number, number, string][] = [[-16, -20, "#FACC15"], [0, -26, "#F472B6"], [16, -20, "#38BDF8"], [-10, -12, "#22C55E"], [12, -10, "#FB923C"]];
    return (
      <g key={actKey} transform="translate(0,-14)">
        {bursts.map(([bx, by, c], i) => (
          <polygon key={i} className="hqo-burst" points={STAR} fill={c}
            style={{ "--bx": `${bx}px`, "--by": `${by}px`, animationDelay: `${i * 0.12}s` } as CSSProperties} />
        ))}
      </g>
    );
  }
  return null;
}

function Robot({ agent, recent, action, actKey, dx, onPick }: {
  agent: AgentRow; recent: boolean; action: Action; actKey: number; dx: number; onPick: () => void;
}) {
  const color = BODY[agent.avatar] ?? "#64748B";
  const asleep = agent.status === "idle";
  const busy = agent.status === "ok";
  const act: Action = busy ? action : "work";
  const walking = act === "coffee" || act === "board";

  const leftArm = act === "stretch" ? "hqo-arms-up-l" : undefined;
  const rightArm =
    act === "stretch" ? "hqo-arms-up-r" :
    act === "coffee" ? "hqo-sip" :
    act === "board" ? "hqo-draw" :
    act === "chat" ? "hqo-wave" : undefined;

  const bodyCls =
    act === "work" && busy ? "hqo-type" :
    act === "stretch" ? "hqo-stretch" :
    act === "celebrate" ? "hqo-jump" :
    act === "think" ? "hqo-nod" :
    walking ? "hqo-step" : undefined;

  const body = (
    <g key={`${act}-${actKey}`} className={bodyCls}>
      <Arm side="l" color={color} cls={leftArm} />
      <rect x={-13} y={14} width={26} height={22} rx={8} fill={color} />
      <rect x={-6.5} y={19} width={13} height={7} rx={2} fill="#FFFFFF" opacity={0.85} />
      <g className={act === "phone" ? "hqo-look" : undefined}>
        <g transform="scale(0.36)"><g className={`hqo-head${asleep ? " hqo-sleep" : ""}`}>{robotArt(agent.avatar)}</g></g>
      </g>
      {act === "phone" ? (
        <g transform="translate(-4,15)">
          <rect width={8} height={13} rx={1.6} fill="#1E293B" />
          <rect className="hqo-glow" x={1} y={1.2} width={6} height={9.6} rx={1} fill="#7DD3FC" />
        </g>
      ) : null}
      <Arm side="r" color={color} cls={rightArm} />
      {act === "coffee" && (
        <g className="hqo-cup" transform="translate(16,8)">
          <rect x={-3} y={0} width={7} height={8} rx={1.5} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={0.8} />
          <rect x={-2} y={1.5} width={5} height={3} fill="#7C4A2D" />
          <circle className="hqo-steam" cx={0.5} cy={-3} r={1.8} fill="#CBD5E1" />
        </g>
      )}
      {busy && act === "work" && <path className="hqo-sweat" d="M-15,-6 q-2.5,4 0,5.5 q2.5,-1.5 0,-5.5z" fill="#60A5FA" />}
    </g>
  );

  return (
    <g className="hqo-agent" onClick={onPick} role="button" aria-label={`${agent.name} ${agent.name_zh}`}>
      <title>{`${agent.name} ${agent.name_zh}`}</title>
      {walking ? (
        <g key={`go-${actKey}`} className="hqo-go" style={{ "--dx": `${dx}px` } as CSSProperties}>
          {body}
          <Extras action={act} actKey={actKey} />
        </g>
      ) : (
        <>
          {body}
          <Extras action={act} actKey={actKey} />
        </>
      )}
      {agent.status === "broken" && (
        <g transform="translate(26,4)" fill="#94A3B8">
          <circle className="hqo-smoke" r={4} />
          <circle className="hqo-smoke" r={4} style={{ animationDelay: ".8s" }} />
          <circle className="hqo-smoke" r={4} style={{ animationDelay: "1.6s" }} />
        </g>
      )}
      {act !== "chat" && act !== "think" && <Bubble status={agent.status} recent={recent && act !== "celebrate"} />}
    </g>
  );
}

/** Picks the next office-life action for an agent; one robot at a time walks to a whiteboard. */
function nextAction(a: AgentRow, recent: boolean, taken: Set<Action>): Action {
  const canWalk = !a.is_manager && a.avatar !== "mia";
  const pool: [Action, number][] = [
    ["work", 4], ["stretch", 1], ["chat", 1], ["phone", 1], ["think", 1],
    ["coffee", 1], // sipped at the desk, so any number of robots can have one
    ...(canWalk && !taken.has("board") ? [["board", 1.2] as [Action, number]] : []),
    ...(recent ? [["celebrate", 1.5] as [Action, number]] : []),
  ];
  const total = pool.reduce((t, [, w]) => t + w, 0);
  let r = Math.random() * total;
  for (const [act, w] of pool) { if ((r -= w) <= 0) return act; }
  return "work";
}

/** On phones the scene is wider than the screen: start scrolled to the middle, swipe to see the rest. */
export function useCenteredScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);
  return ref;
}

function useOfficeLife(agents: AgentRow[], isRecent: (a: AgentRow) => boolean) {
  const [acts, setActs] = useState<Record<string, ActState>>({});
  const ids = agents.map((a) => `${a.id}:${a.status}`).join(",");
  useEffect(() => {
    let counter = 0;
    const tick = (first: boolean) => {
      setActs((prev) => {
        const now = Date.now();
        const next: Record<string, ActState> = {};
        const taken = new Set<Action>();
        for (const a of agents) {
          const cur = prev[a.id];
          if (a.status === "ok" && cur && cur.until > now) { next[a.id] = cur; taken.add(cur.action); }
        }
        for (const a of agents) {
          if (next[a.id] || a.status !== "ok") continue;
          // Stagger the very first round so robots don't all move in sync.
          const action = first ? "work" : nextAction(a, isRecent(a), taken);
          taken.add(action);
          const dur = action === "work" ? 3000 + Math.random() * (first ? 9000 : 7000) : ACTION_MS[action];
          next[a.id] = { action, until: now + dur, key: ++counter };
        }
        return next;
      });
    };
    tick(true);
    const t = window.setInterval(() => tick(false), 500);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);
  return acts;
}


const PHASE_THEME = {
  hq: { floor: "#EEF1F5", wall: "#9AA6B8", glass: "#D6E6F7", plate: "#383838", plateText: "#FFFFFF" },
  pre: { floor: "#E9F0FB", wall: "#8FA6CC", glass: "#DCE7F9", plate: "#1E3A8A", plateText: "#FFFFFF" },
  post: { floor: "#F6EFE3", wall: "#C2A77F", glass: "#F3ECE0", plate: "#6B4E25", plateText: "#FFFFFF" },
} as const;

interface Box { x: number; y: number; w: number; h: number }

export function deskTitle(d: DepartmentRow) {
  return d.num ? `${String(d.num).padStart(2, "0")} ${d.name_zh}` : d.name_zh;
}

/** Partitioned room: back wall with the department's name plate, glass side partitions, a front wall with a door gap. */
function Room({ box, dept, extra }: { box: Box; dept: DepartmentRow; extra: number }) {
  const t = PHASE_THEME[dept.phase];
  const { x, y, w, h } = box;
  const door = 44;
  const half = (w - door) / 2;
  const title = deskTitle(dept);
  const plateW = Math.min(w - 20, 18 + title.length * 11);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={t.floor} />
      {/* carpet tile pattern */}
      {Array.from({ length: Math.floor(w / 43) }, (_, i) => (
        <rect key={i} x={x + 6 + i * 43} y={y + 12} width={1} height={h - 18} fill="#FFFFFF" opacity={0.5} />
      ))}
      {/* back wall + whiteboard + clock */}
      <rect x={x} y={y} width={w} height={10} rx={3} fill={t.wall} />
      <rect x={x + w - 44} y={y + 14} width={34} height={20} rx={2} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.2} />
      <path d={`M${x + w - 39},${y + 21} h14 M${x + w - 39},${y + 26} h20 M${x + w - 39},${y + 30} h9`} stroke="#94A3B8" strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={x + 16} cy={y + 22} r={6} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1.2} />
      <path d={`M${x + 16},${y + 22} v-3.5 M${x + 16},${y + 22} h2.6`} stroke="#334155" strokeWidth={1.1} strokeLinecap="round" />
      {/* side partitions: solid base, glass top */}
      {[x, x + w - 5].map((px) => (
        <g key={px}>
          <rect x={px} y={y + 6} width={5} height={h - 6} rx={2} fill={t.glass} opacity={0.9} />
          <rect x={px} y={y + h * 0.55} width={5} height={h * 0.45} rx={2} fill={t.wall} />
        </g>
      ))}
      {/* front wall with door gap */}
      <rect x={x} y={y + h - 6} width={half} height={6} rx={2} fill={t.wall} />
      <rect x={x + half + door} y={y + h - 6} width={half} height={6} rx={2} fill={t.wall} />
      {/* name plate */}
      <rect x={x + (w - plateW) / 2} y={y - 9} width={plateW} height={18} rx={9} fill={t.plate} />
      <text x={x + w / 2} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.plateText}>{title}</text>
      {extra > 0 && (
        <g transform={`translate(${x + w - 26},${y + h - 22})`}>
          <rect width={20} height={14} rx={7} fill="#334155" />
          <text x={10} y={10.5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#FFFFFF">+{extra}</text>
        </g>
      )}
    </g>
  );
}

/** One desk per robot, drawn in the robot's local (unscaled) coordinates: nameplate shows the bot's fun name. */
function MiniDesk({ agent, screen }: { agent: AgentRow; screen: string }) {
  return (
    <g>
      <rect x={-34} y={25} width={68} height={6} rx={2.5} fill="#C8A27A" />
      <rect x={-31} y={31} width={62} height={22} rx={3} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} />
      <text x={0} y={41} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1F2937">{agent.name}</text>
      <text x={0} y={50.5} textAnchor="middle" fontSize={8} fill="#64748B">{agent.name_zh}</text>
      <g transform="translate(13,9)">
        <rect width={18} height={13} rx={2} fill="#334155" />
        <rect className="hqo-screen" x={2} y={2} width={14} height={9} rx={1} fill={screen} />
        <rect x={7} y={13} width={4} height={3} fill="#475569" />
      </g>
      <g transform="translate(-28,17)">
        <rect width={6} height={8} rx={1.5} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={0.8} />
        <rect x={1} y={1.8} width={4} height={3.4} fill="#7C4A2D" />
      </g>
    </g>
  );
}

/** Empty department: a desk waiting for its first robot. */
function EmptyDesk({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-30} y={18} width={60} height={6} rx={2.5} fill="#C8A27A" />
      <rect x={-27} y={24} width={54} height={16} rx={3} fill="#FFFFFF" stroke="#E2E8F0" />
      <text x={0} y={35.5} textAnchor="middle" fontSize={9} fill="#94A3B8">籌備中</text>
      <g transform="translate(-14,0)">
        <rect width={26} height={18} rx={2} fill="#D6B48A" />
        <path d="M0,6 H26 M13,0 V6" stroke="#B08D5B" strokeWidth={1.2} />
      </g>
      <polygon points="20,18 25,4 30,18" fill="#F97316" />
      <rect x={21.5} y={10} width={7} height={2.5} fill="#FFFFFF" />
    </g>
  );
}

/** Seats for n robots inside a room (head centres). */
function seats(box: Box, n: number, manager: boolean): { x: number; y: number; scale: number }[] {
  const { x, y, w, h } = box;
  const s = BOT_SCALE;
  if (manager) {
    // GM's office: the manager at a big desk on top, the rest in two columns below.
    const rest = Math.max(0, n - 1);
    const out = [{ x: x + w / 2, y: y + 62, scale: 0.95 }];
    for (let i = 0; i < rest; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      out.push({ x: x + (rest === 1 ? w / 2 : col === 0 ? w * 0.29 : w * 0.71), y: y + 168 + row * 92, scale: s });
    }
    return out;
  }
  const colX = [x + w * 0.29, x + w * 0.71];
  const rowY = [y + 42, y + 110];
  if (n <= 1) return [{ x: x + w / 2, y: y + 74, scale: s }];
  if (n === 2) return colX.map((cx) => ({ x: cx, y: y + 74, scale: s }));
  if (n === 3) return [{ x: colX[0]!, y: rowY[0]!, scale: s }, { x: colX[1]!, y: rowY[0]!, scale: s }, { x: x + w / 2, y: rowY[1]!, scale: s }];
  return [0, 1, 2, 3].map((i) => ({ x: colX[i % 2]!, y: rowY[Math.floor(i / 2)]!, scale: s }));
}

interface Seat { agent: AgentRow; x: number; y: number; scale: number; boardX: number }

/**
 * The whole office: one room per department, one desk per AI employee. Animation mirrors real status:
 * ok = working (typing, coffee, whiteboard, chatting…), check = "?", broken = smoke + "!", idle = asleep,
 * finished work in the last 30 minutes = sparkle / celebration. Tap a robot to jump to its card.
 */
export function AgentOffice({ departments, agents, lastRunOf }: {
  departments: DepartmentRow[]; agents: AgentRow[]; lastRunOf: (a: AgentRow) => number;
}) {
  const hq = departments.find((d) => d.phase === "hq");
  const pre = departments.filter((d) => d.phase === "pre");
  const post = departments.filter((d) => d.phase === "post");
  const roomBox = (i: number, row: { y: number; h: number }): Box => ({ x: ROOM_X0 + i * (ROOM_W + ROOM_GAP), y: row.y, w: ROOM_W, h: row.h });
  const rooms: { dept: DepartmentRow; box: Box; manager: boolean }[] = [
    ...(hq ? [{ dept: hq, box: HQ_ROOM, manager: true }] : []),
    ...pre.slice(0, 5).map((d, i) => ({ dept: d, box: roomBox(i, BACK_ROW), manager: false })),
    ...post.slice(0, 5).map((d, i) => ({ dept: d, box: roomBox(i, FRONT_ROW), manager: false })),
  ];
  const byRoom = rooms.map((r) => {
    const members = agents
      .filter((a) => a.department_id === r.dept.id)
      .sort((a, b) => Number(b.is_manager) - Number(a.is_manager) || a.sort - b.sort);
    const shown = members.slice(0, r.manager ? 5 : MAX_IN_ROOM);
    const places = seats(r.box, shown.length, r.manager);
    const seated: Seat[] = shown.map((a, i) => ({ agent: a, ...places[i]!, boardX: r.box.x + r.box.w - 27 }));
    return { ...r, seated, extra: members.length - shown.length };
  });
  const seated = byRoom.flatMap((r) => r.seated);
  const now = Date.now();
  const recentOf = new Map(seated.map((s) => [s.agent.id, now - lastRunOf(s.agent) < 30 * 60 * 1000]));
  const isRecent = (a: AgentRow) => recentOf.get(a.id) ?? false;
  const acts = useOfficeLife(seated.map((s) => s.agent), isRecent);
  const scroller = useCenteredScroll();
  if (rooms.length === 0) return null;
  const pick = (id: string) => document.getElementById(`agent-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  const screen = (a: AgentRow) => a.status === "broken" ? "#FCA5A5" : a.status === "idle" ? "#1E293B" : "#7DD3FC";
  const aisleY = BACK_ROW.y + BACK_ROW.h;
  const aisleH = FRONT_ROW.y - aisleY;

  return (
    <section className="panel overflow-hidden p-0" aria-label="AI 團隊辦公室動畫">
      <style>{CSS}</style>
      <div ref={scroller} className="overflow-x-auto overscroll-x-contain">
      <svg className="hqo block h-auto w-full min-w-[900px]" viewBox={`0 0 ${W} ${H}`} role="img">
        <title>AI 團隊辦公室</title>
        <rect width={W} height={H} fill="#F4F1EA" />
        {/* top wall with windows */}
        <rect width={W} height={30} fill="#E3E9F1" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i} transform={`translate(${30 + i * 98},4)`}>
            <rect width={70} height={20} rx={2} fill="#BFDBFE" stroke="#94A3B8" strokeWidth={1.2} />
            <path d={`M4,20 V${12 - (i % 3) * 2} h8 V${8 + (i % 2) * 3} h8 V20 M34,20 V${10 + (i % 3)} h10 V20 M52,20 V${7 + (i % 2) * 4} h12 V20`} fill="#93C5FD" />
            <rect x={34.5} width={1.5} height={20} fill="#94A3B8" />
          </g>
        ))}
        {/* aisle: pantry, water cooler, plants, a printer */}
        <g transform={`translate(${ROOM_X0 + 10},${aisleY + 4})`}>
          <rect width={40} height={aisleH - 10} rx={3} fill="#475569" />
          <rect x={6} y={5} width={14} height={7} rx={1.5} fill="#1E293B" />
          <circle cx={30} cy={9} r={3} fill="#F59E0B" />
          <circle className="hqo-steam" cx={30} cy={1} r={2.5} fill="#CBD5E1" />
          <text x={48} y={aisleH / 2} fontSize={9} fill="#8A6A3E">茶水間</text>
        </g>
        {[420, 640, 860].map((px, i) => (
          <g key={px} transform={`translate(${px},${aisleY + aisleH / 2})`}>
            <rect x={-7} y={0} width={14} height={11} rx={2} fill="#B45309" />
            <ellipse cx={-4} cy={-4} rx={5} ry={9} fill={i % 2 ? "#16A34A" : "#22C55E"} transform="rotate(-20 -4 -4)" />
            <ellipse cx={4} cy={-5} rx={5} ry={9} fill="#16A34A" transform="rotate(18 4 -5)" />
          </g>
        ))}
        <g transform={`translate(${ROOM_X0 + 3 * (ROOM_W + ROOM_GAP) + 70},${aisleY + 6})`}>
          <rect width={16} height={aisleH - 12} rx={3} fill="#E0F2FE" stroke="#7DD3FC" />
          <rect x={3} y={3} width={10} height={8} rx={2} fill="#38BDF8" opacity={0.7} />
        </g>
        <g transform={`translate(${W - 74},${aisleY + 7})`}>
          <rect width={40} height={aisleH - 14} rx={3} fill="#CBD5E1" />
          <rect x={6} y={3} width={28} height={5} rx={1} fill="#FFFFFF" />
          <text x={-4} y={aisleH / 2 - 2} textAnchor="end" fontSize={9} fill="#64748B">印表機</text>
        </g>

        {byRoom.map((r) => (
          <g key={r.dept.id}>
            <Room box={r.box} dept={r.dept} extra={r.extra} />
            {r.seated.length === 0 && <EmptyDesk x={r.box.x + r.box.w / 2} y={r.box.y + 62} />}
            {r.manager && (
              // meeting table + sofa in the GM's office
              <g transform={`translate(${r.box.x + r.box.w / 2},${r.box.y + r.box.h - 52})`}>
                <rect x={-46} y={14} width={92} height={18} rx={9} fill="#94A3B8" />
                <rect x={-42} y={8} width={84} height={12} rx={6} fill="#CBD5E1" />
                <ellipse cx={0} cy={-8} rx={30} ry={10} fill="#C8A27A" />
                <rect x={-3} y={-8} width={6} height={14} fill="#9C7552" />
                <rect x={-8} y={-16} width={7} height={6} rx={1.5} fill="#FFFFFF" />
                <rect x={6} y={-15} width={10} height={4} rx={1} fill="#FDE68A" />
              </g>
            )}
            {[...r.seated].sort((a, b) => a.y - b.y).map((s) => {
              const st = acts[s.agent.id];
              const action = st?.action ?? "work";
              const dx = action === "board" ? (s.boardX - s.x) / s.scale : 0;
              return (
                <g key={s.agent.id} transform={`translate(${s.x},${s.y}) scale(${s.scale})`}>
                  <Robot agent={s.agent} recent={isRecent(s.agent)} action={action} actKey={st?.key ?? 0} dx={dx} onPick={() => pick(s.agent.id)} />
                  <MiniDesk agent={s.agent} screen={screen(s.agent)} />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      </div>
    </section>
  );
}

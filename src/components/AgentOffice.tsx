import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AgentRow } from "@/data/store";
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
};

// Desk anchors (head centre). Back row sits higher, front row lower.
const BACK = [130, 255, 545, 670];
const FRONT = [210, 400, 590];
const BACK_Y = 118;
const FRONT_Y = 196;
const COFFEE_X = 62;
const BOARD_X = 625;

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

function Desk({ x, y, big = false, screenColor }: { x: number; y: number; big?: boolean; screenColor: string }) {
  const w = big ? 96 : 76;
  return (
    <g>
      <rect x={x - w / 2} y={y + 28} width={w} height={8} rx={3} fill="#C8A27A" />
      <rect x={x - w / 2 + 4} y={y + 36} width={w - 8} height={14} fill="#B38A62" />
      <rect x={x - w / 2 + 6} y={y + 36} width={4} height={18} fill="#9C7552" />
      <rect x={x + w / 2 - 10} y={y + 36} width={4} height={18} fill="#9C7552" />
      <g transform={`translate(${x + w / 2 - 26},${y + 10})`}>
        <rect x={0} y={0} width={20} height={15} rx={2} fill="#334155" />
        <rect className="hqo-screen" x={2} y={2} width={16} height={11} rx={1} fill={screenColor} />
        <rect x={8} y={15} width={4} height={4} fill="#475569" />
      </g>
      <rect x={x - 6} y={y + 25} width={18} height={4} rx={1} fill="#E2E8F0" />
      <g transform={`translate(${x - w / 2 + 10},${y + 19})`}>
        <rect width={7} height={9} rx={1.5} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={0.8} />
        <rect x={1.2} y={2} width={4.6} height={4} fill="#7C4A2D" />
      </g>
    </g>
  );
}

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

/** Picks the next office-life action for an agent; coffee machine and whiteboard fit one robot at a time. */
function nextAction(a: AgentRow, recent: boolean, taken: Set<Action>): Action {
  const canWalk = !a.is_manager && a.avatar !== "mia";
  const pool: [Action, number][] = [
    ["work", 4], ["stretch", 1], ["chat", 1], ["phone", 1], ["think", 1],
    ...(canWalk && !taken.has("coffee") ? [["coffee", 1.2] as [Action, number]] : []),
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

export function AgentOffice({ agents, lastRunOf }: { agents: AgentRow[]; lastRunOf: (a: AgentRow) => number }) {
  const manager = agents.find((a) => a.is_manager);
  const crew = agents.filter((a) => !a.is_manager);
  const slots = [...BACK.map((x) => ({ x, y: BACK_Y })), ...FRONT.map((x) => ({ x, y: FRONT_Y }))];
  const placed = crew.slice(0, slots.length).map((a, i) => ({ a, ...slots[i]! }));
  if (manager) placed.unshift({ a: manager, x: 400, y: BACK_Y });
  const now = Date.now();
  const isRecent = (a: AgentRow) => now - lastRunOf(a) < 30 * 60 * 1000;
  const acts = useOfficeLife(agents, isRecent);
  const scroller = useCenteredScroll();
  if (agents.length === 0) return null;
  const pick = (id: string) => document.getElementById(`agent-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const robotFor = (a: AgentRow, x: number) => {
    const st = acts[a.id];
    const action = st?.action ?? "work";
    const dx = action === "coffee" ? COFFEE_X - x : action === "board" ? BOARD_X - x : 0;
    return <Robot agent={a} recent={isRecent(a)} action={action} actKey={st?.key ?? 0} dx={dx} onPick={() => pick(a.id)} />;
  };
  const screen = (a: AgentRow) => a.status === "broken" ? "#FCA5A5" : a.status === "idle" ? "#1E293B" : "#7DD3FC";

  return (
    <section className="panel overflow-hidden p-0" aria-label="AI 團隊辦公室動畫">
      <style>{CSS}</style>
      <div ref={scroller} className="overflow-x-auto overscroll-x-contain sm:overflow-visible">
      <svg className="hqo block h-auto w-full min-w-[620px] sm:min-w-0" viewBox="0 0 800 262" role="img">
        <title>AI 團隊辦公室</title>
        <rect width={800} height={112} fill="#EEF2F7" />
        <rect y={112} width={800} height={150} fill="#F6F1E8" />
        <rect y={108} width={800} height={5} fill="#D7DEE8" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={i * 100} y={113} width={1} height={157} fill="#EDE6D9" />)}

        <g transform="translate(170,20)">
          <rect width={130} height={64} rx={4} fill="#BFDBFE" stroke="#94A3B8" strokeWidth={2} />
          <path d="M8,64 V38 h14 V28 h16 V64 M46,64 V20 h18 V64 M72,64 V34 h12 V24 h14 V64 M104,64 V40 h18 V64" fill="#93C5FD" />
          <rect x={64} width={2} height={64} fill="#94A3B8" />
          <rect y={31} width={130} height={2} fill="#94A3B8" />
        </g>

        <g transform="translate(560,18)">
          <rect width={140} height={70} rx={4} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={2} />
          <text x={12} y={20} fontSize={11} fontWeight={700} fill="#1E3A8A">Bluluma HQ</text>
          <path d="M12,34 h40 M12,44 h60 M12,54 h30" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
          <rect x={90} y={28} width={10} height={30} fill="#86EFAC" />
          <rect x={104} y={38} width={10} height={20} fill="#FDBA74" />
          <rect x={118} y={22} width={10} height={36} fill="#93C5FD" />
        </g>

        <g transform="translate(36,58)">
          <rect y={44} width={60} height={10} rx={2} fill="#C8A27A" />
          <rect x={14} y={14} width={30} height={30} rx={4} fill="#475569" />
          <rect x={19} y={19} width={20} height={8} rx={2} fill="#1E293B" />
          <circle cx={29} cy={34} r={3} fill="#F59E0B" />
          <rect x={46} y={34} width={9} height={10} rx={2} fill="#FFFFFF" stroke="#CBD5E1" />
          <circle className="hqo-steam" cx={50} cy={30} r={2.5} fill="#CBD5E1" />
        </g>

        <g transform="translate(752,150)">
          <rect x={-12} y={20} width={24} height={22} rx={3} fill="#B45309" />
          <ellipse cx={-8} cy={10} rx={9} ry={16} fill="#22C55E" transform="rotate(-20 -8 10)" />
          <ellipse cx={8} cy={8} rx={9} ry={17} fill="#16A34A" transform="rotate(18 8 8)" />
        </g>

        {placed.filter((p) => p.y === BACK_Y).map(({ a, x, y }) => (
          <g key={a.id}>
            <g transform={`translate(${x},${y})`}>{robotFor(a, x)}</g>
            <Desk x={x} y={y} big={a.is_manager} screenColor={screen(a)} />
          </g>
        ))}
        {placed.filter((p) => p.y === FRONT_Y).map(({ a, x, y }) => (
          <g key={a.id}>
            <g transform={`translate(${x},${y})`}>{robotFor(a, x)}</g>
            <Desk x={x} y={y} screenColor={screen(a)} />
          </g>
        ))}
      </svg>
      </div>
    </section>
  );
}

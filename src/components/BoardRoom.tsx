import type { CSSProperties } from "react";
import { robotArt } from "@/components/RobotAvatar";
import { useCenteredScroll } from "@/components/AgentOffice";
import type { Director } from "@/lib/board";

/**
 * Boardroom animation: directors sit around an oval table and take turns "speaking"
 * (bounce + glow + speech bubble). Click a director to include/exclude them from the next meeting.
 */

const TURN = 3; // seconds each director speaks

function css(n: number) {
  const on = (100 / n).toFixed(2);
  const fade = Math.max(0, 100 / n - 4).toFixed(2);
  return `
.bdr text{font-family:inherit}
.bdr-dir{cursor:pointer;transition:opacity .25s}
.bdr-dir.off{opacity:.3}
.bdr-talk{animation:bdr-talk ${n * TURN}s ease-in-out infinite}
@keyframes bdr-talk{0%{transform:translateY(0)}3%{transform:translateY(-5px)}6%{transform:translateY(0)}9%{transform:translateY(-4px)}12%,100%{transform:translateY(0)}}
.bdr-glow{animation:bdr-glow ${n * TURN}s ease-in-out infinite;opacity:0}
@keyframes bdr-glow{0%{opacity:0}2%,${fade}%{opacity:.55}${on}%,100%{opacity:0}}
.bdr-bubble{animation:bdr-bubble ${n * TURN}s ease-out infinite;opacity:0}
@keyframes bdr-bubble{0%{opacity:0;transform:translateY(6px)}3%,${fade}%{opacity:1;transform:translateY(0)}${on}%,100%{opacity:0;transform:translateY(0)}}
.bdr-idle{animation:bdr-idle 2.8s ease-in-out infinite alternate}
@keyframes bdr-idle{to{transform:translateY(-1.5px)}}
.bdr-lamp{animation:bdr-lamp 4s ease-in-out infinite alternate}
@keyframes bdr-lamp{to{opacity:.55}}
`;
}

function seats(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return { x: 130 + t * 540, y: 125 - Math.sin(Math.PI * t) * 30 };
  });
}

function Seat({
  d,
  x,
  y,
  i,
  n,
  on,
  onToggle,
}: {
  d: Director;
  x: number;
  y: number;
  i: number;
  n: number;
  on: boolean;
  onToggle: () => void;
}) {
  const delay = { animationDelay: `${i * TURN}s` } as CSSProperties;
  return (
    <g
      transform={`translate(${x},${y})`}
      className={`bdr-dir${on ? "" : " off"}`}
      onClick={onToggle}
      role="button"
      aria-pressed={on}
      aria-label={`${d.name} · ${d.focus}`}
    >
      <title>{`${d.name} · ${d.focus}`}</title>
      {/* chair back */}
      <rect x={-30} y={-10} width={60} height={62} rx={14} fill="#64748B" />
      <circle
        className={on ? "bdr-glow" : undefined}
        r={44}
        cy={4}
        fill={d.color}
        style={{ ...delay, opacity: on ? undefined : 0 }}
      />
      <g className={on ? "bdr-talk" : undefined} style={delay}>
        <g className="bdr-idle" style={{ animationDelay: `${i * -0.6}s` }}>
          <rect x={-20} y={16} width={40} height={34} rx={11} fill={d.color} />
          <rect x={-9} y={23} width={18} height={9} rx={2.5} fill="#FFFFFF" opacity={0.85} />
          <g transform="scale(0.55)">{robotArt(d.id)}</g>
        </g>
      </g>
    </g>
  );
}

function Bubble({ d, x, y, i }: { d: Director; x: number; y: number; i: number }) {
  return (
    <g transform={`translate(${x},${y - 64})`} pointerEvents="none">
      <g className="bdr-bubble" style={{ animationDelay: `${i * TURN}s` }}>
        <rect
          x={-62}
          y={-17}
          width={124}
          height={30}
          rx={15}
          fill="#FFFFFF"
          stroke={d.color}
          strokeWidth={2}
        />
        <path d="M-6,13 L0,21 L6,13 Z" fill="#FFFFFF" stroke={d.color} strokeWidth={2} />
        <rect x={-7} y={10} width={14} height={4} fill="#FFFFFF" />
        <text textAnchor="middle" y={4} fontSize={15} fontWeight={700} fill="#0F172A">
          {d.bubble}
        </text>
      </g>
    </g>
  );
}

export function BoardRoom({
  directors,
  picked,
  onToggle,
}: {
  directors: Director[];
  picked: string[];
  onToggle: (id: string) => void;
}) {
  const list = directors.slice(0, 6);
  const pos = seats(list.length);
  const isOn = (id: string) => picked.length === 0 || picked.includes(id);
  const scroller = useCenteredScroll();
  return (
    <section className="panel overflow-hidden p-0" aria-label="董事會會議室動畫">
      <style>{css(list.length)}</style>
      <div ref={scroller} className="overflow-x-auto overscroll-x-contain sm:overflow-visible">
      <svg className="bdr block h-auto w-full min-w-[600px] sm:min-w-0" viewBox="0 0 800 300" role="img">
        <title>Bluluma 董事會會議室</title>
        {/* room */}
        <rect width={800} height={150} fill="#1E293B" />
        <rect y={150} width={800} height={150} fill="#273449" />
        <rect y={146} width={800} height={5} fill="#0F172A" />
        {/* window wall */}
        <g opacity={0.9}>
          {[0, 1, 2, 3].map((k) => (
            <g key={k} transform={`translate(${70 + k * 175},18)`}>
              <rect
                width={135}
                height={70}
                rx={4}
                fill="#0B1220"
                stroke="#475569"
                strokeWidth={2}
              />
              <path
                d={`M8,70 V${44 - k * 3} h14 V${34 + k * 2} h16 V70 M46,70 V${22 + k * 4} h18 V70 M72,70 V${38 - k * 2} h12 V${26 + k} h14 V70 M104,70 V${42 - k} h22 V70`}
                fill="#1E3A8A"
              />
              {[18, 52, 80, 110].map((wx) => (
                <rect key={wx} x={wx} y={48} width={3} height={3} fill="#FDE68A" opacity={0.8} />
              ))}
            </g>
          ))}
        </g>
        {/* pendant lamps */}
        {[260, 540].map((lx) => (
          <g key={lx}>
            <line x1={lx} y1={0} x2={lx} y2={30} stroke="#64748B" strokeWidth={2} />
            <path
              d={`M${lx - 22},44 L${lx - 10},30 L${lx + 10},30 L${lx + 22},44 Z`}
              fill="#F5B70A"
            />
            <ellipse
              className="bdr-lamp"
              cx={lx}
              cy={150}
              rx={120}
              ry={40}
              fill="#FDE68A"
              opacity={0.08}
            />
          </g>
        ))}

        {list.map((d, i) => (
          <Seat
            key={d.id}
            d={d}
            x={pos[i]!.x}
            y={pos[i]!.y}
            i={i}
            n={list.length}
            on={isOn(d.id)}
            onToggle={() => onToggle(d.id)}
          />
        ))}

        {/* table */}
        <ellipse cx={400} cy={214} rx={330} ry={52} fill="#0F172A" opacity={0.35} />
        <ellipse cx={400} cy={206} rx={330} ry={50} fill="#8B5E3C" />
        <ellipse cx={400} cy={200} rx={322} ry={44} fill="#A47148" />
        <ellipse cx={400} cy={200} rx={180} ry={20} fill="#B98557" opacity={0.6} />
        <text
          x={400}
          y={194}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          letterSpacing={6}
          fill="#8B5E3C"
        >
          BLULUMA BOARD
        </text>
        {/* name plates */}
        {list.map((d, i) => {
          const x = 400 + (pos[i]!.x - 400) * 0.92;
          return (
            <g key={d.id} transform={`translate(${x},${212})`} opacity={isOn(d.id) ? 1 : 0.35}>
              <rect x={-58} y={-13} width={116} height={24} rx={4} fill="#F8FAFC" />
              <rect x={-58} y={-13} width={5} height={24} rx={2} fill={d.color} />
              <text textAnchor="middle" x={3} y={4} fontSize={13} fontWeight={700} fill="#0F172A">
                {d.name}
              </text>
            </g>
          );
        })}
        {/* speech bubbles on top so neighbours never cover them */}
        {list.map((d, i) =>
          isOn(d.id) ? <Bubble key={d.id} d={d} x={pos[i]!.x} y={pos[i]!.y} i={i} /> : null,
        )}
        {/* your chair */}
        <g transform="translate(400,282)">
          <rect x={-46} y={-26} width={92} height={40} rx={14} fill="#F5B70A" />
          <text textAnchor="middle" y={0} fontSize={14} fontWeight={800} fill="#1E293B">
            主席 · 你
          </text>
        </g>
      </svg>
      </div>
    </section>
  );
}

import { robotArt } from "@/components/RobotAvatar";

const DESKS: { id: string; x: number; delay: number }[] = [
  { id: "atlas", x: 152, delay: 0 },
  { id: "bolt", x: 214, delay: 0.4 },
  { id: "mia", x: 276, delay: 0.3 },
  { id: "rocket", x: 338, delay: 0.6 },
  { id: "pixel", x: 400, delay: 0.2 },
  { id: "checky", x: 462, delay: 0.5 },
];

/** A long, thin office scene of the HQ robots at work. Decorative only. */
export function OfficeStrip({ count = 6 }: { count?: number }) {
  return (
    <section className="panel col-span-2 flex flex-col overflow-hidden max-sm:col-span-1">
      <style>{`
        @keyframes hq-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes hq-glow{0%,100%{opacity:1}50%{opacity:.45}}
        @keyframes hq-walk{0%{transform:translateX(0) scaleX(1)}48%{transform:translateX(300px) scaleX(1)}50%{transform:translateX(300px) scaleX(-1)}98%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(0) scaleX(1)}}
        @keyframes hq-drift{0%{transform:translateX(-30px)}100%{transform:translateX(90px)}}
        @keyframes hq-spin{to{transform:rotate(360deg)}}
        .hq-bob{animation:hq-bob 1.4s ease-in-out infinite}
        .hq-glow{animation:hq-glow 1.1s ease-in-out infinite}
        .hq-walk{animation:hq-walk 14s linear infinite;transform-box:fill-box;transform-origin:center}
        .hq-drift{animation:hq-drift 18s linear infinite}
        .hq-spin{animation:hq-spin 6s linear infinite;transform-origin:520px 38px}
      `}</style>
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <p className="text-[13px] font-semibold text-muted-foreground">Bluluma 辦公室</p>
        <span className="flex items-center gap-1.5 text-xs text-st-almost-fg">
          <span className="h-2 w-2 rounded-full bg-st-almost-bar" />
          {count} 位 AI 員工上班中
        </span>
      </div>
      <svg
        viewBox="0 0 560 150"
        preserveAspectRatio="xMidYMax slice"
        className="block h-[150px] w-full"
        role="img"
        aria-label="Bluluma 辦公室：AI 員工在座位上工作"
      >
        <rect width="560" height="150" fill="#EEF3FC" />
        <rect y="116" width="560" height="34" fill="#DCE3F0" />
        <rect y="114" width="560" height="3" fill="#C9D3E6" />
        <rect
          x="20"
          y="18"
          width="96"
          height="66"
          rx="6"
          fill="#CFE0FA"
          stroke="#B5C7E6"
          strokeWidth="3"
        />
        <g className="hq-drift">
          <ellipse cx="40" cy="34" rx="12" ry="4" fill="#fff" opacity=".9" />
        </g>
        <path d="M22 82 L44 52 L58 66 L74 44 L96 70 L114 58 L114 82 Z" fill="#7F9CC9" />
        <path d="M68 52 L74 44 L80 52 Z" fill="#fff" />
        <line x1="68" y1="18" x2="68" y2="84" stroke="#B5C7E6" strokeWidth="3" />
        <circle cx="520" cy="38" r="16" fill="#fff" stroke="#B5C7E6" strokeWidth="3" />
        <line
          x1="520"
          y1="38"
          x2="520"
          y2="28"
          stroke="#1C2030"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          className="hq-spin"
          x1="520"
          y1="38"
          x2="529"
          y2="38"
          stroke="#3D66C0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="510" y="96" width="20" height="20" rx="3" fill="#C2774A" />
        <circle cx="514" cy="88" r="9" fill="#5FA36B" />
        <circle cx="526" cy="84" r="10" fill="#4C8F58" />
        <circle cx="520" cy="92" r="8" fill="#6DB377" />
        {DESKS.map((d) => (
          <g key={d.id}>
            <g transform={`translate(${d.x - 10} 78) scale(.42)`}>
              <g className="hq-bob" style={{ animationDelay: `${d.delay}s` }}>
                {robotArt(d.id)}
              </g>
            </g>
            <rect x={d.x + 2} y="80" width="26" height="16" rx="2" fill="#2A3350" />
            <rect
              className="hq-glow"
              x={d.x + 4}
              y="82"
              width="22"
              height="12"
              rx="1"
              fill="#8FB4F2"
              style={{ animationDelay: `${d.delay}s` }}
            />
            <rect x={d.x + 12} y="96" width="6" height="4" fill="#2A3350" />
            <rect x={d.x - 34} y="100" width="66" height="6" rx="2" fill="#A9B7D3" />
            <rect x={d.x - 30} y="106" width="4" height="12" fill="#A9B7D3" />
            <rect x={d.x + 24} y="106" width="4" height="12" fill="#A9B7D3" />
          </g>
        ))}
        <g className="hq-walk">
          <g transform="translate(140 118) scale(.32)">{robotArt("memo")}</g>
          <rect
            x="150"
            y="117"
            width="8"
            height="9"
            rx="2"
            fill="#fff"
            stroke="#0F766E"
            strokeWidth="1.5"
          />
        </g>
      </svg>
    </section>
  );
}

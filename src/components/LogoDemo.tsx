import type { CSSProperties, ReactNode } from "react";
import { Badge, DogFace } from "./StylePreview";

/** Sample logos (fake brands) for the Logo tab of the Style Library. */

const stage = (bg: string, extra: CSSProperties = {}): CSSProperties => ({
  height: "100%",
  width: "100%",
  background: bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  ...extra,
});

const DEMOS: Record<string, () => ReactNode> = {
  // Axis 1 — structure
  wordmark: () => (
    <div style={stage("#F4F2EC")}>
      <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 40, color: "#2F3B2A", letterSpacing: "-0.02em" }}>fernwood</span>
    </div>
  ),
  lettermark: () => (
    <div style={stage("#F4F2EC")}>
      <span style={{ width: 88, height: 88, background: "#1A1A18", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 38, letterSpacing: "-0.04em" }}>HB</span>
    </div>
  ),
  pictorial: () => (
    <div style={stage("#F4F2EC")}>
      <svg aria-hidden width="100" height="100" viewBox="0 0 100 100"><path d="M50 88 C 14 64, 18 20, 82 12 C 88 58, 74 82, 50 88 Z" fill="#4F7A4A" /><path d="M50 88 L 70 30" stroke="#F4F2EC" strokeWidth="3" fill="none" /></svg>
    </div>
  ),
  abstract: () => (
    <div style={stage("#F4F2EC")}>
      <svg aria-hidden width="120" height="90" viewBox="0 0 120 90"><circle cx="46" cy="45" r="32" fill="#1F4FE0" /><circle cx="74" cy="45" r="32" fill="#FF7A59" opacity="0.85" /></svg>
    </div>
  ),
  mascot: () => <div style={stage("#F4F2EC")}><DogFace size={100} /></div>,
  emblem: () => (
    <div style={stage("#F4F2EC")}>
      <span style={{ width: 110, height: 110, borderRadius: "50%", border: "3px solid #1E3A5F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#1E3A5F", fontWeight: 800, fontSize: 13, letterSpacing: "0.12em", lineHeight: 1.3, textAlign: "center" }}>
        NORTH<br />SHORE<br /><span style={{ fontWeight: 500, fontSize: 9 }}>ROWING CLUB</span>
      </span>
    </div>
  ),
  combination: () => (
    <div style={stage("#F4F2EC", { gap: 10 })}>
      <svg aria-hidden width="40" height="34" viewBox="0 0 40 34"><path d="M2 32 L15 8 L22 20 L28 12 L38 32 Z" fill="#1A1A18" /></svg>
      <span style={{ fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em", color: "#1A1A18" }}>Peakline</span>
    </div>
  ),

  // Axis 2 — technique
  geometric: () => (
    <div style={stage("#F4F2EC")}>
      <svg aria-hidden width="150" height="130" viewBox="0 0 150 130">
        <circle cx="75" cy="65" r="56" fill="none" stroke="#C9C5BB" strokeDasharray="3 4" />
        <circle cx="103" cy="37" r="28" fill="none" stroke="#C9C5BB" strokeDasharray="3 4" />
        <line x1="10" y1="65" x2="140" y2="65" stroke="#C9C5BB" strokeDasharray="3 4" />
        <circle cx="75" cy="65" r="42" fill="#1A1A18" />
        <path d="M75 65 L117 65 A42 42 0 0 0 75 23 Z" fill="#F4F2EC" />
        <circle cx="96" cy="44" r="10" fill="#E8552B" />
      </svg>
    </div>
  ),
  monoline: () => (
    <div style={stage("#F4F2EC", { flexDirection: "column", gap: 10 })}>
      <svg aria-hidden width="130" height="80" viewBox="0 0 130 80">
        <circle cx="92" cy="24" r="12" fill="none" stroke="#2F3B2A" strokeWidth="4" />
        <polyline points="6,72 44,22 66,50 80,36 124,72" fill="none" stroke="#2F3B2A" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="6" y1="72" x2="124" y2="72" stroke="#2F3B2A" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", color: "#2F3B2A" }}>TRAILHEAD</span>
    </div>
  ),
  negative: () => (
    <div style={stage("#F4F2EC")}>
      <svg aria-hidden width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="#1A1A18" />
        <polygon points="60,28 92,56 28,56" fill="#F4F2EC" />
        <rect x="36" y="56" width="48" height="34" fill="#F4F2EC" />
        <rect x="53" y="68" width="14" height="22" fill="#1A1A18" />
      </svg>
    </div>
  ),
  "swiss-min": () => (
    <div style={stage("#F4F2EC")}>
      <span style={{ fontWeight: 800, fontSize: 54, letterSpacing: "-0.07em", color: "#111" }}>kanto<span style={{ color: "#E30613" }}>.</span></span>
    </div>
  ),
  badge: () => <div style={stage("#EFE3CC")}><Badge size={136} /></div>,
  script: () => (
    <div style={stage("#F8EEF0", { flexDirection: "column", gap: 2 })}>
      <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 52, color: "#7A2E4A" }}>Lumière</span>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.4em", paddingLeft: "0.4em", color: "#7A2E4A" }}>BAKERY</span>
    </div>
  ),
  mon: () => (
    <div style={stage("#F4F2EC")}>
      <svg aria-hidden width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#8B1E1E" strokeWidth="5" />
        <circle cx="60" cy="40" r="17" fill="none" stroke="#8B1E1E" strokeWidth="5" />
        <circle cx="42.7" cy="70" r="17" fill="none" stroke="#8B1E1E" strokeWidth="5" />
        <circle cx="77.3" cy="70" r="17" fill="none" stroke="#8B1E1E" strokeWidth="5" />
      </svg>
    </div>
  ),
  retro70: () => (
    <div style={stage("#F6EBD9", { flexDirection: "column", gap: 6 })}>
      <svg aria-hidden width="130" height="62" viewBox="0 0 130 62">
        <path d="M10 62 A55 55 0 0 1 120 62" fill="none" stroke="#E2672A" strokeWidth="10" />
        <path d="M24 62 A41 41 0 0 1 106 62" fill="none" stroke="#E9A93A" strokeWidth="10" />
        <path d="M38 62 A27 27 0 0 1 92 62" fill="none" stroke="#7A3B1E" strokeWidth="10" />
      </svg>
      <span style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 900, fontSize: 34, color: "#5A2E1A", lineHeight: 1 }}>groovy</span>
    </div>
  ),
  deco: () => (
    <div style={stage("#141414", { flexDirection: "column", gap: 12 })}>
      <svg aria-hidden width="120" height="60" viewBox="0 0 120 60">
        <g stroke="#C9A24B" strokeWidth="2">
          <line x1="60" y1="60" x2="60" y2="2" /><line x1="60" y1="60" x2="30" y2="8" /><line x1="60" y1="60" x2="90" y2="8" />
          <line x1="60" y1="60" x2="8" y2="30" /><line x1="60" y1="60" x2="112" y2="30" />
        </g>
        <path d="M2 60 A58 58 0 0 1 118 60" fill="none" stroke="#C9A24B" strokeWidth="2" />
      </svg>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 24, letterSpacing: "0.45em", paddingLeft: "0.45em", color: "#C9A24B" }}>ASTOR</span>
    </div>
  ),
  brutal: () => (
    <div style={stage("#E8E6E0")}>
      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 66, lineHeight: 1, color: "#111", transform: "scaleY(1.45)", letterSpacing: "-0.04em" }}>RAW/</span>
    </div>
  ),
};

export function LogoDemo({ id }: { id: string }) {
  const D = DEMOS[id];
  return D ? <>{D()}</> : null;
}

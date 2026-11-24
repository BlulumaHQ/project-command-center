import type { CSSProperties, ReactNode } from "react";

/** Live mini-samples for each style, drawn with fake brands. Fills its parent's box. */

const box = (s: CSSProperties): CSSProperties => ({
  height: "100%",
  width: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
  position: "relative",
  ...s,
});

function Paw({ size, style }: { size: number; style: CSSProperties }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 40 40" style={{ position: "absolute", ...style }}>
      <g fill="#2B2A6B">
        <ellipse cx="20" cy="26" rx="9" ry="7" />
        <circle cx="9" cy="15" r="4" />
        <circle cx="16" cy="9" r="4" />
        <circle cx="25" cy="9" r="4" />
        <circle cx="32" cy="15" r="4" />
      </g>
    </svg>
  );
}

export function DogFace({ size = 110 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 110 110" style={{ flex: "none", position: "relative" }}>
      <circle cx="55" cy="58" r="44" fill="#FF8A5B" />
      <ellipse cx="20" cy="30" rx="14" ry="22" fill="#C8562F" transform="rotate(-25 20 30)" />
      <ellipse cx="90" cy="30" rx="14" ry="22" fill="#C8562F" transform="rotate(25 90 30)" />
      <ellipse cx="55" cy="74" rx="22" ry="17" fill="#FFF3E3" />
      <circle cx="40" cy="52" r="5" fill="#2B2A6B" />
      <circle cx="70" cy="52" r="5" fill="#2B2A6B" />
      <ellipse cx="55" cy="67" rx="7" ry="5" fill="#2B2A6B" />
    </svg>
  );
}

const inter = "Inter, sans-serif";

const PREVIEWS: Record<string, () => ReactNode> = {
  swiss: () => (
    <div style={box({ background: "#F4F4F1", padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: inter, color: "#111" })}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
        <span>NORDFORM ARCHITECTS</span><span>01—04</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ width: 14, height: 14, background: "#E30613", marginTop: 10, flex: "none" }} />
        <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.04em", whiteSpace: "pre-line" }}>{"Form follows\nfunction."}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, fontSize: 11 }}>
        {[["48", "Projects"], ["12", "Years"], ["03", "Cities"]].map(([n, l]) => (
          <span key={l} style={{ borderTop: "2px solid #111", paddingTop: 6 }}><b style={{ fontSize: 18 }}>{n}</b><br />{l}</span>
        ))}
      </div>
    </div>
  ),
  editorial: () => (
    <div style={box({ background: "#F3EEE6", padding: 22, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, color: "#241F1A" })}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: "1px solid #241F1A", paddingTop: 10 }}>
        <span style={{ fontFamily: inter, fontSize: 10, letterSpacing: "0.18em" }}>ISSUE 04 — SPRING</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 500, fontSize: 30, lineHeight: 1.02 }}>The art of slow dining</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, lineHeight: 1.5, color: "#4C443B" }}>
          <b style={{ fontSize: 26, float: "left", lineHeight: 0.9, marginRight: 4 }}>M</b>aison Ardoise opens its doors to a seasonal menu built around the market.
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ flex: 1, background: "#B9A58C" }} />
        <span style={{ fontFamily: inter, fontSize: 9, letterSpacing: "0.1em", color: "#4C443B" }}>PHOTO — CHEF'S TABLE</span>
      </div>
    </div>
  ),
  "quiet-luxury": () => (
    <div style={box({ background: "#EDE9E3", padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#3A3631", textAlign: "center" })}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, letterSpacing: "0.55em", paddingLeft: "0.55em" }}>HALDEN</span>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 30, lineHeight: 1.1 }}>Residences of quiet distinction</span>
      <span style={{ width: 40, height: 1, background: "#3A3631" }} />
      <span style={{ fontFamily: inter, fontSize: 10, letterSpacing: "0.3em" }}>VIEW COLLECTION</span>
    </div>
  ),
  japandi: () => (
    <div style={box({ background: "#E9E4DA", padding: 22, display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20, color: "#2F2C27" })}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ fontFamily: inter, fontSize: 10, letterSpacing: "0.2em", color: "#555048" }}>KUMO INTERIORS</span>
        <span style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 26, lineHeight: 1.12 }}>Calm rooms, made to last.</span>
        <span style={{ fontFamily: inter, fontSize: 11, color: "#4F5A44", borderBottom: "1px solid #4F5A44", alignSelf: "flex-start", paddingBottom: 2 }}>Our process →</span>
      </div>
      <div style={{ position: "relative", display: "flex" }}>
        <div style={{ flex: 1, background: "#C8BBA6", margin: "18px 0 0 18px" }} />
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 46, height: 46, borderRadius: "50%", border: "1px solid #2F2C27" }} />
      </div>
    </div>
  ),
  organic: () => (
    <div style={box({ background: "#F1EDE4", padding: 22, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, color: "#33402F" })}>
      <span aria-hidden style={{ position: "absolute", right: -30, top: -40, width: 200, height: 180, background: "#CFD8C4", borderRadius: "62% 38% 55% 45% / 48% 60% 40% 52%" }} />
      <span aria-hidden style={{ position: "absolute", right: 70, bottom: -50, width: 130, height: 120, background: "#E7C9B0", borderRadius: "40% 60% 45% 55% / 55% 45% 55% 45%" }} />
      <span style={{ position: "relative", fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 28, lineHeight: 1.1, maxWidth: 220 }}>Willow Acupuncture</span>
      <span style={{ position: "relative", fontFamily: inter, fontSize: 12, maxWidth: 220, lineHeight: 1.5 }}>Gentle, whole-body care in Port Moody.</span>
      <span style={{ position: "relative", alignSelf: "flex-start", padding: "9px 18px", borderRadius: 999, background: "#33402F", color: "#F1EDE4", fontFamily: inter, fontSize: 12, fontWeight: 600 }}>Book a session</span>
    </div>
  ),
  playful: () => (
    <div style={box({ background: "#FFE9A8", padding: 22, display: "flex", alignItems: "center", gap: 16, color: "#2B2A6B" })}>
      <Paw size={40} style={{ top: 14, right: 120, opacity: 0.35, transform: "rotate(-20deg)" }} />
      <Paw size={30} style={{ bottom: 18, left: "46%", opacity: 0.3, transform: "rotate(25deg)" }} />
      <Paw size={26} style={{ top: 40, left: "52%", opacity: 0.25, transform: "rotate(10deg)" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 30, lineHeight: 1.02, whiteSpace: "pre-line" }}>{"Happy pets,\nhappy you!"}</span>
        <span style={{ alignSelf: "flex-start", padding: "10px 18px", borderRadius: 999, background: "#2B2A6B", color: "#FFE9A8", fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 13 }}>Meet our sitters</span>
      </div>
      <DogFace />
    </div>
  ),
  "neo-brutalism": () => (
    <div style={box({ background: "#FFF4D6", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" })}>
      <div style={{ background: "#A3E4FF", border: "3px solid #000", boxShadow: "8px 8px 0 #000", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, width: "78%", boxSizing: "border-box" }}>
        <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 34, lineHeight: 0.95, color: "#000" }}>BOLT TOYS</span>
        <span style={{ alignSelf: "flex-start", background: "#FF5C8A", border: "3px solid #000", boxShadow: "4px 4px 0 #000", padding: "6px 14px", fontFamily: "'Archivo Black', sans-serif", fontSize: 12, color: "#000" }}>SHOP DROPS →</span>
      </div>
      <span style={{ position: "absolute", top: 18, right: 22, transform: "rotate(12deg)", background: "#FFE600", border: "3px solid #000", padding: "4px 10px", fontFamily: "'Archivo Black', sans-serif", fontSize: 13, color: "#000" }}>NEW!</span>
    </div>
  ),
  bento: () => (
    <div style={box({ background: "#F5F5F7", padding: 16, display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gridTemplateRows: "repeat(2, minmax(0,1fr))", gap: 10, fontFamily: inter, color: "#1D1D1F" })}>
      <div style={{ gridColumn: "span 2", gridRow: "span 2", background: "#fff", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#5E5E63", fontWeight: 600 }}>Flowdesk</span>
        <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Your whole week, in one view.</span>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <b style={{ fontSize: 22 }}>3×</b><span style={{ fontSize: 10, color: "#5E5E63" }}>faster</span>
      </div>
      <div style={{ background: "#DCE7FF", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg aria-hidden width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8"><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
      </div>
      <div style={{ gridColumn: "span 2", background: "#1D1D1F", color: "#fff", borderRadius: 16, padding: 12, display: "flex", alignItems: "flex-end", fontSize: 13, fontWeight: 600 }}>Syncs with your calendar</div>
    </div>
  ),
  "dark-tech": () => (
    <div style={box({ background: "radial-gradient(circle at 75% 20%, #1E2A55 0%, #0B0D12 55%)", padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#F2F4FA" })}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9DB2FF" }}>// SIGNAL AI</span>
      <span style={{ fontFamily: inter, fontWeight: 600, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.03em", whiteSpace: "pre-line" }}>{"Automate the\nboring parts."}</span>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ padding: "8px 14px", borderRadius: 8, background: "#F2F4FA", color: "#0B0D12", fontFamily: inter, fontSize: 12, fontWeight: 600 }}>Start free</span>
        <span style={{ padding: "7px 13px", borderRadius: 8, border: "1px solid #3A4466", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#C9D2EE" }}>$ npx signal init</span>
      </div>
    </div>
  ),
  "big-type": () => (
    <div style={box({ background: "#F2F0EB", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#111" })}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px 0", fontFamily: inter, fontSize: 11, fontWeight: 600 }}>
        <span>Studio OK</span><span>Work · About · Contact</span>
      </div>
      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 108, lineHeight: 0.82, letterSpacing: "-0.05em", marginLeft: -6, whiteSpace: "nowrap" }}>STUDIO</span>
      <div style={{ background: "#111", color: "#F2F0EB", padding: "9px 0", fontFamily: "'Archivo Black', sans-serif", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden" }}>
        BRANDING — WEB — MOTION — BRANDING — WEB — MOTION — BRANDING —
      </div>
    </div>
  ),
  industrial: () => (
    <div style={box({ background: "#1C1C1C", padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" })}>
      <span aria-hidden style={{ position: "absolute", right: -40, top: 0, bottom: 0, width: 150, background: "repeating-linear-gradient(-45deg, #FFC400 0 18px, #1C1C1C 18px 36px)" }} />
      <span style={{ position: "relative", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.1em", color: "#FFC400" }}>IRONLINE BUILD CO.</span>
      <span style={{ position: "relative", fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 0.9, whiteSpace: "pre-line" }}>{"Built right.\nBuilt once."}</span>
      <span style={{ position: "relative", fontFamily: inter, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>01 / RESIDENTIAL · 02 / COMMERCIAL</span>
    </div>
  ),
  retro: () => (
    <div style={box({ background: "#EFE3CC", padding: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, color: "#6B2E1F" })}>
      <Badge />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 150 }}>
        <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, lineHeight: 1.05 }}>Small batch, roasted daily.</span>
        <span style={{ alignSelf: "flex-start", background: "#8A3A12", color: "#EFE3CC", padding: "7px 12px", fontFamily: inter, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>SHOP BEANS</span>
      </div>
    </div>
  ),
  clinical: () => (
    <div style={box({ background: "#fff", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14, fontFamily: inter, color: "#0F2A4A" })}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
        <span>Brightway Dental</span><span style={{ color: "#1A5FD0" }}>Book online</span>
      </div>
      <span style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>{"Gentle care for the\nwhole family."}</span>
      <span style={{ alignSelf: "flex-start", background: "#1A5FD0", color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600 }}>Book appointment</span>
      <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#3D5573", flexWrap: "wrap" }}>
        <span>✓ Direct billing</span><span>✓ Evening hours</span><span>✓ Kids welcome</span>
      </div>
    </div>
  ),
  maximalist: () => (
    <div style={box({ background: "#FF3EA5" })}>
      <span aria-hidden style={{ position: "absolute", left: -20, top: 30, width: 180, height: 180, borderRadius: "50%", background: "#00E0C6" }} />
      <span aria-hidden style={{ position: "absolute", right: 30, top: -30, width: 120, height: 200, background: "#FFE600", transform: "rotate(18deg)" }} />
      <span aria-hidden style={{ position: "absolute", right: 90, bottom: 20, width: 70, height: 70, background: "#1A1A18", transform: "rotate(45deg)" }} />
      <span style={{ position: "absolute", left: 18, top: 40, fontFamily: "'DM Serif Display', serif", fontSize: 96, lineHeight: 0.85, color: "#1A1A18", transform: "rotate(-6deg)" }}>Noise</span>
      <span style={{ position: "absolute", right: 18, bottom: 16, background: "#fff", color: "#1A1A18", padding: "6px 10px", fontFamily: "'Archivo Black', sans-serif", fontSize: 12 }}>RECORDS ✦ VOL. 9</span>
    </div>
  ),
  risograph: () => (
    <div style={box({ background: "#F4EFE6", backgroundImage: "radial-gradient(#0078BF33 1px, transparent 1.2px)", backgroundSize: "6px 6px", padding: 22 })}>
      <span aria-hidden style={{ position: "absolute", left: 30, top: 26, width: 150, height: 150, borderRadius: "50%", background: "#FF48B0", mixBlendMode: "multiply", opacity: 0.9 }} />
      <span aria-hidden style={{ position: "absolute", left: 90, top: 50, width: 150, height: 150, borderRadius: "50%", background: "#0078BF", mixBlendMode: "multiply", opacity: 0.85 }} />
      <span style={{ position: "absolute", right: 20, bottom: 50, fontFamily: "'Archivo Black', sans-serif", fontSize: 40, lineHeight: 0.9, color: "#FF48B0", textAlign: "right" }}>ZINE<br />FEST</span>
      <span style={{ position: "absolute", right: 23, bottom: 53, fontFamily: "'Archivo Black', sans-serif", fontSize: 40, lineHeight: 0.9, color: "#0078BF", textAlign: "right", mixBlendMode: "multiply" }}>ZINE<br />FEST</span>
      <span style={{ position: "absolute", left: 22, bottom: 18, fontFamily: inter, fontSize: 11, fontWeight: 700, color: "#0078BF" }}>SAT · MAY 16 · EAST VAN</span>
    </div>
  ),
  bauhaus: () => (
    <div style={box({ background: "#F2EBDD" })}>
      <span aria-hidden style={{ position: "absolute", left: 24, top: 24, width: 110, height: 110, borderRadius: "50%", background: "#D92B2B" }} />
      <span aria-hidden style={{ position: "absolute", left: 110, top: 90, width: 90, height: 90, background: "#1F4E99" }} />
      <span aria-hidden style={{ position: "absolute", right: 30, top: 24, width: 0, height: 0, borderLeft: "50px solid transparent", borderRight: "50px solid transparent", borderBottom: "86px solid #F2B705" }} />
      <span style={{ position: "absolute", right: 20, bottom: 18, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, lineHeight: 0.95, color: "#1A1A18", textAlign: "right" }}>form<br />& colour</span>
    </div>
  ),
  "swiss-poster": () => (
    <div style={box({ background: "#fff", padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: inter, color: "#111" })}>
      <span style={{ fontSize: 70, fontWeight: 800, lineHeight: 0.85, letterSpacing: "-0.06em" }}>Bau<br />kunst</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, fontSize: 10, fontWeight: 600, borderTop: "3px solid #111", paddingTop: 8 }}>
        <span>12.06—<br />30.08</span><span>Kunsthalle<br />Vancouver</span><span style={{ color: "#E30613" }}>Free<br />entry</span>
      </div>
    </div>
  ),
  duotone: () => (
    <div style={box({ background: "linear-gradient(160deg, #FF6B4A 0%, #2A1B6B 75%)", padding: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" })}>
      <svg aria-hidden viewBox="0 0 200 160" style={{ position: "absolute", right: 10, top: 10, width: "60%", height: "85%", opacity: 0.55 }}>
        <circle cx="110" cy="35" r="20" fill="#2A1B6B" />
        <path d="M80 160 L95 70 Q110 55 125 70 L150 110 L175 100 L180 112 L145 132 L130 110 L125 160 Z" fill="#2A1B6B" />
      </svg>
      <span style={{ position: "relative", fontFamily: "'Bebas Neue', sans-serif", fontSize: 54, lineHeight: 0.88, color: "#FFE3D8" }}>PUSH<br />HARDER</span>
    </div>
  ),
  collage: () => (
    <div style={box({ background: "#EDE6D6" })}>
      <span aria-hidden style={{ position: "absolute", left: 24, top: 22, width: 130, height: 150, background: "#9A8F7E", transform: "rotate(-5deg)", boxShadow: "2px 3px 0 rgba(0,0,0,0.15)" }} />
      <span aria-hidden style={{ position: "absolute", left: 120, top: 60, width: 110, height: 120, background: "#E04A2F", clipPath: "polygon(4% 0, 100% 6%, 94% 100%, 0 92%)" }} />
      <span aria-hidden style={{ position: "absolute", left: 50, top: 14, width: 70, height: 18, background: "#F4C542cc", transform: "rotate(-12deg)" }} />
      <span style={{ position: "absolute", right: 18, top: 26, fontFamily: "'DM Serif Display', serif", fontSize: 38, lineHeight: 0.9, color: "#1A1A18", textAlign: "right" }}>cut<br />&amp; paste</span>
      <span style={{ position: "absolute", right: 18, bottom: 18, fontFamily: "'Special Elite', monospace", fontSize: 12, color: "#1A1A18", background: "#fff", padding: "3px 6px" }}>vol. 02 — youth issue</span>
    </div>
  ),
};

export function Badge({ size = 140 }: { size?: number }) {
  const k = size / 140;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", border: "5px double #6B2E1F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, flex: "none", color: "#6B2E1F", boxSizing: "border-box" }}>
      <span style={{ fontFamily: inter, fontSize: 9 * k, fontWeight: 700, letterSpacing: "0.2em" }}>★ EST. 1987 ★</span>
      <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22 * k, lineHeight: 0.95, textAlign: "center" }}>OLD<br />HARBOR</span>
      <span style={{ fontFamily: inter, fontSize: 9 * k, fontWeight: 700, letterSpacing: "0.2em" }}>COFFEE</span>
    </div>
  );
}

export function StylePreview({ id }: { id: string }) {
  const P = PREVIEWS[id];
  return P ? <>{P()}</> : null;
}

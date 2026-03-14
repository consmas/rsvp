"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
interface Accommodation {
  id: number;
  hotel_name: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  currency: string;
  max_guests: number;
  available: number;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  attending: string;
  guestCount: number;
  arrivingEarly: string;
  accommodationId: number | null;
  needsAccommodation: string;
  stayingForDinner: string;
  dietaryNotes: string;
  message: string;
}

/* ═══════════════════════════════════════════
   COLOR TOKENS
   ═══════════════════════════════════════════ */
const C = {
  magDeep: "#9C0052",
  magMed: "#C20068",
  magBright: "#E91E8C",
  magPale: "#FDE8F4",
  goldRich: "#C8960C",
  goldMed: "#E0B030",
  goldBright: "#F5CE50",
  warmWhite: "#FFF5FA",
  cream: "#FEF0F6",
  charcoal: "#1E0C16",
  silver: "#7A6876",
  oceanTeal: "#1A8A7D",
  sandWarm: "#E8D5B7",
};

/* ═══════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
::placeholder { color: #BBA8B5; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes bobble {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(5deg); }
}
@keyframes sparkle {
  0%, 100% { opacity: 0.2; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 0.85; transform: scale(1.15) rotate(180deg); }
}
@keyframes shimmer {
  0% { background-position: -300% center; }
  100% { background-position: 300% center; }
}
@keyframes gradientPulse {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes shineSwipe {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(350%) skewX(-15deg); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes confettiFall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(calc(100vh + 40px)) rotate(1080deg); opacity: 0; }
}
@keyframes gentleWave {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-15px); }
}
@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
}
@keyframes floatPetal {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity:0.7; }
  25% { transform: translateY(-30px) translateX(15px) rotate(45deg); opacity:0.5; }
  50% { transform: translateY(-10px) translateX(-10px) rotate(90deg); opacity:0.6; }
  75% { transform: translateY(-40px) translateX(20px) rotate(135deg); opacity:0.4; }
  100% { transform: translateY(0) translateX(0) rotate(180deg); opacity:0.7; }
}
`;

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const font = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'Lora', Georgia, serif",
};

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency", currency,
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/* ═══════════════════════════════════════════
   SVG COMPONENTS
   ═══════════════════════════════════════════ */
function KenteStrip() {
  return (
    <svg width="100%" height="10" style={{ display: "block" }}>
      <defs>
        <pattern id="kenteWeave" x="0" y="0" width="40" height="10" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="10" height="5" fill={C.magDeep} />
          <rect x="10" y="0" width="10" height="5" fill={C.goldRich} />
          <rect x="20" y="0" width="10" height="5" fill={C.magBright} />
          <rect x="30" y="0" width="10" height="5" fill={C.goldMed} />
          <rect x="0" y="5" width="10" height="5" fill={C.goldMed} />
          <rect x="10" y="5" width="10" height="5" fill={C.magBright} />
          <rect x="20" y="5" width="10" height="5" fill={C.goldRich} />
          <rect x="30" y="5" width="10" height="5" fill={C.magDeep} />
          <rect x="2" y="2" width="6" height="1" fill="rgba(255,255,255,0.15)" />
          <rect x="12" y="2" width="6" height="1" fill="rgba(255,255,255,0.1)" />
          <rect x="22" y="7" width="6" height="1" fill="rgba(255,255,255,0.12)" />
          <rect x="32" y="7" width="6" height="1" fill="rgba(255,255,255,0.08)" />
        </pattern>
      </defs>
      <rect width="100%" height="10" fill="url(#kenteWeave)" />
    </svg>
  );
}

function WeddingBgPattern() {
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" } as React.CSSProperties}>
      <defs>
        <pattern id="bgKente" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="none" />
          <rect x="0" y="0" width="12" height="24" fill={C.magDeep} opacity="0.025" />
          <rect x="12" y="0" width="12" height="24" fill={C.goldRich} opacity="0.03" />
          <rect x="24" y="0" width="12" height="24" fill={C.magBright} opacity="0.02" />
          <rect x="36" y="0" width="12" height="24" fill={C.goldMed} opacity="0.025" />
          <rect x="0" y="24" width="24" height="12" fill={C.goldMed} opacity="0.025" />
          <rect x="24" y="24" width="24" height="12" fill={C.magDeep} opacity="0.02" />
          <rect x="0" y="36" width="24" height="12" fill={C.magBright} opacity="0.02" />
          <rect x="24" y="36" width="24" height="12" fill={C.goldRich} opacity="0.025" />
        </pattern>
        <pattern id="floralLace" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <circle cx="100" cy="100" r="60" stroke={C.magDeep} strokeWidth="0.5" fill="none" opacity="0.04" />
          <circle cx="100" cy="100" r="40" stroke={C.goldRich} strokeWidth="0.5" fill="none" opacity="0.035" />
          <circle cx="100" cy="100" r="20" stroke={C.magBright} strokeWidth="0.4" fill="none" opacity="0.03" />
          <path d="M100 40 Q120 70 100 100 Q80 70 100 40Z" fill={C.magDeep} opacity="0.02" />
          <path d="M100 160 Q120 130 100 100 Q80 130 100 160Z" fill={C.magDeep} opacity="0.02" />
          <path d="M40 100 Q70 120 100 100 Q70 80 40 100Z" fill={C.goldRich} opacity="0.02" />
          <path d="M160 100 Q130 120 100 100 Q130 80 160 100Z" fill={C.goldRich} opacity="0.02" />
        </pattern>
        <radialGradient id="vignette" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor={C.magDeep} stopOpacity="0.04" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgKente)" />
      <rect width="100%" height="100%" fill="url(#floralLace)" />
      <rect width="100%" height="100%" fill="url(#vignette)" />
    </svg>
  );
}

function WaveDecoration() {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", overflow: "hidden", lineHeight: 0, pointerEvents: "none" }}>
      <svg viewBox="0 0 1440 120" style={{ width: "110%", marginLeft: "-5%", animation: "gentleWave 8s ease-in-out infinite" }}>
        <path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,70 L1440,120 L0,120Z" fill={C.oceanTeal} opacity="0.04" />
        <path d="M0,90 C320,50 640,110 960,70 C1120,50 1300,90 1440,80 L1440,120 L0,120Z" fill={C.oceanTeal} opacity="0.03" />
        <path d="M0,100 C240,85 480,105 720,90 C960,75 1200,100 1440,95 L1440,120 L0,120Z" fill={C.sandWarm} opacity="0.06" />
      </svg>
    </div>
  );
}

function WeddingRings({ size = 60 }: { size?: number }) {
  return (
    <svg width={size * 1.6} height={size} viewBox="0 0 96 60" fill="none" style={{ animation: "ringPulse 4s ease-in-out infinite" }}>
      <circle cx="33" cy="30" r="18" stroke={C.goldRich} strokeWidth="2.5" fill="none" opacity="0.7" />
      <circle cx="63" cy="30" r="18" stroke={C.goldMed} strokeWidth="2.5" fill="none" opacity="0.7" />
      <circle cx="33" cy="30" r="14" stroke={C.goldBright} strokeWidth="0.5" fill="none" opacity="0.3" />
      <circle cx="63" cy="30" r="14" stroke={C.goldBright} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M30 16 L33 10 L36 16 L33 18Z" fill={C.goldBright} opacity="0.6" />
    </svg>
  );
}

function AdinkraHeart({ size = 40, color = C.goldRich, opacity = 0.6 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 35L17.1 32.37C8 24.19 2 18.74 2 12.08C2 6.63 6.42 2.25 11.85 2.25C14.89 2.25 17.82 3.66 20 5.9C22.18 3.66 25.11 2.25 28.15 2.25C33.58 2.25 38 6.63 38 12.08C38 18.74 32 24.19 22.9 32.37L20 35Z"
        fill={color} opacity={opacity}
      />
    </svg>
  );
}

function AdinkraOdo({ size = 40, color = C.goldRich }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="20" stroke={color} strokeWidth="1.5" fill="none" opacity="0.45" />
      <path d="M25 8 C16 8, 8 16, 8 25 C8 34, 16 42, 25 42" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M25 8 C34 8, 42 16, 42 25 C42 34, 34 42, 25 42" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="25" cy="25" r="3.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function FloatingElements() {
  const items = [
    { type: "heart", x: "6%", y: "12%", size: 30, delay: 0, color: C.magBright },
    { type: "odo", x: "90%", y: "18%", size: 34, delay: 1.8, color: C.goldMed },
    { type: "sparkle", x: "15%", y: "28%", size: 14, delay: 0.5, color: C.goldBright },
    { type: "heart", x: "85%", y: "60%", size: 24, delay: 2.5, color: C.goldRich },
    { type: "odo", x: "8%", y: "72%", size: 28, delay: 3.2, color: C.magBright },
    { type: "sparkle", x: "92%", y: "42%", size: 12, delay: 1.2, color: C.goldBright },
    { type: "sparkle", x: "50%", y: "8%", size: 16, delay: 2, color: C.goldBright },
    { type: "sparkle", x: "78%", y: "82%", size: 10, delay: 3.8, color: C.goldBright },
    { type: "petal", x: "20%", y: "45%", size: 18, delay: 0.8, color: C.magPale },
    { type: "petal", x: "80%", y: "35%", size: 18, delay: 2.2, color: C.magPale },
    { type: "petal", x: "35%", y: "80%", size: 18, delay: 4, color: C.magPale },
  ];
  return (
    <>
      {items.map((it, i) => (
        <div key={i} style={{
          position: "absolute", left: it.x, top: it.y, pointerEvents: "none", zIndex: 0,
          animation: it.type === "sparkle" ? `sparkle 3.5s ease-in-out ${it.delay}s infinite`
            : it.type === "petal" ? `floatPetal 8s ease-in-out ${it.delay}s infinite`
            : `bobble 6s ease-in-out ${it.delay}s infinite`,
        }}>
          {it.type === "heart" && <AdinkraHeart size={it.size} color={it.color} />}
          {it.type === "odo" && <AdinkraOdo size={it.size} color={it.color} />}
          {it.type === "sparkle" && (
            <span style={{ fontSize: it.size, color: C.goldBright, display: "block" }}>✦</span>
          )}
          {it.type === "petal" && (
            <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
              <ellipse cx="9" cy="12" rx="5" ry="10" fill={C.magPale} opacity="0.5" transform="rotate(-20 9 12)" />
              <ellipse cx="9" cy="12" rx="3" ry="7" fill={C.magBright} opacity="0.15" transform="rotate(-20 9 12)" />
            </svg>
          )}
        </div>
      ))}
    </>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 2,
    dur: 2.5 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    color: [C.magDeep, C.magBright, C.goldRich, C.goldBright, C.oceanTeal, C.magPale][i % 6],
    shape: i % 3 === 0 ? "circle" : "rect",
    rot: Math.random() * 360,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.left}%`, top: "-20px",
          width: p.size, height: p.shape === "circle" ? p.size : p.size * 1.5,
          borderRadius: p.shape === "circle" ? "50%" : "2px",
          backgroundColor: p.color,
          animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
          opacity: 0,
          transform: `rotate(${p.rot}deg)`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   FORM COMPONENTS
   ═══════════════════════════════════════════ */
function FormField({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{ display: "block", fontSize: 17, fontWeight: 600, color: C.magDeep, marginBottom: 8, fontFamily: font.body, letterSpacing: "0.01em" }}>
        {label}{required && <span style={{ color: C.magBright, marginLeft: 4 }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 15, color: C.silver, margin: "0 0 8px", fontFamily: font.body }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputBase: React.CSSProperties = {
  width: "100%", padding: "15px 18px", fontSize: 17, lineHeight: 1.5, fontFamily: font.body,
  border: "2px solid #E0D4DA", borderRadius: 12, backgroundColor: "#FFFBF8",
  color: C.charcoal, outline: "none", transition: "border-color 0.3s, box-shadow 0.3s",
};

function TextInput({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? C.goldRich : "#E0D4DA",
        boxShadow: focused ? `0 0 0 3px rgba(200,150,12,0.2)` : "none",
      }}
    />
  );
}

function RadioCard({
  label, sublabel, selected, onClick,
}: {
  label: string; sublabel?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", width: "100%",
        border: `2px solid ${selected ? C.goldRich : "#E0D4DA"}`, borderRadius: 12, cursor: "pointer",
        backgroundColor: selected ? "rgba(253,232,244,0.4)" : "#FFFBF8",
        transition: "all 0.25s", fontFamily: font.body, fontSize: 17, color: C.charcoal, textAlign: "left",
        boxShadow: selected ? `0 0 0 3px rgba(200,150,12,0.2)` : "none",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(30,12,22,0.08)"; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      {selected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: C.goldRich, borderRadius: "12px 0 0 12px" }} />}
      <div style={{
        width: 26, height: 26, borderRadius: "50%", border: `2px solid ${selected ? C.goldRich : "#C4B8BF"}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.25s",
      }}>
        {selected && <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: C.goldRich }} />}
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 14, color: C.silver, marginTop: 2 }}>{sublabel}</div>}
      </div>
    </button>
  );
}

function AccommodationCard({
  accommodation, selected, onClick,
}: {
  accommodation: Accommodation; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14, padding: "18px", width: "100%",
        border: `2px solid ${selected ? C.goldRich : "#E0D4DA"}`, borderRadius: 12, cursor: "pointer",
        backgroundColor: selected ? "rgba(253,232,244,0.4)" : "#FFFBF8",
        transition: "all 0.25s", fontFamily: font.body, textAlign: "left",
        boxShadow: selected ? `0 0 0 3px rgba(200,150,12,0.2)` : "none",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(30,12,22,0.08)"; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      {selected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: C.goldRich, borderRadius: "12px 0 0 12px" }} />}
      <div style={{
        width: 26, height: 26, borderRadius: "50%", border: `2px solid ${selected ? C.goldRich : "#C4B8BF"}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transition: "all 0.25s",
      }}>
        {selected && <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: C.goldRich }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: selected ? C.magDeep : C.charcoal, lineHeight: 1.2 }}>
              {accommodation.room_type}
            </div>
            <div style={{ fontSize: 13, color: C.silver, marginTop: 2 }}>{accommodation.hotel_name}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{
              fontSize: 20, fontWeight: 800, lineHeight: 1.1, fontFamily: font.heading,
              background: `linear-gradient(135deg, ${C.goldRich}, ${C.goldMed})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              {formatPrice(accommodation.price_per_night, accommodation.currency)}
            </div>
            <div style={{ fontSize: 12, color: C.silver, marginTop: 1 }}>per night</div>
          </div>
        </div>
        {accommodation.description && (
          <div style={{ fontSize: 14, color: "#6B5060", marginTop: 8, lineHeight: 1.5 }}>
            {accommodation.description}
          </div>
        )}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8,
          fontSize: 13, color: C.silver,
          background: selected ? "rgba(156,0,82,0.07)" : "#F8F0F4",
          borderRadius: 6, padding: "3px 8px",
        }}>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z" />
          </svg>
          Up to {accommodation.max_guests} {accommodation.max_guests === 1 ? "guest" : "guests"}
        </div>
      </div>
    </button>
  );
}

function CounterInput({ value, onChange, min = 1, max = 10 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${C.goldRich}`, backgroundColor: C.cream, color: C.magDeep, fontSize: 24, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", lineHeight: 1 }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.magDeep; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.cream; e.currentTarget.style.color = C.magDeep; }}
      >−</button>
      <span style={{ fontSize: 32, fontWeight: 700, color: C.magDeep, minWidth: 44, textAlign: "center", fontFamily: font.heading }}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${C.goldRich}`, backgroundColor: C.cream, color: C.magDeep, fontSize: 24, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", lineHeight: 1 }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.magDeep; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.cream; e.currentTarget.style.color = C.magDeep; }}
      >+</button>
      <span style={{ fontSize: 16, color: C.silver, fontFamily: font.body }}>{value === 1 ? "guest" : "guests"}</span>
    </div>
  );
}

function SectionDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "8px 0 28px", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.goldRich}30, transparent)` }} />
    </div>
  );
}

function GradientButton({
  children, onClick, disabled, loading,
}: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; loading?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "20px 24px", fontSize: 18, fontWeight: 700, fontFamily: font.body,
        color: disabled ? "#B8A8B0" : "#fff", letterSpacing: "0.1em", textTransform: "uppercase",
        background: disabled ? "#E8DEE3" : `linear-gradient(135deg, ${C.magDeep}, ${C.magMed})`,
        border: "none", borderRadius: 14, cursor: disabled ? "not-allowed" : "pointer",
        position: "relative", overflow: "hidden", transition: "all 0.3s",
        boxShadow: disabled ? "none" : hov ? `0 8px 32px rgba(156,0,82,0.35)` : `0 4px 20px rgba(156,0,82,0.2)`,
        transform: hov && !disabled ? "translateY(-1px)" : "none",
      }}
    >
      {!disabled && (
        <div style={{
          position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          animation: hov ? "shineSwipe 0.8s ease-out" : "none",
          pointerEvents: "none",
        }} />
      )}
      <span style={{ position: "relative", zIndex: 1 }}>{loading ? "Sending..." : children}</span>
    </button>
  );
}

function ProgressDots({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
      {steps.map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: i <= current ? 10 : 8, height: i <= current ? 10 : 8, borderRadius: "50%",
            backgroundColor: i <= current ? C.goldRich : "#E0D4DA",
            transition: "all 0.4s ease",
            boxShadow: i === current ? `0 0 0 3px rgba(200,150,12,0.25)` : "none",
          }} />
          {i < steps.length - 1 && (
            <div style={{ width: 20, height: 1, backgroundColor: i < current ? C.goldRich : "#E0D4DA", transition: "all 0.4s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function RSVPPage() {
  const [form, setForm] = useState<FormState>({
    fullName: "", email: "", phone: "", attending: "",
    guestCount: 1, arrivingEarly: "", accommodationId: null, needsAccommodation: "",
    stayingForDinner: "", dietaryNotes: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 150); }, []);

  useEffect(() => {
    fetch("/api/accommodations")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAccommodations(d.accommodations); })
      .catch(() => {});
  }, []);

  const up = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  function selectAccommodation(id: number) {
    setForm((f) => ({ ...f, accommodationId: id, needsAccommodation: "yes" }));
  }

  const progressStep = form.attending === "" ? 0
    : form.attending === "no" ? 4
    : form.arrivingEarly === "" ? 1
    : form.stayingForDinner === "" ? 2
    : 3 + (form.message ? 1 : 0);

  const canSubmit = !!(form.fullName.trim() && form.attending);

  async function handleSubmit() {
    if (!canSubmit) return;
    setApiError(""); setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email || null,
          phone: form.phone || null,
          attending: form.attending,
          guest_count: form.guestCount,
          arriving_early: form.arrivingEarly || null,
          needs_accommodation: form.needsAccommodation || null,
          accommodation_id: form.accommodationId,
          staying_for_dinner: form.stayingForDinner || null,
          dietary_notes: form.dietaryNotes || null,
          message: form.message || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        if (form.attending === "yes") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setApiError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedAcc = accommodations.find((a) => a.id === form.accommodationId) ?? null;

  function confirmationAccommodationLabel() {
    if (selectedAcc) return `${selectedAcc.room_type} — ${selectedAcc.hotel_name} (${formatPrice(selectedAcc.price_per_night, selectedAcc.currency)}/night)`;
    if (form.needsAccommodation === "yes") return "Arrangement requested";
    if (form.needsAccommodation === "no") return "Own arrangements";
    return "—";
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.warmWhite, fontFamily: font.body, color: C.charcoal, overflowX: "hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {showConfetti && <Confetti />}
      <KenteStrip />

      {/* ────── HERO ────── */}
      <section style={{
        position: "relative", minHeight: submitted ? "auto" : "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "60px 24px 80px", textAlign: "center", overflow: "hidden",
      }}>
        <WeddingBgPattern />
        {!submitted && <WaveDecoration />}
        {!submitted && <FloatingElements />}

        <div style={{
          position: "relative", zIndex: 1, maxWidth: 720,
          animation: visible ? "fadeUp 1.1s ease-out" : "none",
          opacity: visible ? 1 : 0,
        }}>
          {submitted ? (
            /* ── CONFIRMATION ── */
            <div style={{ animation: "scaleIn 0.7s ease-out" }}>
              <AdinkraHeart size={56} color={form.attending === "yes" ? C.magBright : C.goldRich} opacity={0.8} />
              <h1 style={{
                fontFamily: font.heading, fontSize: "clamp(36px, 8vw, 52px)", fontWeight: 600,
                color: C.magDeep, lineHeight: 1.15, margin: "20px 0 28px",
              }}>
                {form.attending === "yes" ? "We Can't Wait To See You!" : "We'll Miss You!"}
              </h1>

              {/* Summary card */}
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: `0 4px 40px rgba(156,0,82,0.08)`, maxWidth: 480, margin: "0 auto 24px", textAlign: "left" }}>
                <div style={{ height: 6, background: `linear-gradient(90deg, ${C.magDeep}, ${C.magBright}, ${C.goldRich})` }} />
                <div style={{ padding: "28px 28px 32px" }}>
                  <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.2em", color: C.silver, marginBottom: 16 }}>Your RSVP Summary</p>
                  {([
                    ["Name", form.fullName],
                    ["Attending", form.attending === "yes" ? "✓ Joyfully Accepted" : "Regretfully Declined"],
                    form.attending === "yes" ? ["Guests", String(form.guestCount)] : null,
                    form.attending === "yes" ? ["Arrival", form.arrivingEarly === "yes" ? "Friday, 1st May" : "Saturday, 2nd May"] : null,
                    form.attending === "yes" && form.arrivingEarly === "yes" ? ["Accommodation", confirmationAccommodationLabel()] : null,
                    form.attending === "yes" && form.stayingForDinner ? ["Reception Lunch", form.stayingForDinner === "yes" ? "Staying for lunch" : "Meal packed to take home"] : null,
                    form.attending === "yes" && form.dietaryNotes ? ["Dietary Notes", form.dietaryNotes] : null,
                    form.message ? ["Message", form.message] : null,
                  ] as ([string, string] | null)[]).filter((row): row is [string, string] => row !== null).map(([label, val], i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.magPale}` }}>
                      <span style={{ fontWeight: 600, color: C.magDeep, minWidth: 120, fontSize: 15 }}>{label}</span>
                      <span style={{ color: C.charcoal, fontSize: 15, lineHeight: 1.5 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event card */}
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: `0 4px 30px rgba(200,150,12,0.08)`, maxWidth: 480, margin: "0 auto" }}>
                <div style={{ height: 6, background: `linear-gradient(90deg, ${C.goldRich}, ${C.goldBright}, ${C.goldMed})` }} />
                <div style={{ padding: "24px 28px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.2em", color: C.silver, marginBottom: 12 }}>Event Details</p>
                  <p style={{ fontFamily: font.heading, fontSize: 20, fontWeight: 600, color: C.magDeep }}>Saturday, 2nd May 2026</p>
                  <p style={{ fontSize: 16, color: C.silver, marginTop: 4 }}>🏖️ Elmina Beach Resort</p>
                  <p style={{ fontSize: 15, color: C.silver, marginTop: 2 }}>Ceremony begins at 10:00 AM</p>
                </div>
              </div>
            </div>
          ) : (
            /* ── HERO CONTENT ── */
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 50, height: 1, backgroundColor: C.goldRich, opacity: 0.5 }} />
                <WeddingRings size={50} />
                <div style={{ width: 50, height: 1, backgroundColor: C.goldRich, opacity: 0.5 }} />
              </div>

              <p style={{ fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: C.silver, fontWeight: 500, marginBottom: 20 }}>
                You Are Invited To Celebrate
              </p>

              <h1 style={{
                fontFamily: font.heading, fontSize: "clamp(48px, 12vw, 82px)", fontWeight: 600, lineHeight: 1.05, marginBottom: 6,
                background: `linear-gradient(135deg, ${C.magDeep}, ${C.goldRich}, ${C.magMed}, ${C.goldMed})`,
                backgroundSize: "300% 300%", animation: "gradientPulse 8s ease infinite",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 16px rgba(156,0,82,0.12))",
              }}>
                Eyram
                <span style={{ fontStyle: "italic", fontWeight: 300, fontSize: "0.5em", margin: "0 6px", opacity: 0.85 }}>&amp;</span>
                Loretta
              </h1>

              <p style={{ fontFamily: font.heading, fontSize: "clamp(18px, 4vw, 24px)", fontStyle: "italic", color: C.magMed, fontWeight: 400, marginBottom: 28 }}>
                are getting married!
              </p>

              <div style={{
                fontSize: 17, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                background: `linear-gradient(90deg, ${C.magDeep}, ${C.goldRich}, ${C.magBright}, ${C.goldBright}, ${C.magDeep})`,
                backgroundSize: "300% auto", animation: "shimmer 4s linear infinite",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 10,
              }}>
                Saturday, 2nd May 2026
              </div>

              <p style={{ fontSize: 18, color: C.silver, marginBottom: 28 }}>🏖️ Elmina Beach Resort</p>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 32, color: C.goldRich, fontSize: 12, opacity: 0.6 }}>
                <span>✦</span><span>✦</span><span>✦</span>
              </div>

              <button
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "18px 52px", fontSize: 17, fontWeight: 700, fontFamily: font.body,
                  color: "#fff", background: `linear-gradient(135deg, ${C.magDeep}, ${C.magMed})`,
                  border: "none", borderRadius: 60, cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase",
                  boxShadow: `0 4px 28px rgba(156,0,82,0.25)`, position: "relative", overflow: "hidden", transition: "all 0.3s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 36px rgba(156,0,82,0.35)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 28px rgba(156,0,82,0.25)`; e.currentTarget.style.transform = "none"; }}
              >
                ✦ RSVP Now ✦
              </button>
            </>
          )}
        </div>
      </section>

      {/* ────── FORM ────── */}
      {!submitted && (
        <section ref={formRef} style={{ maxWidth: 620, margin: "0 auto", padding: "0 20px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 40 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.goldRich}50)` }} />
            <span style={{ fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: C.goldRich, fontWeight: 600, whiteSpace: "nowrap" }}>
              Kindly Respond
            </span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.goldRich}50)` }} />
          </div>

          <ProgressDots steps={["Details", "Attend", "Travel", "Lunch", "Message"]} current={progressStep} />

          <div style={{
            backgroundColor: "#fff", borderRadius: 24, overflow: "hidden",
            boxShadow: `0 2px 48px rgba(30,12,22,0.06), 0 1px 4px rgba(30,12,22,0.04)`,
            border: `1px solid rgba(200,150,12,0.1)`,
          }}>
            <div style={{ height: 6, background: `linear-gradient(90deg, ${C.magDeep}, ${C.goldRich}, ${C.magBright}, ${C.goldMed}, ${C.magDeep})`, backgroundSize: "300% 100%", animation: "gradientPulse 6s ease infinite" }} />

            <div style={{ padding: "40px 32px" }}>
              {/* Group 1: Personal */}
              <FormField label="Full Name" required>
                <TextInput value={form.fullName} onChange={(v) => up("fullName", v)} placeholder="Enter your full name" />
              </FormField>
              <FormField label="Email Address" hint="We'll send you event updates and details">
                <TextInput value={form.email} onChange={(v) => up("email", v)} placeholder="your.email@example.com" type="email" />
              </FormField>
              <FormField label="Phone Number" hint="In case we need to reach you">
                <TextInput value={form.phone} onChange={(v) => up("phone", v)} placeholder="+233 XX XXX XXXX" type="tel" />
              </FormField>

              <SectionDivider />

              {/* Group 2: Attendance */}
              <FormField label="Will you be attending?" required>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <RadioCard label="Joyfully Accept" sublabel="I will be there to celebrate" selected={form.attending === "yes"} onClick={() => up("attending", "yes")} />
                  <RadioCard label="Regretfully Decline" sublabel="I'm unable to attend" selected={form.attending === "no"} onClick={() => up("attending", "no")} />
                </div>
              </FormField>

              {form.attending === "yes" && (
                <div style={{ animation: "fadeUp 0.45s ease-out" }}>
                  <FormField label="Number of Guests" hint="Including yourself">
                    <CounterInput value={form.guestCount} onChange={(v) => up("guestCount", v)} />
                  </FormField>

                  <SectionDivider />

                  {/* Group 3: Arrival */}
                  <FormField label="Will you be arriving a day before the wedding?">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <RadioCard label="Yes, arriving Friday 1st May" sublabel="I'll be there the day before" selected={form.arrivingEarly === "yes"} onClick={() => up("arrivingEarly", "yes")} />
                      <RadioCard label="No, arriving Saturday 2nd May" sublabel="I'll come on the wedding day" selected={form.arrivingEarly === "no"} onClick={() => up("arrivingEarly", "no")} />
                    </div>
                  </FormField>

                  {form.arrivingEarly === "yes" && (
                    <div style={{ animation: "fadeUp 0.45s ease-out" }}>
                      <FormField label="Accommodation" hint={accommodations.length > 0 ? "Select a room — the couple will confirm your reservation" : "Do you need help with a place to stay?"}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {accommodations.length > 0 ? (
                            <>
                              {accommodations.map((acc) => (
                                <AccommodationCard
                                  key={acc.id}
                                  accommodation={acc}
                                  selected={form.accommodationId === acc.id}
                                  onClick={() => selectAccommodation(acc.id)}
                                />
                              ))}
                              <RadioCard
                                label="I'll arrange my own accommodation"
                                sublabel="I've made my own arrangements"
                                selected={form.needsAccommodation === "no" && form.accommodationId === null}
                                onClick={() => setForm((f) => ({ ...f, accommodationId: null, needsAccommodation: "no" }))}
                              />
                            </>
                          ) : (
                            <>
                              <RadioCard label="Please arrange accommodation for me" sublabel="I would like help with a place to stay" selected={form.needsAccommodation === "yes"} onClick={() => setForm((f) => ({ ...f, needsAccommodation: "yes", accommodationId: null }))} />
                              <RadioCard label="I already have accommodation" sublabel="I've made my own arrangements" selected={form.needsAccommodation === "no"} onClick={() => setForm((f) => ({ ...f, needsAccommodation: "no", accommodationId: null }))} />
                            </>
                          )}
                        </div>
                      </FormField>
                    </div>
                  )}

                  <SectionDivider />

                  {/* Group 4: Lunch */}
                  <FormField label="Will you stay for the reception lunch?">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <RadioCard label="Yes, I'll stay for lunch" sublabel="I'd love to dine and celebrate with everyone" selected={form.stayingForDinner === "yes"} onClick={() => up("stayingForDinner", "yes")} />
                      <RadioCard label="I'd love my meal packed to take home" sublabel="I'll be heading off after the ceremony — a takeaway would be lovely" selected={form.stayingForDinner === "no"} onClick={() => up("stayingForDinner", "no")} />
                    </div>
                  </FormField>

                  {form.stayingForDinner === "yes" && (
                    <div style={{ animation: "fadeUp 0.45s ease-out" }}>
                      <FormField label="Dietary Requirements" hint="Allergies, vegetarian, halal, etc.">
                        <textarea
                          value={form.dietaryNotes}
                          onChange={(e) => up("dietaryNotes", e.target.value)}
                          placeholder="Let us know of any dietary needs..."
                          rows={3}
                          style={{ ...inputBase, resize: "vertical", minHeight: 90 }}
                          onFocus={(e) => { e.target.style.borderColor = C.goldRich; e.target.style.boxShadow = `0 0 0 3px rgba(200,150,12,0.2)`; }}
                          onBlur={(e) => { e.target.style.borderColor = "#E0D4DA"; e.target.style.boxShadow = "none"; }}
                        />
                      </FormField>
                    </div>
                  )}

                  <SectionDivider />
                </div>
              )}

              {/* Group 5: Message */}
              {form.attending && (
                <div style={{ animation: "fadeUp 0.45s ease-out" }}>
                  <FormField label="Message for the Couple" hint="Share your well-wishes (optional)">
                    <textarea
                      value={form.message}
                      onChange={(e) => up("message", e.target.value)}
                      placeholder="Write a message for Eyram & Loretta..."
                      rows={4}
                      style={{ ...inputBase, resize: "vertical", minHeight: 110 }}
                      onFocus={(e) => { e.target.style.borderColor = C.goldRich; e.target.style.boxShadow = `0 0 0 3px rgba(200,150,12,0.2)`; }}
                      onBlur={(e) => { e.target.style.borderColor = "#E0D4DA"; e.target.style.boxShadow = "none"; }}
                    />
                  </FormField>
                </div>
              )}

              {/* Submit */}
              <div style={{ marginTop: 8 }}>
                <GradientButton onClick={handleSubmit} disabled={!canSubmit || loading} loading={loading}>
                  ✦ Send RSVP ✦
                </GradientButton>
              </div>

              {!canSubmit && (form.fullName || form.attending) && (
                <p style={{ textAlign: "center", fontSize: 15, color: C.magBright, marginTop: 14 }}>
                  Please fill in your name and select your attendance to continue.
                </p>
              )}
              {apiError && (
                <p style={{ textAlign: "center", fontSize: 15, color: C.magBright, marginTop: 14 }}>
                  {apiError}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 48, paddingBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <span style={{ color: C.goldRich, fontSize: 14 }}>✦</span>
              <AdinkraOdo size={28} color={C.goldRich} />
              <span style={{ color: C.goldRich, fontSize: 14 }}>✦</span>
            </div>
            <p style={{ fontSize: 15, color: C.silver, fontStyle: "italic", lineHeight: 1.6 }}>
              &ldquo;Odo nnyew fie kwan&rdquo; — Love never loses its way home
            </p>
            <p style={{ fontSize: 13, color: "#C4B4BF", marginTop: 8 }}>Eyram &amp; Loretta · May 2026</p>
          </div>
        </section>
      )}

      {!submitted && <KenteStrip />}
    </div>
  );
}

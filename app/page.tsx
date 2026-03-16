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

function normalizeAccommodation(raw: any): Accommodation {
  return {
    ...raw,
    id: Number(raw?.id),
    price_per_night: Number(raw?.price_per_night),
    max_guests: Number(raw?.max_guests),
    available: Number(raw?.available),
  };
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
  /* ── Event palette (pastel dress code) ── */
  beige: "#F5ECD7",
  seaBlue: "#A8DCEA",
  oceanBlue: "#93B8E5",
  sageGreen: "#B8D4A8",
  lilac: "#D8C0EC",
  blushMagenta: "#F2A8CC",
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
@keyframes floatBride {
  0%,100% { transform: translateY(0px) translateX(0px) rotate(-1.5deg); }
  18%  { transform: translateY(-22px) translateX(7px)  rotate(0.8deg);  }
  38%  { transform: translateY(-9px)  translateX(-4px) rotate(-2.5deg); }
  58%  { transform: translateY(-28px) translateX(10px) rotate(1.2deg);  }
  78%  { transform: translateY(-6px)  translateX(-7px) rotate(-0.6deg); }
}
@keyframes floatGroom {
  0%,100% { transform: translateY(0px) translateX(0px) rotate(1.5deg);  }
  15%  { transform: translateY(-18px) translateX(-8px) rotate(-0.8deg); }
  35%  { transform: translateY(-28px) translateX(5px)  rotate(2.2deg);  }
  55%  { transform: translateY(-10px) translateX(-5px) rotate(-1.4deg); }
  75%  { transform: translateY(-24px) translateX(9px)  rotate(0.7deg);  }
}
@keyframes glowOrb {
  0%,100% { opacity: 0.14; transform: scale(1);    }
  50%     { opacity: 0.28; transform: scale(1.12); }
}
@keyframes heroEntrance {
  0%   { opacity: 0; transform: translateY(40px) scale(0.94); }
  100% { opacity: 1; transform: translateY(0px)  scale(1);    }
}
@keyframes driftStar {
  0%   { opacity: 0; transform: translateY(0px)  scale(0.4) rotate(0deg);   }
  30%  { opacity: 1; }
  70%  { opacity: 0.7; }
  100% { opacity: 0; transform: translateY(-60px) scale(1.2) rotate(360deg); }
}

/* ── corner roaming: couple starts bottom-left, counter-clockwise ── */
@keyframes roamC1 {
  0%   { transform:translate(0,0) rotate(0deg);            animation-timing-function:cubic-bezier(.4,0,.2,1); }
  17%  { transform:translate(0,calc(140px - 100vh)) rotate(-3deg); animation-timing-function:linear; }
  25%  { transform:translate(0,calc(140px - 100vh)) rotate(0deg);  animation-timing-function:cubic-bezier(.4,0,.2,1); }
  42%  { transform:translate(calc(100vw - 210px),calc(140px - 100vh)) rotate(3deg);  animation-timing-function:linear; }
  50%  { transform:translate(calc(100vw - 210px),calc(140px - 100vh)) rotate(0deg);  animation-timing-function:cubic-bezier(.4,0,.2,1); }
  67%  { transform:translate(calc(100vw - 210px),0) rotate(-3deg); animation-timing-function:linear; }
  75%  { transform:translate(calc(100vw - 210px),0) rotate(0deg);  animation-timing-function:cubic-bezier(.4,0,.2,1); }
  92%  { transform:translate(0,0) rotate(3deg);             animation-timing-function:linear; }
  100% { transform:translate(0,0) rotate(0deg); }
}

/* ── corner roaming: charm starts top-right, clockwise ── */
@keyframes roamC2 {
  0%   { transform:translate(0,0);                                       animation-timing-function:cubic-bezier(.4,0,.2,1); }
  17%  { transform:translate(0,calc(100vh - 158px));                     animation-timing-function:linear; }
  25%  { transform:translate(0,calc(100vh - 158px));                     animation-timing-function:cubic-bezier(.4,0,.2,1); }
  42%  { transform:translate(calc(160px - 100vw),calc(100vh - 158px));   animation-timing-function:linear; }
  50%  { transform:translate(calc(160px - 100vw),calc(100vh - 158px));   animation-timing-function:cubic-bezier(.4,0,.2,1); }
  67%  { transform:translate(calc(160px - 100vw),0);                     animation-timing-function:linear; }
  75%  { transform:translate(calc(160px - 100vw),0);                     animation-timing-function:cubic-bezier(.4,0,.2,1); }
  92%  { transform:translate(0,0);                                       animation-timing-function:linear; }
  100% { transform:translate(0,0); }
}

/* ── charm inner spin ── */
@keyframes charmSpin {
  0%   { transform:rotate(0deg)   scale(1); }
  45%  { transform:rotate(170deg) scale(1.08); }
  50%  { transform:rotate(180deg) scale(1.08); }
  95%  { transform:rotate(350deg) scale(1); }
  100% { transform:rotate(360deg) scale(1); }
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
function KenteStrip({ id = "kenteWeave" }: { id?: string }) {
  return (
    <svg width="100%" height="12" style={{ display: "block" }}>
      <defs>
        <pattern id={id} x="0" y="0" width="72" height="12" patternUnits="userSpaceOnUse">
          <rect x="0"  y="0" width="12" height="6" fill={C.magDeep}       />
          <rect x="12" y="0" width="12" height="6" fill={C.seaBlue}       />
          <rect x="24" y="0" width="12" height="6" fill={C.oceanBlue}     />
          <rect x="36" y="0" width="12" height="6" fill={C.sageGreen}     />
          <rect x="48" y="0" width="12" height="6" fill={C.lilac}         />
          <rect x="60" y="0" width="12" height="6" fill={C.beige}         />
          <rect x="0"  y="6" width="12" height="6" fill={C.beige}         />
          <rect x="12" y="6" width="12" height="6" fill={C.lilac}         />
          <rect x="24" y="6" width="12" height="6" fill={C.sageGreen}     />
          <rect x="36" y="6" width="12" height="6" fill={C.oceanBlue}     />
          <rect x="48" y="6" width="12" height="6" fill={C.seaBlue}       />
          <rect x="60" y="6" width="12" height="6" fill={C.magDeep}       />
          <rect x="2"  y="2" width="8"  height="1" fill="rgba(255,255,255,0.18)" />
          <rect x="26" y="2" width="8"  height="1" fill="rgba(255,255,255,0.14)" />
          <rect x="50" y="8" width="8"  height="1" fill="rgba(255,255,255,0.14)" />
          <rect x="14" y="8" width="8"  height="1" fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill={`url(#${id})`} />
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

/* ── Wedding couple SVG ── */
function ChibiCouple() {
  return (
    <svg
      style={{ width: "min(46vw, 190px)", height: "auto", display: "block" }}
      viewBox="0 0 900 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >

      <defs>
        <linearGradient id="cplBgGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF7D6"/>
          <stop offset="100%" stopColor="#FFE08A"/>
        </linearGradient>
        <linearGradient id="cplSuit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2A2E3D"/>
          <stop offset="100%" stopColor="#151826"/>
        </linearGradient>
        <linearGradient id="cplDress" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#F2F4FA"/>
        </linearGradient>
        <linearGradient id="cplSkinM" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A85D35"/>
          <stop offset="100%" stopColor="#8B4C2A"/>
        </linearGradient>
        <linearGradient id="cplSkinF" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B7663E"/>
          <stop offset="100%" stopColor="#9A5632"/>
        </linearGradient>
        <filter id="cplShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.12"/>
        </filter>
        <style>{`
          .cpl-main { animation: cplMain 5.6s ease-in-out infinite; transform-origin: center; }
          .cpl-groom { animation: cplGroom 4.8s ease-in-out infinite; transform-origin: 250px 270px; }
          .cpl-bride { animation: cplBride 5.2s ease-in-out infinite; transform-origin: 625px 270px; }
          .cpl-spark { animation: cplSpark 2.4s ease-in-out infinite; }
          .cpl-spark.d1 { animation-delay: 0.3s; }
          .cpl-spark.d2 { animation-delay: 0.8s; }
          .cpl-spark.d3 { animation-delay: 1.2s; }
          .cpl-spark.d4 { animation-delay: 1.7s; }
          .cpl-shL { animation: cplShL 4.8s ease-in-out infinite; transform-origin: 210px 470px; }
          .cpl-shR { animation: cplShR 5.2s ease-in-out infinite; transform-origin: 660px 475px; }
          @keyframes cplMain  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
          @keyframes cplGroom { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-16px) rotate(1deg)} }
          @keyframes cplBride { 0%,100%{transform:translateY(0) rotate(1deg)}  50%{transform:translateY(-20px) rotate(-1deg)} }
          @keyframes cplSpark { 0%,100%{opacity:.55;transform:scale(.95)} 50%{opacity:1;transform:scale(1.15)} }
          @keyframes cplShL   { 0%,100%{transform:scaleX(1);opacity:.18} 50%{transform:scaleX(.9);opacity:.1} }
          @keyframes cplShR   { 0%,100%{transform:scaleX(1);opacity:.18} 50%{transform:scaleX(.88);opacity:.1} }
        `}</style>
      </defs>

      <g className="cpl-main">
        <circle cx="450" cy="80" r="22" fill="url(#cplBgGlow)" opacity="0.95"/>
        <g className="cpl-spark">
          <path d="M126 128L132 144L148 150L132 156L126 172L120 156L104 150L120 144L126 128Z" fill="#F6C453"/>
        </g>
        <g className="cpl-spark d1">
          <path d="M208 92L214 104L226 110L214 116L208 128L202 116L190 110L202 104L208 92Z" fill="#F6C453"/>
        </g>
        <g className="cpl-spark d2">
          <path d="M352 62L358 74L370 80L358 86L352 98L346 86L334 80L346 74L352 62Z" fill="#F6C453"/>
        </g>
        <g className="cpl-spark d3">
          <path d="M716 112L722 128L738 134L722 140L716 156L710 140L694 134L710 128L716 112Z" fill="#F6C453"/>
        </g>
        <g className="cpl-spark d4">
          <path d="M798 84L804 96L816 102L804 108L798 120L792 108L780 102L792 96L798 84Z" fill="#F6C453"/>
        </g>

        <ellipse className="cpl-shL" cx="210" cy="470" rx="88" ry="18" fill="#7580A4" opacity="0.18"/>
        <ellipse className="cpl-shR" cx="660" cy="475" rx="96" ry="18" fill="#7580A4" opacity="0.18"/>

        {/* ── GROOM ── */}
        <g className="cpl-groom" filter="url(#cplShadow)">
          <path d="M196 328C212 326 226 326 242 328L230 408C228 425 217 438 201 440C186 442 176 432 178 416L196 328Z" fill="url(#cplSuit)"/>
          <path d="M244 328C261 327 276 329 290 334L282 412C280 431 268 448 250 449C235 450 225 438 227 420L244 328Z" fill="url(#cplSuit)"/>
          <path d="M170 438C183 433 199 432 214 435C221 436 224 444 220 450C212 461 190 462 172 456C166 454 164 442 170 438Z" fill="#1A1C26"/>
          <path d="M234 448C248 442 266 442 282 446C289 448 291 456 286 461C278 469 257 469 239 465C232 463 229 452 234 448Z" fill="#1A1C26"/>
          <path d="M182 188C208 170 265 169 294 188L314 294C316 309 306 322 291 322H184C169 322 158 309 160 294L182 188Z" fill="url(#cplSuit)"/>
          <path d="M216 196H259C271 196 281 206 281 219V312H194V219C194 206 204 196 216 196Z" fill="#1D2130"/>
          <circle cx="238" cy="230" r="4" fill="#0E1119"/>
          <circle cx="238" cy="254" r="4" fill="#0E1119"/>
          <circle cx="238" cy="278" r="4" fill="#0E1119"/>
          <path d="M215 190C222 182 253 182 260 190L253 220H222L215 190Z" fill="#FFFFFF"/>
          <path d="M182 188L222 214L210 266L176 248L182 188Z" fill="#111522"/>
          <path d="M294 188L253 214L266 266L300 248L294 188Z" fill="#111522"/>
          <path d="M222 191L238 212L253 191L246 182H229L222 191Z" fill="#FFFFFF"/>
          <path d="M226 212L214 206C208 203 202 210 205 216L210 226L226 220V212Z" fill="#0F1015"/>
          <path d="M250 212L262 206C268 203 274 210 271 216L266 226L250 220V212Z" fill="#0F1015"/>
          <ellipse cx="238" cy="216" rx="8" ry="6" fill="#0A0B10"/>
          <path d="M167 209C145 217 128 234 116 258C111 268 116 281 126 284L152 291L181 243L167 209Z" fill="url(#cplSuit)"/>
          <path d="M308 209C330 217 347 234 359 258C364 268 359 281 349 284L323 291L294 243L308 209Z" fill="url(#cplSuit)"/>
          <circle cx="111" cy="267" r="18" fill="url(#cplSkinM)"/>
          <circle cx="364" cy="267" r="18" fill="url(#cplSkinM)"/>
          <rect x="225" y="160" width="26" height="24" rx="10" fill="url(#cplSkinM)"/>
          <circle cx="238" cy="121" r="54" fill="url(#cplSkinM)"/>
          <circle cx="186" cy="127" r="10" fill="url(#cplSkinM)"/>
          <circle cx="290" cy="127" r="10" fill="url(#cplSkinM)"/>
          <path d="M187 120C188 86 209 66 239 66C270 66 291 87 289 118C279 98 258 92 238 92C217 92 198 100 187 120Z" fill="#171515"/>
          <path d="M193 101C209 78 266 77 282 100C265 88 211 88 193 101Z" fill="#1D1B1B"/>
          <path d="M202 141C206 167 220 182 238 182C255 182 270 167 274 141C264 161 253 170 238 170C222 170 210 161 202 141Z" fill="#1B1716"/>
          <ellipse cx="218" cy="121" rx="8" ry="10" fill="#FFFFFF"/>
          <ellipse cx="257" cy="121" rx="8" ry="10" fill="#FFFFFF"/>
          <circle cx="218" cy="123" r="5" fill="#161616"/>
          <circle cx="257" cy="123" r="5" fill="#161616"/>
          <circle cx="220" cy="121" r="1.7" fill="#FFFFFF"/>
          <circle cx="259" cy="121" r="1.7" fill="#FFFFFF"/>
          <path d="M207 104C214 100 222 99 229 101" stroke="#1E1715" strokeWidth="4" strokeLinecap="round"/>
          <path d="M247 101C254 99 262 100 269 104" stroke="#1E1715" strokeWidth="4" strokeLinecap="round"/>
          <path d="M238 127C234 137 235 145 240 149" stroke="#7A482A" strokeWidth="3.2" strokeLinecap="round"/>
          <path d="M220 154C228 162 247 162 256 153" stroke="#6E3C25" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="292" cy="214" r="12" fill="#F6D95D"/>
          <circle cx="292" cy="214" r="7"  fill="#FFF4B0"/>
          <path d="M301 220L313 232" stroke="#6BAA55" strokeWidth="4" strokeLinecap="round"/>
          <path d="M299 224L306 234" stroke="#6BAA55" strokeWidth="3" strokeLinecap="round"/>
          <path d="M282 239L295 235L297 248L284 245L282 239Z" fill="#FFFFFF"/>
        </g>

        {/* ── BRIDE ── */}
        <g className="cpl-bride" filter="url(#cplShadow)">
          <path d="M578 282C606 250 653 245 687 272C709 290 718 321 716 360C713 411 676 445 626 445C576 445 536 410 534 360C533 330 547 302 578 282Z" fill="url(#cplDress)"/>
          <path d="M596 296C584 327 582 355 590 390" stroke="#E2E6F0" strokeWidth="4" strokeLinecap="round"/>
          <path d="M628 286C621 327 621 370 629 418" stroke="#E2E6F0" strokeWidth="4" strokeLinecap="round"/>
          <path d="M661 295C671 326 674 356 668 391" stroke="#E2E6F0" strokeWidth="4" strokeLinecap="round"/>
          <path d="M562 397C575 388 588 392 598 404" stroke="#D9DEEA" strokeWidth="3" strokeLinecap="round"/>
          <path d="M646 410C656 400 672 399 683 409" stroke="#D9DEEA" strokeWidth="3" strokeLinecap="round"/>
          <path d="M604 425C616 415 632 417 641 429" stroke="#D9DEEA" strokeWidth="3" strokeLinecap="round"/>
          <path d="M584 189C605 174 645 174 667 189L681 273C682 284 674 294 663 294H588C577 294 569 284 570 273L584 189Z" fill="#FFFFFF"/>
          <path d="M594 199C610 189 641 189 656 199L666 270H584L594 199Z" fill="#F7F9FD"/>
          <path d="M605 214C613 209 620 210 627 216C635 209 643 209 651 214" stroke="#D8DDE8" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M598 234C606 228 615 229 622 235C630 228 639 228 647 235C654 229 661 229 668 235" stroke="#D8DDE8" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M576 188C560 193 545 205 537 220C531 232 537 245 550 248L571 252L585 220L576 188Z" fill="#FFFFFF"/>
          <path d="M674 188C690 193 705 205 713 220C719 232 713 245 700 248L679 252L665 220L674 188Z" fill="#FFFFFF"/>
          <path d="M553 225C538 233 524 244 512 257C503 266 500 279 510 286C519 292 531 289 540 281C553 269 564 254 573 239L553 225Z" fill="url(#cplSkinF)"/>
          <path d="M699 225C714 233 728 244 740 257C749 266 752 279 742 286C733 292 721 289 712 281C699 269 688 254 679 239L699 225Z" fill="url(#cplSkinF)"/>
          <circle cx="506" cy="282" r="15" fill="url(#cplSkinF)"/>
          <circle cx="746" cy="282" r="15" fill="url(#cplSkinF)"/>
          <rect x="614" y="157" width="24" height="24" rx="10" fill="url(#cplSkinF)"/>
          <circle cx="626" cy="122" r="54" fill="url(#cplSkinF)"/>
          <circle cx="576" cy="128" r="10" fill="url(#cplSkinF)"/>
          <circle cx="676" cy="128" r="10" fill="url(#cplSkinF)"/>
          <path d="M572 124C574 89 596 68 627 68C660 68 682 93 679 127C669 104 647 95 626 95C605 95 582 104 572 124Z" fill="#1A1716"/>
          <path d="M667 108C682 121 687 144 681 164C675 183 661 197 644 202C662 188 665 168 660 149C656 133 658 119 667 108Z" fill="#1A1716"/>
          <path d="M593 98C601 86 615 80 628 80C643 80 656 86 663 99" stroke="#2A2220" strokeWidth="4" strokeLinecap="round"/>
          <path d="M666 142C705 162 731 194 745 237C716 221 691 219 661 221L650 173L666 142Z" fill="#FFFFFF" opacity="0.68"/>
          <path d="M676 152C709 178 726 203 734 229" stroke="#DDE2EE" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
          <circle cx="673" cy="104" r="5"   fill="#FFFFFF"/>
          <circle cx="679" cy="112" r="4"   fill="#FFFFFF"/>
          <circle cx="686" cy="118" r="4"   fill="#FFFFFF"/>
          <circle cx="691" cy="126" r="3.5" fill="#FFFFFF"/>
          <circle cx="581" cy="142" r="4" fill="#E9EDF7"/>
          <path d="M581 145L581 157" stroke="#E9EDF7" strokeWidth="2"/>
          <circle cx="581" cy="160" r="5" fill="#FFFFFF"/>
          <ellipse cx="607" cy="122" rx="8" ry="10" fill="#FFFFFF"/>
          <ellipse cx="645" cy="122" rx="8" ry="10" fill="#FFFFFF"/>
          <circle cx="607" cy="124" r="5"   fill="#161616"/>
          <circle cx="645" cy="124" r="5"   fill="#161616"/>
          <circle cx="609" cy="122" r="1.7" fill="#FFFFFF"/>
          <circle cx="647" cy="122" r="1.7" fill="#FFFFFF"/>
          <path d="M596 105C603 101 611 100 618 102" stroke="#231B18" strokeWidth="4" strokeLinecap="round"/>
          <path d="M634 102C641 100 649 101 656 105" stroke="#231B18" strokeWidth="4" strokeLinecap="round"/>
          <path d="M626 128C622 138 623 146 628 150" stroke="#875032" strokeWidth="3" strokeLinecap="round"/>
          <path d="M607 154C616 162 636 162 646 153" stroke="#74402A" strokeWidth="4" strokeLinecap="round"/>
          <path d="M602 437C613 433 624 433 632 439C635 441 635 447 631 450C623 457 609 456 600 450C596 447 597 440 602 437Z" fill="#FDFDFE"/>
          <path d="M652 437C663 433 674 433 682 439C685 441 685 447 681 450C673 457 659 456 650 450C646 447 647 440 652 437Z" fill="#FDFDFE"/>
        </g>
      </g>
    </svg>
  );
}

/* ── Wedding charm ornament (rings + flowers) ── */
function WeddingCharm() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
      {/* soft bg glow */}
      <circle cx="65" cy="65" r="56" fill={C.magPale} opacity="0.55" style={{ animation: "glowOrb 4s ease-in-out infinite" }} />
      {/* dashed outer ring */}
      <circle cx="65" cy="65" r="53" fill="none" stroke={C.goldBright} strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />

      {/* wedding rings — right ring drawn first (behind) */}
      <circle cx="72" cy="70" r="21" fill="none" stroke={C.goldMed}  strokeWidth="6.5" />
      {/* left ring */}
      <circle cx="51" cy="70" r="21" fill="none" stroke={C.goldRich} strokeWidth="6.5" />
      {/* overlap arc: right ring in front of left ring at intersection */}
      <path d="M61.5 50.5 A21 21 0 0 1 61.5 89.5" fill="none" stroke={C.goldMed} strokeWidth="7" strokeLinecap="butt" />

      {/* diamond on left ring top */}
      <polygon points="51,47 55,52 51,57 47,52" fill={C.beige} opacity="0.9" />
      <polygon points="51,47 55,52 51,57 47,52" fill="none" stroke={C.goldBright} strokeWidth="0.8" opacity="0.7" />

      {/* heart floating above */}
      <path d="M65 40 C65 36 69.5 31 74 31 C78.5 31 82 35 82 40 C82 47 74 54 65 58 C56 54 48 47 48 40 C48 35 51.5 31 56 31 C60.5 31 65 36 65 40Z" fill={C.magBright} opacity="0.88" />
      <path d="M65 40 C65 36 69.5 31 74 31 C78.5 31 82 35 82 40 C82 47 74 54 65 58 C56 54 48 47 48 40 C48 35 51.5 31 56 31 C60.5 31 65 36 65 40Z" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" />

      {/* E · L monogram below rings */}
      <text x="61.5" y="103" fontSize="11" fill={C.magDeep} fontWeight="700" fontFamily="Georgia, serif" letterSpacing="2" opacity="0.85">E·L</text>

      {/* flowers at four corners */}
      <circle cx="19" cy="26" r="8"   fill={C.sageGreen}    opacity="0.72" />
      <circle cx="19" cy="26" r="4.5" fill={C.blushMagenta} />
      <circle cx="111" cy="26" r="8"  fill={C.lilac}        opacity="0.78" />
      <circle cx="111" cy="26" r="4.5" fill={C.goldBright}  opacity="0.92" />
      <circle cx="15"  cy="104" r="8" fill={C.seaBlue}      opacity="0.68" />
      <circle cx="15"  cy="104" r="4.5" fill={C.oceanBlue} />
      <circle cx="115" cy="104" r="8" fill={C.sageGreen}    opacity="0.72" />
      <circle cx="115" cy="104" r="4.5" fill={C.blushMagenta} />

      {/* sparkle 4-pointed stars */}
      <path d="M36 15 L38 21 L44 23 L38 25 L36 31 L34 25 L28 23 L34 21Z" fill={C.goldBright} opacity="0.82" />
      <path d="M94 17 L96 23 L102 25 L96 27 L94 33 L92 27 L86 25 L92 23Z" fill={C.goldBright} opacity="0.76" />

      {/* tiny dots */}
      <circle cx="65" cy="118" r="2.5" fill={C.goldBright} opacity="0.7" />
      <circle cx="9"  cy="65"  r="1.8" fill={C.lilac}      opacity="0.65" />
      <circle cx="121" cy="65" r="1.8" fill={C.seaBlue}    opacity="0.65" />
    </svg>
  );
}

/* ── Fixed corner roamers ── */
function CornerRoamers() {
  return (
    <>
      {/* Couple — bottom-left start, counter-clockwise orbit */}
      <div style={{
        position: "fixed", bottom: "0.75rem", left: "0.75rem",
        zIndex: 20, pointerEvents: "none",
        animation: "roamC1 32s ease-in-out infinite",
      }}>
        <div style={{
          animation: "floatBride 7s ease-in-out infinite",
          filter: "drop-shadow(0 10px 28px rgba(168,93,53,0.24)) drop-shadow(0 4px 12px rgba(156,0,82,0.14))",
        }}>
          <ChibiCouple />
        </div>
      </div>

      {/* Charm — top-right start, clockwise orbit */}
      <div style={{
        position: "fixed", top: "0.75rem", right: "0.75rem",
        zIndex: 20, pointerEvents: "none",
        animation: "roamC2 24s ease-in-out infinite",
        animationDelay: "-6s",
      }}>
        <div style={{
          animation: "charmSpin 12s linear infinite",
          filter: "drop-shadow(0 6px 18px rgba(200,150,12,0.30)) drop-shadow(0 3px 8px rgba(242,168,204,0.22))",
        }}>
          <WeddingCharm />
        </div>
      </div>
    </>
  );
}

/* ── Drifting star particles around the hero ── */
function HeroStars() {
  const stars = [
    { x: "8%",  y: "20%", s: 10, delay: 0,   dur: 4.5 },
    { x: "88%", y: "14%", s: 8,  delay: 1.2, dur: 5   },
    { x: "14%", y: "78%", s: 9,  delay: 2.4, dur: 4   },
    { x: "84%", y: "72%", s: 8,  delay: 0.8, dur: 5.5 },
    { x: "50%", y: "6%",  s: 7,  delay: 1.8, dur: 4.2 },
    { x: "22%", y: "52%", s: 6,  delay: 3,   dur: 4.8 },
    { x: "76%", y: "48%", s: 7,  delay: 0.4, dur: 5.2 },
    { x: "36%", y: "88%", s: 6,  delay: 2,   dur: 4.6 },
    { x: "64%", y: "86%", s: 6,  delay: 3.5, dur: 4.3 },
  ];
  return (
    <>
      {stars.map((st, i) => (
        <div key={i} style={{
          position: "absolute", left: st.x, top: st.y,
          pointerEvents: "none", zIndex: 0,
          animation: `driftStar ${st.dur}s ease-out ${st.delay}s infinite`,
          fontSize: st.s,
          color: [C.goldBright, C.lilac, C.seaBlue, C.blushMagenta, C.sageGreen][i % 5],
        }}>
          ✦
        </div>
      ))}
    </>
  );
}

/* ── Couple avatars positioned in hero ── */
function CoupleAvatars() {
  return (
    <>
      {/* Wedding couple — centred, SVG handles its own float animations */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        zIndex: 0, pointerEvents: "none",
        opacity: 0.92,
      }}>
        <ChibiCouple />
      </div>
    </>
  );
}

function FloatingElements() {
  const items = [
    { type: "heart",   x: "6%",  y: "12%", size: 30, delay: 0,   color: C.magBright  },
    { type: "odo",     x: "90%", y: "18%", size: 34, delay: 1.8, color: C.oceanBlue  },
    { type: "sparkle", x: "15%", y: "28%", size: 14, delay: 0.5, color: C.goldBright },
    { type: "heart",   x: "85%", y: "60%", size: 24, delay: 2.5, color: C.lilac      },
    { type: "odo",     x: "8%",  y: "72%", size: 28, delay: 3.2, color: C.sageGreen  },
    { type: "sparkle", x: "92%", y: "42%", size: 12, delay: 1.2, color: C.goldBright },
    { type: "sparkle", x: "50%", y: "8%",  size: 16, delay: 2,   color: C.lilac      },
    { type: "sparkle", x: "78%", y: "82%", size: 10, delay: 3.8, color: C.sageGreen  },
    { type: "petal",   x: "20%", y: "45%", size: 18, delay: 0.8, color: C.magPale    },
    { type: "petal",   x: "80%", y: "35%", size: 18, delay: 2.2, color: C.lilac      },
    { type: "petal",   x: "35%", y: "80%", size: 18, delay: 4,   color: C.beige      },
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
    color: [C.magDeep, C.blushMagenta, C.goldRich, C.seaBlue, C.oceanBlue, C.sageGreen, C.lilac, C.beige][i % 8],
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

/* ═══════════════════════════════════════════
   EVENT COLOR PALETTE
   ═══════════════════════════════════════════ */
const EVENT_PALETTE = [
  { name: "Beige",      sub: "Warm Sand",      hex: C.beige,        },
  { name: "Sea Blue",   sub: "Soft Aqua",      hex: C.seaBlue,      },
  { name: "Ocean Blue", sub: "Cornflower",      hex: C.oceanBlue,    },
  { name: "Sage Green", sub: "Soft Botanical",  hex: C.sageGreen,    },
  { name: "Lilac",      sub: "Soft Lavender",   hex: C.lilac,        },
  { name: "Magenta",    sub: "Blush Rose",      hex: C.blushMagenta, },
];

function EventColors() {
  return (
    <section style={{ padding: "0 20px 56px", maxWidth: 620, margin: "0 auto" }}>
      {/* Card */}
      <div style={{
        background: "#fff", borderRadius: 24, overflow: "hidden",
        boxShadow: `0 4px 40px rgba(30,12,22,0.07), 0 1px 4px rgba(30,12,22,0.04)`,
        border: "1px solid rgba(200,150,12,0.08)",
      }}>
        {/* Rainbow top bar using all 6 pastel colors */}
        <div style={{ display: "flex", height: 8 }}>
          {EVENT_PALETTE.map((c) => (
            <div key={c.name} style={{ flex: 1, backgroundColor: c.hex }} />
          ))}
        </div>

        <div style={{ padding: "28px 28px 32px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p style={{
              fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase",
              color: C.goldRich, fontWeight: 700, marginBottom: 8,
            }}>
              ✦ Dress Code ✦
            </p>
            <p style={{
              fontFamily: font.heading, fontSize: 22, fontWeight: 600,
              color: C.magDeep, marginBottom: 6,
            }}>
              Pastel Elegance
            </p>
            <p style={{ fontSize: 14, color: C.silver, fontStyle: "italic", lineHeight: 1.6 }}>
              We'd love for you to join us dressed in any of these soft, beautiful shades
            </p>
          </div>

          {/* Large swatch bar */}
          <div style={{
            display: "flex", borderRadius: 14, overflow: "hidden",
            boxShadow: "0 4px 20px rgba(30,12,22,0.08)", height: 110, marginBottom: 20,
          }}>
            {EVENT_PALETTE.map((c) => (
              <div key={c.name} style={{
                flex: 1, backgroundColor: c.hex,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "flex-end",
                paddingBottom: 10,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.05em",
                  textTransform: "uppercase", color: "rgba(30,12,22,0.6)",
                  lineHeight: 1.3, textAlign: "center", padding: "0 3px",
                  writingMode: "horizontal-tb",
                }}>
                  {c.name.split(" ").map((w, i) => (
                    <span key={i} style={{ display: "block" }}>{w}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          {/* Named chips grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
          }}>
            {EVENT_PALETTE.map((c) => (
              <div key={c.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#FFFBF8", border: "1px solid #EDE0E8",
                borderRadius: 12, padding: "10px 12px",
                boxShadow: "0 1px 4px rgba(30,12,22,0.04)",
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  backgroundColor: c.hex,
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.1)",
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, lineHeight: 1.2 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.silver, marginTop: 1 }}>
                    {c.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <p style={{
            textAlign: "center", fontSize: 13, color: C.silver,
            marginTop: 18, lineHeight: 1.65, fontStyle: "italic",
          }}>
            Mix and match — any combination of these shades is perfect ✦
          </p>
        </div>
      </div>
    </section>
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
   DONATION MODAL
   ═══════════════════════════════════════════ */
const PRESETS = [100, 500, 1000, 2000];
const NETWORKS = [
  { value: "MTN", label: "MTN MoMo" },
  { value: "VODAFONE", label: "Telecel Cash" },
  { value: "AIRTELTIGO", label: "AT Money" },
];

function DonationModal({ onClose }: { onClose: () => void }) {
  const [method, setMethod] = useState<"momo" | "card" | "manual">("momo");
  const [amount, setAmount] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("MTN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingMsg, setPendingMsg] = useState("");
  const [pendingReference, setPendingReference] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const verifyInFlight = useRef(false);

  const finalAmount = custom ? Number(custom) : amount;

  async function handlePay() {
    if (!finalAmount || finalAmount < 1) { setError("Please choose or enter a valid amount."); return; }
    if (method === "momo" && !momoPhone.trim()) { setError("Please enter your MoMo phone number."); return; }
    setError(""); setPendingMsg(""); setPendingReference(""); setLoading(true);
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          name: name || undefined,
          email: email || undefined,
          paymentMethod: method === "momo" ? "mobile_money" : "card",
          momoPhone: method === "momo" ? momoPhone : undefined,
          momoNetwork: method === "momo" ? momoNetwork : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.pending) {
        setPendingMsg(data.message ?? "Please authorise the payment on your phone.");
        setPendingReference(data.reference ?? "");
        setLoading(false);
      } else {
        setError(data.error ?? "Could not start payment. Please try a manual option below.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again or use a manual option.");
      setLoading(false);
    }
  }

  async function checkPendingPayment(silent = false) {
    if (!pendingReference || verifyInFlight.current) return;
    verifyInFlight.current = true;
    if (!silent) setCheckingStatus(true);
    if (!silent) setError("");
    try {
      const res = await fetch(`/api/payment/verify?reference=${encodeURIComponent(pendingReference)}`);
      const data = await res.json();
      if (data.status === "confirmed") {
        window.location.href = `/payment/success?status=successful&tx_ref=${encodeURIComponent(pendingReference)}`;
        return;
      }
      if (data.status === "failed") {
        setError("Payment was not completed. Please try again.");
        setPendingMsg("");
        setPendingReference("");
        return;
      }
      if (!silent) {
        setPendingMsg("Still waiting for approval on your phone. Please approve the prompt, then check again.");
      }
    } catch {
      if (!silent) setError("Could not verify payment right now. Please try again.");
    } finally {
      verifyInFlight.current = false;
      if (!silent) setCheckingStatus(false);
    }
  }

  useEffect(() => {
    if (!pendingReference) return;
    let attempts = 0;
    const id = setInterval(() => {
      attempts += 1;
      void checkPendingPayment(true);
      if (attempts >= 24) clearInterval(id); // about 2 minutes at 5s interval
    }, 5000);
    return () => clearInterval(id);
  }, [pendingReference]);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontSize: 15, borderRadius: 10,
    border: "2px solid #F0D0E8", outline: "none", fontFamily: font.body,
    color: C.charcoal, background: "#FFFBF8", transition: "border-color 0.2s",
  };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = C.goldRich; };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = "#F0D0E8"; };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(30,12,22,0.72)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "fadeIn 0.2s ease-out",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "100%", maxWidth: 460, background: "#fff", borderRadius: 24, overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)", animation: "scaleIn 0.3s ease-out",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${C.magDeep}, ${C.magBright}, ${C.goldRich}, ${C.goldBright}, ${C.magDeep})`, backgroundSize: "300% 100%" }} />

        <div style={{ padding: "32px 28px 36px" }}>
          {/* Pending / awaiting phone approval */}
          {pendingMsg ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📱</div>
              <h2 style={{ fontFamily: font.heading, fontSize: 24, fontWeight: 700, color: C.magDeep, margin: "0 0 12px" }}>Check Your Phone</h2>
              <p style={{ fontSize: 15, color: C.silver, lineHeight: 1.65, marginBottom: 28 }}>{pendingMsg}</p>
              <div style={{ background: "#FFF5FA", borderRadius: 12, padding: "14px 18px", marginBottom: 28, fontSize: 14, color: C.goldRich, fontWeight: 600 }}>
                GHS {finalAmount?.toLocaleString()} · {momoNetwork} · {momoPhone}
              </div>
              <button onClick={() => void checkPendingPayment(false)} disabled={checkingStatus || !pendingReference}
                style={{
                  width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: font.body,
                  color: "#fff", background: checkingStatus ? "#B89AA9" : `linear-gradient(135deg, ${C.goldRich}, ${C.goldMed})`,
                  border: "none", borderRadius: 12, cursor: checkingStatus ? "not-allowed" : "pointer",
                  boxShadow: checkingStatus ? "none" : `0 4px 20px rgba(200,150,12,0.28)`,
                  marginBottom: 10,
                }}>
                {checkingStatus ? "Checking..." : "I Have Approved, Check Status"}
              </button>
              <button onClick={onClose}
                style={{
                  width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: font.body,
                  color: "#fff", background: `linear-gradient(135deg, ${C.magDeep}, ${C.magMed})`,
                  border: "none", borderRadius: 12, cursor: "pointer",
                  boxShadow: `0 4px 20px rgba(156,0,82,0.3)`,
                }}>
                Done ✓
              </button>
            </div>
          ) : (
          <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: font.heading, fontSize: 26, fontWeight: 700, color: C.magDeep, margin: 0 }}>Send a Gift 💛</h2>
              <p style={{ fontSize: 14, color: C.silver, marginTop: 4 }}>Support Eyram &amp; Loretta on their big day</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.silver, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Payment method tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#FFF0F8", borderRadius: 12, padding: 4 }}>
            {(["momo", "card", "manual"] as const).map((m) => (
              <button key={m} onClick={() => { if (m !== "card") { setMethod(m); setError(""); } }}
                style={{
                  flex: 1, padding: "9px 4px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                  fontFamily: font.body, cursor: "pointer", transition: "all 0.2s", border: "none",
                  background: method === m ? C.magDeep : "transparent",
                  color: method === m ? "#fff" : C.silver,
                  opacity: m === "card" ? 0.55 : 1,
                }}>
                {m === "momo" ? "📱 MoMo" : m === "card" ? "💳 Card (soon)" : "🏦 Bank"}
              </button>
            ))}
          </div>

          {/* Amount — shown for momo and card */}
          {method !== "manual" && (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.magDeep, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Amount (GHS)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
                {PRESETS.map((p) => (
                  <button key={p} onClick={() => { setAmount(p); setCustom(""); }}
                    style={{
                      padding: "10px 4px", borderRadius: 10, fontSize: 15, fontWeight: 700,
                      fontFamily: font.body, cursor: "pointer", transition: "all 0.2s",
                      border: `2px solid ${amount === p && !custom ? C.magDeep : "#F0D0E8"}`,
                      background: amount === p && !custom ? C.magDeep : "#FFFBF8",
                      color: amount === p && !custom ? "#fff" : C.charcoal,
                    }}>
                    {p}
                  </button>
                ))}
              </div>
              <input type="number" placeholder="Custom amount" value={custom}
                onChange={(e) => { setCustom(e.target.value); setAmount(null); }} min={1}
                style={{ ...inputStyle, marginBottom: 16 }} onFocus={focus} onBlur={blur}
              />
            </>
          )}

          {/* MoMo fields */}
          {method === "momo" && (
            <>
              <select value={momoNetwork} onChange={(e) => setMomoNetwork(e.target.value)}
                style={{ ...inputStyle, marginBottom: 10 }} onFocus={focus} onBlur={blur}>
                {NETWORKS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
              <input type="tel" placeholder="MoMo phone number (e.g. 0241234567)" value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                style={{ ...inputStyle, marginBottom: 10 }} onFocus={focus} onBlur={blur}
              />
              <input type="text" placeholder="Your name (optional)" value={name}
                onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} onFocus={focus} onBlur={blur}
              />
            </>
          )}

          {/* Card fields */}
          {method === "card" && (
            <>
              <input type="text" placeholder="Your name (optional)" value={name}
                onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} onFocus={focus} onBlur={blur}
              />
              <input type="email" placeholder="Email for receipt (optional)" value={email}
                onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} onFocus={focus} onBlur={blur}
              />
            </>
          )}

          {/* Manual bank details */}
          {method === "manual" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "#FFF5FA", borderRadius: 12, padding: "16px 18px", border: "1px solid #F0D0E8" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.magDeep, marginBottom: 8 }}>📱 Mobile Money</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: C.charcoal, letterSpacing: "0.05em" }}>0241837002</p>
                <p style={{ fontSize: 13, color: C.silver, marginTop: 2 }}>Any network accepted</p>
              </div>
              <div style={{ background: "#FFF5FA", borderRadius: 12, padding: "16px 18px", border: "1px solid #F0D0E8" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.magDeep, marginBottom: 8 }}>🏦 GT Bank</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: C.charcoal }}>1602001015428</p>
                <p style={{ fontSize: 13, color: C.silver, marginTop: 4 }}>Branch: Ho (602)</p>
                <p style={{ fontSize: 13, color: C.silver }}>SWIFT: GTBIGHAC</p>
              </div>
            </div>
          )}

          {error && <p style={{ fontSize: 14, color: C.magBright, marginBottom: 12, textAlign: "center" }}>{error}</p>}

          {/* Pay / close button */}
          {method !== "manual" ? (
            <button onClick={handlePay} disabled={loading}
              style={{
                width: "100%", padding: "15px", fontSize: 15, fontWeight: 700, fontFamily: font.body,
                color: loading ? "#B8A8B0" : "#fff", letterSpacing: "0.08em", textTransform: "uppercase",
                background: loading ? "#E8DEE3" : `linear-gradient(135deg, ${C.magDeep}, ${C.magMed})`,
                border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : `0 4px 20px rgba(156,0,82,0.3)`,
                transition: "all 0.2s",
              }}>
              {loading ? "Processing…" : `✦ Give${finalAmount && finalAmount > 0 ? ` GHS ${finalAmount}` : ""} ✦`}
            </button>
          ) : (
            <button onClick={onClose}
              style={{
                width: "100%", padding: "15px", fontSize: 15, fontWeight: 700, fontFamily: font.body,
                color: C.magDeep, letterSpacing: "0.08em", textTransform: "uppercase",
                background: "#FFF0F8", border: `2px solid ${C.magPale}`, borderRadius: 12, cursor: "pointer",
              }}>
              Done
            </button>
          )}
          </>
          )}
        </div>
      </div>
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
  const [showDonation, setShowDonation] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 150); }, []);

  useEffect(() => {
    fetch("/api/accommodations")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAccommodations((d.accommodations ?? []).map((a: any) => normalizeAccommodation(a)));
        }
      })
      .catch(() => {});
  }, []);

  const up = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  function selectAccommodation(id: number) {
    const normalizedId = Number(id);
    setForm((f) => ({ ...f, accommodationId: Number.isFinite(normalizedId) ? normalizedId : null, needsAccommodation: "yes" }));
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
          accommodation_id: form.accommodationId != null ? Number(form.accommodationId) : null,
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

  const selectedAcc = accommodations.find((a) => Number(a.id) === Number(form.accommodationId)) ?? null;

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
      {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
      <KenteStrip />

      {/* ────── HERO ────── */}
      <section style={{
        position: "relative", minHeight: submitted ? "auto" : "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "60px 24px 80px", textAlign: "center", overflow: "hidden",
      }}>
        <WeddingBgPattern />
        {!submitted && <WaveDecoration />}
        {!submitted && <HeroStars />}
        {!submitted && <FloatingElements />}

        {/* Radial glow behind heading */}
        {!submitted && (
          <div style={{
            position: "absolute", top: "38%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520, height: 340,
            background: `radial-gradient(ellipse at center, ${C.blushMagenta}22 0%, ${C.lilac}14 40%, transparent 72%)`,
            pointerEvents: "none", zIndex: 0,
            animation: "glowOrb 7s ease-in-out infinite",
          }} />
        )}

        <div style={{
          position: "relative", zIndex: 1, maxWidth: 720,
          animation: visible ? "heroEntrance 1.2s cubic-bezier(0.22,1,0.36,1) forwards" : "none",
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
                    ["Attending", form.attending === "yes" ? "✓ Joyfully Accepted" : "Unable to attend — sending best wishes"],
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
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: `0 4px 30px rgba(200,150,12,0.08)`, maxWidth: 480, margin: "0 auto 24px" }}>
                <div style={{ height: 6, background: `linear-gradient(90deg, ${C.goldRich}, ${C.goldBright}, ${C.goldMed})` }} />
                <div style={{ padding: "24px 28px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.2em", color: C.silver, marginBottom: 12 }}>Event Details</p>
                  <p style={{ fontFamily: font.heading, fontSize: 20, fontWeight: 600, color: C.magDeep }}>Saturday, 2nd May 2026</p>
                  <p style={{ fontSize: 16, color: C.silver, marginTop: 4 }}>🏖️ Elmina Beach Resort</p>
                  <p style={{ fontSize: 15, color: C.silver, marginTop: 2 }}>Ceremony begins at 10:00 AM</p>
                </div>
              </div>

              {/* Donation CTA on confirmation */}
              <button
                onClick={() => setShowDonation(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "16px 44px", fontSize: 16, fontWeight: 700, fontFamily: font.body,
                  color: "#fff", background: `linear-gradient(135deg, ${C.goldRich}, ${C.goldMed})`,
                  border: "none", borderRadius: 60, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
                  boxShadow: `0 4px 24px rgba(200,150,12,0.3)`, transition: "all 0.3s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(200,150,12,0.4)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 24px rgba(200,150,12,0.3)`; }}
              >
                💛 Send a Wedding Gift
              </button>
            </div>
          ) : (
            /* ── HERO CONTENT ── */
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 50, height: 1, backgroundColor: C.goldRich, opacity: 0.5 }} />
                <WeddingRings size={50} />
                <div style={{ width: 50, height: 1, backgroundColor: C.goldRich, opacity: 0.5 }} />
              </div>

              <p style={{ fontSize: 16, letterSpacing: "0.28em", textTransform: "uppercase", color: C.silver, fontWeight: 600, marginBottom: 22 }}>
                You Are Invited To Celebrate
              </p>

              <h1 style={{
                fontFamily: font.heading, fontSize: "clamp(56px, 14vw, 96px)", fontWeight: 600, lineHeight: 1.05, marginBottom: 8,
                background: `linear-gradient(135deg, ${C.magDeep}, ${C.goldRich}, ${C.magMed}, ${C.goldMed})`,
                backgroundSize: "300% 300%", animation: "gradientPulse 8s ease infinite",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 20px rgba(156,0,82,0.14))",
              }}>
                Eyram
                <span style={{ fontStyle: "italic", fontWeight: 300, fontSize: "0.52em", margin: "0 8px", WebkitTextFillColor: C.goldMed, color: C.goldMed }}>&amp;</span>
                Loretta
              </h1>

              <p style={{ fontFamily: font.heading, fontSize: "clamp(20px, 4.5vw, 28px)", fontStyle: "italic", color: C.magMed, fontWeight: 400, marginBottom: 32 }}>
                are getting married!
              </p>

              <div style={{
                fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
                background: `linear-gradient(90deg, ${C.magDeep}, ${C.goldRich}, ${C.magBright}, ${C.goldBright}, ${C.magDeep})`,
                backgroundSize: "300% auto", animation: "shimmer 4s linear infinite",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 12,
              }}>
                Saturday, 2nd May 2026
              </div>

              <p style={{ fontSize: "clamp(17px, 3vw, 21px)", marginBottom: 10, fontWeight: 500 }}>
                <a
                  href="https://maps.app.goo.gl/hADnwHFjPYPFJP6d6"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: C.silver, textDecoration: "none", borderBottom: `1px dashed ${C.goldRich}`, paddingBottom: 1, transition: "color 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.magDeep; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = C.magDeep; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.silver; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = C.goldRich; }}
                >
                  🏖️ Elmina Beach Resort ↗
                </a>
              </p>
              <p style={{ fontSize: "clamp(16px, 2.8vw, 20px)", color: C.silver, marginBottom: 32, opacity: 0.88, fontWeight: 500 }}>⏰ Ceremony begins at 10:00 AM GMT</p>

              <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 36, color: C.goldRich, fontSize: 16, opacity: 0.65 }}>
                <span>✦</span><span>✦</span><span>✦</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
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
                <button
                  onClick={() => setShowDonation(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "18px 40px", fontSize: 17, fontWeight: 700, fontFamily: font.body,
                    color: C.goldRich, background: "transparent",
                    border: `2px solid ${C.goldRich}`, borderRadius: 60, cursor: "pointer",
                    letterSpacing: "0.12em", textTransform: "uppercase", transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.goldRich; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.goldRich; e.currentTarget.style.transform = "none"; }}
                >
                  💛 Send a Gift
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ────── EVENT COLORS ────── */}
      {!submitted && <EventColors />}

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
                  <RadioCard label="I'm Unable to Attend" sublabel="But I send my best wishes" selected={form.attending === "no"} onClick={() => up("attending", "no")} />
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
                                  selected={Number(form.accommodationId) === Number(acc.id)}
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

      {!submitted && <KenteStrip id="kenteWeaveBottom" />}

      {/* Always-visible corner roamers */}
      <CornerRoamers />
    </div>
  );
}

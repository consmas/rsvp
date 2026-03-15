"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const C = {
  magDeep: "#9C0052",
  magMed: "#C20068",
  magBright: "#E91E8C",
  goldRich: "#C8960C",
  goldMed: "#E0B030",
  goldBright: "#F5CE50",
  warmWhite: "#FFF5FA",
  charcoal: "#1E0C16",
  silver: "#7A6876",
};
const font = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'Lora', Georgia, serif",
};

function SuccessContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const txRef = params.get("tx_ref");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const succeeded = status === "successful" || status === "completed";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${C.magDeep} 0%, ${C.charcoal} 100%)`,
      fontFamily: font.body, padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lora:wght@400;500;600&display=swap');
        @keyframes scaleIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(calc(100vh + 40px)) rotate(1080deg); opacity: 0; }
        }
      `}</style>

      {succeeded && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `-${20 + Math.random() * 20}px`,
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background: [C.goldBright, C.magBright, C.goldMed, "#fff"][Math.floor(Math.random() * 4)],
              animation: `confettiFall ${2.5 + Math.random() * 3}s ${Math.random() * 2}s linear infinite`,
              opacity: 0.9,
            }} />
          ))}
        </div>
      )}

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 480,
        background: "#fff", borderRadius: 28, overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        animation: visible ? "scaleIn 0.6s ease-out" : "none",
        opacity: visible ? 1 : 0,
      }}>
        {/* top bar */}
        <div style={{ height: 6, background: `linear-gradient(90deg, ${C.magDeep}, ${C.magBright}, ${C.goldRich}, ${C.goldBright}, ${C.magDeep})`, backgroundSize: "300% 100%" }} />

        <div style={{ padding: "44px 36px 48px", textAlign: "center" }}>
          {/* icon */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
            background: succeeded
              ? `linear-gradient(135deg, ${C.goldRich}, ${C.goldBright})`
              : `linear-gradient(135deg, ${C.silver}, #BBA8B5)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: succeeded ? `0 4px 24px rgba(200,150,12,0.35)` : "none",
            fontSize: 36,
          }}>
            {succeeded ? "💛" : "💔"}
          </div>

          <h1 style={{
            fontFamily: font.heading, fontSize: 32, fontWeight: 700,
            color: C.magDeep, margin: "0 0 12px",
          }}>
            {succeeded ? "Thank You!" : "Payment Incomplete"}
          </h1>

          <p style={{ fontSize: 17, color: C.silver, lineHeight: 1.65, marginBottom: 28 }}>
            {succeeded
              ? "Your generous gift has been received. Eyram & Loretta are truly grateful for your love and support on their special day."
              : "Your payment didn't go through. You're welcome to try again or use one of the manual payment options below."}
          </p>

          {txRef && succeeded && (
            <div style={{
              background: "#FFF9EC", border: `1px solid ${C.goldBright}`, borderRadius: 10,
              padding: "12px 16px", marginBottom: 28, fontSize: 13, color: C.goldRich,
            }}>
              Reference: <span style={{ fontWeight: 600, userSelect: "all" }}>{txRef}</span>
            </div>
          )}

          {/* Manual payment fallback */}
          {!succeeded && (
            <div style={{
              background: "#FFF5FA", border: `1px solid rgba(156,0,82,0.15)`,
              borderRadius: 14, padding: "20px 20px", marginBottom: 28, textAlign: "left",
            }}>
              <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.15em", color: C.silver, marginBottom: 14, textAlign: "center" }}>
                Alternative Options
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #F0D0E8" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.magDeep, marginBottom: 4 }}>📱 MoMo</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, letterSpacing: "0.05em" }}>0241837002</p>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #F0D0E8" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.magDeep, marginBottom: 4 }}>🏦 GT Bank</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: C.charcoal }}>1602001015428</p>
                  <p style={{ fontSize: 13, color: C.silver }}>Branch: Ho (602) · SWIFT: GTBIGHAC</p>
                </div>
              </div>
            </div>
          )}

          <a href="/" style={{
            display: "inline-block", padding: "14px 40px",
            background: `linear-gradient(135deg, ${C.magDeep}, ${C.magMed})`,
            color: "#fff", borderRadius: 50, textDecoration: "none",
            fontSize: 15, fontWeight: 700, fontFamily: font.body,
            letterSpacing: "0.08em", textTransform: "uppercase",
            boxShadow: `0 4px 20px rgba(156,0,82,0.3)`,
          }}>
            ← Back to RSVP
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Invalid credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #9C0052 0%, #1E0C16 100%)",
      fontFamily: "'Lora', Georgia, serif", padding: 24,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lora:wght@400;500;600&display=swap');`}</style>

      <div style={{
        width: "100%", maxWidth: 420, background: "#fff",
        borderRadius: 24, overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        {/* Top band */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #9C0052, #E91E8C, #C8960C, #F5CE50, #E91E8C, #9C0052)", backgroundSize: "300% 100%", animation: "gradientPulse 5s ease infinite" }} />

        <div style={{ padding: "40px 36px 44px" }}>
          {/* Logo mark */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #9C0052, #C20068)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 4px 20px rgba(156,0,82,0.3)",
            }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#F5CE50", letterSpacing: 1 }}>E·L</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 700, color: "#9C0052", margin: 0, lineHeight: 1.2 }}>
              Admin Access
            </h1>
            <p style={{ fontSize: 14, color: "#9A8896", marginTop: 6 }}>Eyram &amp; Loretta · Wedding Dashboard</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#9C0052", marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required autoComplete="email"
                style={{
                  width: "100%", padding: "13px 16px", fontSize: 16, borderRadius: 10,
                  border: "2px solid #F0D0E8", outline: "none", fontFamily: "inherit",
                  color: "#1E0C16", background: "#FFFBF8", transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#C8960C"; e.target.style.boxShadow = "0 0 0 3px rgba(200,150,12,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#F0D0E8"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#9C0052", marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••" required autoComplete="current-password"
                style={{
                  width: "100%", padding: "13px 16px", fontSize: 16, borderRadius: 10,
                  border: "2px solid #F0D0E8", outline: "none", fontFamily: "inherit",
                  color: "#1E0C16", background: "#FFFBF8", transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#C8960C"; e.target.style.boxShadow = "0 0 0 3px rgba(200,150,12,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#F0D0E8"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 14, color: "#E91E8C", textAlign: "center", margin: 0 }}>{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                padding: "15px", fontSize: 15, fontWeight: 700, fontFamily: "inherit",
                color: loading ? "#B8A8B0" : "#fff", letterSpacing: "0.08em", textTransform: "uppercase",
                background: loading ? "#E8DEE3" : "linear-gradient(135deg, #9C0052, #C20068)",
                border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(156,0,82,0.3)",
                transition: "all 0.2s", marginTop: 4,
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes gradientPulse {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

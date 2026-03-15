"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────────────────
   Color palette
───────────────────────────────────────────────────────── */
const C = {
  magenta:       "#9C0052",
  magentaMed:    "#C20068",
  magentaBright: "#E91E8C",
  gold:          "#C8960C",
  goldMed:       "#E0B030",
  goldBright:    "#F5CE50",
  bg:            "#F8F4F7",
  sidebarBg:     "#1E0C16",
  cream:         "#FEF0F6",
  border:        "#F0D0E8",
};

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface Accommodation {
  id: number;
  hotel_name: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  currency: string;
  max_guests: number;
  available: number;
  created_at: string;
}

interface Guest {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  attending: "yes" | "no";
  guest_count: number;
  arriving_early: "yes" | "no" | null;
  needs_accommodation: "yes" | "no" | null;
  accommodation_id: number | null;
  accommodation_hotel: string | null;
  accommodation_room: string | null;
  accommodation_price: number | null;
  accommodation_currency: string | null;
  staying_for_dinner: "yes" | "no" | null;
  dietary_notes: string | null;
  message: string | null;
  created_at: string;
}

interface Donation {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  donor_name: string | null;
  donor_phone: string | null;
  donor_network: string | null;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
}

interface AnalyticsSummary {
  views24h: number;
  views7d: number;
  unique24h: number;
  unique7d: number;
  topPages: Array<{ path: string; views: number }>;
}

interface AccommodationFormData {
  hotel_name: string;
  room_type: string;
  description: string;
  price_per_night: string;
  currency: string;
  max_guests: string;
  available: boolean;
}

interface GuestFormData {
  full_name: string;
  email: string;
  phone: string;
  attending: string;
  guest_count: string;
  arriving_early: string;
  needs_accommodation: string;
  accommodation_id: string;
  staying_for_dinner: string;
  dietary_notes: string;
  message: string;
}

const EMPTY_GUEST_FORM: GuestFormData = {
  full_name: "", email: "", phone: "", attending: "yes",
  guest_count: "1", arriving_early: "", needs_accommodation: "",
  accommodation_id: "", staying_for_dinner: "", dietary_notes: "", message: "",
};

type NavTab = "dashboard" | "rsvps" | "donations" | "accommodations";

const EMPTY_FORM: AccommodationFormData = {
  hotel_name: "",
  room_type: "",
  description: "",
  price_per_night: "",
  currency: "GHS",
  max_guests: "2",
  available: true,
};

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/* ─────────────────────────────────────────────────────────
   UI Primitives
───────────────────────────────────────────────────────── */
function Badge({
  color,
  children,
}: {
  color: "green" | "red" | "gold" | "grey" | "blue";
  children: React.ReactNode;
}) {
  const colors = {
    green: { background: "#D1FAE5", color: "#065F46" },
    red:   { background: "#FEE2E2", color: "#991B1B" },
    gold:  { background: "#FEF3C7", color: "#92400E" },
    grey:  { background: "#F3F4F6", color: "#374151" },
    blue:  { background: "#DBEAFE", color: "#1E40AF" },
  };
  return (
    <span
      style={{
        ...colors[color],
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        borderLeft: `4px solid ${accent ?? C.gold}`,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 13, color: "#A8A3A0", fontWeight: 500, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#2D2226", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#A8A3A0", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SVG Bar Chart — attending vs declining
───────────────────────────────────────────────────────── */
function AttendanceBarChart({
  attending,
  declining,
}: {
  attending: number;
  declining: number;
}) {
  const W = 340;
  const H = 110;
  const barH = 34;
  const labelW = 80;
  const maxVal = Math.max(attending, declining, 1);
  const availW = W - labelW - 50;

  const attW = Math.round((attending / maxVal) * availW);
  const decW = Math.round((declining / maxVal) * availW);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Attending bar */}
      <text x={0} y={barH / 2 + 5} fontSize={12} fill="#6B7280" fontFamily="inherit">
        Attending
      </text>
      <rect x={labelW} y={4} width={Math.max(attW, 2)} height={barH - 8} rx={6} fill="#059669" />
      <text
        x={labelW + Math.max(attW, 2) + 8}
        y={barH / 2 + 5}
        fontSize={13}
        fontWeight="700"
        fill="#2D2226"
        fontFamily="inherit"
      >
        {attending}
      </text>

      {/* Declining bar */}
      <text x={0} y={barH + barH / 2 + 10} fontSize={12} fill="#6B7280" fontFamily="inherit">
        Declined
      </text>
      <rect x={labelW} y={barH + 9} width={Math.max(decW, 2)} height={barH - 8} rx={6} fill="#DC2626" />
      <text
        x={labelW + Math.max(decW, 2) + 8}
        y={barH + barH / 2 + 10}
        fontSize={13}
        fontWeight="700"
        fill="#2D2226"
        fontFamily="inherit"
      >
        {declining}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   SVG Line Chart — cumulative donations over time
───────────────────────────────────────────────────────── */
function DonationsLineChart({ donations }: { donations: Donation[] }) {
  const W = 340;
  const H = 120;
  const padL = 48;
  const padR = 16;
  const padT = 12;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Build daily totals
  const confirmed = donations.filter((d) => d.status === "confirmed");
  if (confirmed.length === 0) {
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={13} fill="#A8A3A0" fontFamily="inherit">
          No donation data yet
        </text>
      </svg>
    );
  }

  // Group by day
  const dayMap: Record<string, number> = {};
  for (const d of confirmed) {
    const day = d.created_at.slice(0, 10);
    dayMap[day] = (dayMap[day] ?? 0) + d.amount;
  }
  const sortedDays = Object.keys(dayMap).sort();

  // Cumulative
  const points: { day: string; cum: number }[] = [];
  let running = 0;
  for (const day of sortedDays) {
    running += dayMap[day];
    points.push({ day, cum: running });
  }

  const maxCum = points[points.length - 1]?.cum ?? 1;

  const toX = (i: number) =>
    padL + (points.length === 1 ? chartW / 2 : (i / (points.length - 1)) * chartW);
  const toY = (v: number) => padT + chartH - (v / maxCum) * chartH;

  const pathD =
    points.length === 1
      ? `M ${toX(0)} ${toY(points[0].cum)}`
      : points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.cum)}`).join(" ");

  const areaD =
    points.length === 1
      ? ""
      : `${pathD} L ${toX(points.length - 1)} ${padT + chartH} L ${toX(0)} ${padT + chartH} Z`;

  // Y axis labels
  const yTicks = [0, 0.5, 1].map((r) => ({
    v: Math.round(maxCum * r),
    y: toY(maxCum * r),
  }));

  // X axis: show first and last day labels
  const xLabels =
    points.length <= 1
      ? points.map((p, i) => ({ label: shortDate(p.day + "T00:00:00"), x: toX(i) }))
      : [
          { label: shortDate(points[0].day + "T00:00:00"), x: toX(0) },
          { label: shortDate(points[points.length - 1].day + "T00:00:00"), x: toX(points.length - 1) },
        ];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Grid lines */}
      {yTicks.map((t) => (
        <line
          key={t.v}
          x1={padL}
          y1={t.y}
          x2={W - padR}
          y2={t.y}
          stroke="#F0D0E8"
          strokeWidth={1}
        />
      ))}

      {/* Area fill */}
      {areaD && <path d={areaD} fill="rgba(200,150,12,0.12)" />}

      {/* Line */}
      <path d={pathD} fill="none" stroke={C.gold} strokeWidth={2.5} strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={p.day} cx={toX(i)} cy={toY(p.cum)} r={3.5} fill={C.gold} />
      ))}

      {/* Y axis labels */}
      {yTicks.map((t) => (
        <text key={t.v} x={padL - 6} y={t.y + 4} textAnchor="end" fontSize={10} fill="#A8A3A0" fontFamily="inherit">
          {t.v >= 1000 ? `${(t.v / 1000).toFixed(0)}k` : t.v}
        </text>
      ))}

      {/* X axis labels */}
      {xLabels.map((xl) => (
        <text
          key={xl.label + xl.x}
          x={xl.x}
          y={H - 4}
          textAnchor="middle"
          fontSize={10}
          fill="#A8A3A0"
          fontFamily="inherit"
        >
          {xl.label}
        </text>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   Accommodation form
───────────────────────────────────────────────────────── */
function AccommodationForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: AccommodationFormData;
  onSave: (data: AccommodationFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [data, setData] = useState<AccommodationFormData>(initial);
  const set =
    <K extends keyof AccommodationFormData>(key: K) =>
    (value: AccommodationFormData[K]) =>
      setData((d) => ({ ...d, [key]: value }));

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 15,
    color: "#2D2226",
    background: "white",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: C.cream,
        borderRadius: 16,
        padding: 24,
        border: "1.5px solid rgba(200,150,12,0.3)",
        marginBottom: 20,
      }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}
        className="form-grid"
      >
        {/* Hotel name */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.magenta, display: "block", marginBottom: 6 }}>
            Hotel Name *
          </label>
          <input
            style={inputStyle}
            value={data.hotel_name}
            onChange={(e) => set("hotel_name")(e.target.value)}
            placeholder="e.g. Elmina Beach Resort"
          />
        </div>

        {/* Room type */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.magenta, display: "block", marginBottom: 6 }}>
            Room Type *
          </label>
          <input
            style={inputStyle}
            value={data.room_type}
            onChange={(e) => set("room_type")(e.target.value)}
            placeholder="e.g. Deluxe Room, Junior Suite"
          />
        </div>

        {/* Price */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.magenta, display: "block", marginBottom: 6 }}>
            Price Per Night *
          </label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={data.price_per_night}
            onChange={(e) => set("price_per_night")(e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Currency */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.magenta, display: "block", marginBottom: 6 }}>
            Currency
          </label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={data.currency}
            onChange={(e) => set("currency")(e.target.value)}
          >
            <option value="GHS">GHS — Ghanaian Cedi (GH₵)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="GBP">GBP — British Pound (£)</option>
          </select>
        </div>

        {/* Max guests */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.magenta, display: "block", marginBottom: 6 }}>
            Max Guests
          </label>
          <input
            style={inputStyle}
            type="number"
            min="1"
            max="20"
            value={data.max_guests}
            onChange={(e) => set("max_guests")(e.target.value)}
          />
        </div>

        {/* Available toggle */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.magenta, display: "block", marginBottom: 6 }}>
            Status
          </label>
          <button
            type="button"
            onClick={() => set("available")(!data.available)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid #E5E7EB",
              background: data.available ? "#D1FAE5" : "#F3F4F6",
              color: data.available ? "#065F46" : "#6B7280",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: data.available ? "#059669" : "#D1D5DB",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: data.available ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
            {data.available ? "Available to guests" : "Hidden from guests"}
          </button>
        </div>
      </div>

      {/* Description — full width */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.magenta, display: "block", marginBottom: 6 }}>
          Description{" "}
          <span style={{ fontWeight: 400, color: "#A8A3A0" }}>(optional)</span>
        </label>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.5 }}
          value={data.description}
          onChange={(e) => set("description")(e.target.value)}
          placeholder="Room amenities, view, included breakfast, etc."
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "1.5px solid #E5E7EB",
            background: "white",
            color: "#6B7280",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(data)}
          disabled={saving}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: saving ? "#D1D5DB" : C.magenta,
            color: saving ? "#9CA3AF" : "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save Room"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Guest table row
───────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────
   Guest form modal (create + edit)
───────────────────────────────────────────────────────── */
function GuestFormModal({
  initial,
  accommodations,
  onSave,
  onClose,
  saving,
  title,
}: {
  initial: GuestFormData;
  accommodations: Accommodation[];
  onSave: (data: GuestFormData) => void;
  onClose: () => void;
  saving: boolean;
  title: string;
}) {
  const [data, setData] = useState<GuestFormData>(initial);
  const set = <K extends keyof GuestFormData>(k: K) => (v: GuestFormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10,
    padding: "9px 12px", fontSize: 14, color: "#2D2226", background: "white",
    outline: "none", fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: C.magenta,
    display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em",
  };
  const rowStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(30,12,22,0.55)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "100%", maxWidth: 600, background: "white", borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)", overflow: "hidden",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ background: C.magenta, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "white", fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: "22px 24px", overflowY: "auto", flex: 1 }}>
          {/* Name + attending */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={data.full_name} onChange={(e) => set("full_name")(e.target.value)} placeholder="e.g. Ama Mensah" />
            </div>
            <div>
              <label style={labelStyle}>Attending *</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={data.attending} onChange={(e) => set("attending")(e.target.value)}>
                <option value="yes">✓ Joyfully Accepts</option>
                <option value="no">✗ Unable to attend — sends best wishes</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={data.email} onChange={(e) => set("email")(e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} type="tel" value={data.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+233 XX XXX XXXX" />
            </div>
          </div>

          {data.attending === "yes" && (
            <>
              {/* Party size + arrival */}
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Number of Guests</label>
                  <input style={inputStyle} type="number" min="1" value={data.guest_count} onChange={(e) => set("guest_count")(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Arrival</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={data.arriving_early} onChange={(e) => set("arriving_early")(e.target.value)}>
                    <option value="">— Not specified —</option>
                    <option value="yes">Friday 1st May</option>
                    <option value="no">Saturday 2nd May</option>
                  </select>
                </div>
              </div>

              {/* Accommodation */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Accommodation</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={data.accommodation_id} onChange={(e) => { set("accommodation_id")(e.target.value); set("needs_accommodation")(e.target.value ? "yes" : "no"); }}>
                  <option value="">— Own arrangements / not specified —</option>
                  {accommodations.map((a) => (
                    <option key={a.id} value={String(a.id)}>{a.room_type} — {a.hotel_name} ({a.currency} {a.price_per_night}/night)</option>
                  ))}
                </select>
              </div>

              {/* Lunch + dietary */}
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Reception Lunch</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={data.staying_for_dinner} onChange={(e) => set("staying_for_dinner")(e.target.value)}>
                    <option value="">— Not specified —</option>
                    <option value="yes">Staying for lunch</option>
                    <option value="no">Meal to take away</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Dietary Notes</label>
                  <input style={inputStyle} value={data.dietary_notes} onChange={(e) => set("dietary_notes")(e.target.value)} placeholder="Allergies, halal, etc." />
                </div>
              </div>
            </>
          )}

          {/* Message */}
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>Message for the couple</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              value={data.message}
              onChange={(e) => set("message")(e.target.value)}
              placeholder="Well-wishes (optional)"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={saving}
            style={{ padding: "9px 20px", borderRadius: 9, border: "1.5px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={() => onSave(data)} disabled={saving || !data.full_name.trim()}
            style={{
              padding: "9px 24px", borderRadius: 9, border: "none",
              background: saving || !data.full_name.trim() ? "#E5E7EB" : C.magenta,
              color: saving || !data.full_name.trim() ? "#A8A3A0" : "white",
              fontSize: 14, fontWeight: 700, cursor: saving || !data.full_name.trim() ? "default" : "pointer", fontFamily: "inherit",
            }}>
            {saving ? "Saving…" : "Save RSVP"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GuestRow({
  guest,
  onDelete,
  onEdit,
}: {
  guest: Guest;
  onDelete: (id: number) => void;
  onEdit: (guest: Guest) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: 14,
    color: "#2D2226",
    borderBottom: "1px solid #F3F4F6",
    verticalAlign: "top",
  };

  return (
    <tr style={{ background: "white" }}>
      <td style={tdStyle}>
        <div style={{ fontWeight: 600 }}>{guest.full_name}</div>
        {guest.email && <div style={{ fontSize: 12, color: "#A8A3A0", marginTop: 2 }}>{guest.email}</div>}
        {guest.phone && <div style={{ fontSize: 12, color: "#A8A3A0" }}>{guest.phone}</div>}
      </td>

      <td style={tdStyle}>
        {guest.attending === "yes" ? (
          <Badge color="green">Attending</Badge>
        ) : (
          <Badge color="red">Declined</Badge>
        )}
      </td>

      <td style={{ ...tdStyle, textAlign: "center" }}>
        {guest.attending === "yes" ? (
          <span style={{ fontWeight: 600 }}>{guest.guest_count}</span>
        ) : (
          <span style={{ color: "#D1D5DB" }}>—</span>
        )}
      </td>

      <td style={tdStyle}>
        {guest.arriving_early === "yes" ? (
          <Badge color="gold">Fri 1st May</Badge>
        ) : guest.arriving_early === "no" ? (
          <Badge color="grey">Sat 2nd May</Badge>
        ) : (
          <span style={{ color: "#D1D5DB" }}>—</span>
        )}
      </td>

      <td style={tdStyle}>
        {guest.accommodation_room ? (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{guest.accommodation_room}</div>
            <div style={{ fontSize: 12, color: "#A8A3A0" }}>{guest.accommodation_hotel}</div>
            {guest.accommodation_price != null && guest.accommodation_currency && (
              <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, marginTop: 2 }}>
                {formatPrice(guest.accommodation_price, guest.accommodation_currency)}/night
              </div>
            )}
          </div>
        ) : guest.needs_accommodation === "yes" ? (
          <Badge color="gold">Requested</Badge>
        ) : guest.needs_accommodation === "no" ? (
          <Badge color="grey">Own arrangements</Badge>
        ) : (
          <span style={{ color: "#D1D5DB" }}>—</span>
        )}
      </td>

      <td style={tdStyle}>
        {guest.staying_for_dinner === "yes" ? (
          <Badge color="green">Yes</Badge>
        ) : guest.staying_for_dinner === "no" ? (
          <Badge color="grey">No</Badge>
        ) : (
          <span style={{ color: "#D1D5DB" }}>—</span>
        )}
      </td>

      <td style={{ ...tdStyle, maxWidth: 200 }}>
        {guest.dietary_notes ? (
          <span style={{ fontSize: 13 }}>{guest.dietary_notes}</span>
        ) : (
          <span style={{ color: "#D1D5DB" }}>—</span>
        )}
      </td>

      <td style={{ ...tdStyle, maxWidth: 200 }}>
        {guest.message ? (
          <span style={{ fontSize: 13, fontStyle: "italic" }}>
            {guest.message.length > 80 ? guest.message.slice(0, 80) + "…" : guest.message}
          </span>
        ) : (
          <span style={{ color: "#D1D5DB" }}>—</span>
        )}
      </td>

      <td style={{ ...tdStyle, whiteSpace: "nowrap", fontSize: 12, color: "#A8A3A0" }}>
        {formatDate(guest.created_at)}
      </td>

      <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
        {confirming ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => { onDelete(guest.id); setConfirming(false); }}
              style={{ fontSize: 12, color: "#DC2626", background: "#FEE2E2", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{ fontSize: 12, color: "#6B7280", background: "#F3F4F6", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
            <button
              onClick={() => onEdit(guest)}
              title="Edit RSVP"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", padding: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.magenta)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#D1D5DB")}
            >
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => setConfirming(true)}
              title="Delete RSVP"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", padding: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#D1D5DB")}
            >
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm0 2h2l.382.764A1 1 0 0012.382 6H7.618A1 1 0 008.618 4.764L9 4zM7 8a1 1 0 012 0v5a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v5a1 1 0 11-2 0V8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────
   Main admin page
───────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [tab, setTab] = useState<NavTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    views24h: 0,
    views7d: 0,
    unique24h: 0,
    unique7d: 0,
    topPages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Accommodation form state */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<AccommodationFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  /* Guest form state */
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null);
  const [guestFormInitial, setGuestFormInitial] = useState<GuestFormData>(EMPTY_GUEST_FORM);
  const [savingGuest, setSavingGuest] = useState(false);

  /* Guest filter */
  const [guestFilter, setGuestFilter] = useState<"all" | "yes" | "no">("all");
  const [search, setSearch] = useState("");

  /* ── Data fetching ── */
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [gRes, aRes, dRes, anRes] = await Promise.all([
        fetch("/api/rsvp"),
        fetch("/api/accommodations?all=true"),
        fetch("/api/donations"),
        fetch("/api/analytics/summary"),
      ]);
      const gData = await gRes.json();
      const aData = await aRes.json();
      const dData = await dRes.json();
      const anData = await anRes.json();
      if (gData.success) setGuests(gData.guests);
      if (aData.success) setAccommodations(aData.accommodations);
      if (dData.success) setDonations(dData.donations);
      if (anData.success) setAnalytics(anData.analytics);
    } catch {
      if (!silent) setError("Failed to load data. Please refresh.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* Auto-refresh every 30 seconds — silent so the UI doesn't flicker */
  useEffect(() => {
    const id = setInterval(() => fetchAll(true), 30_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  /* Toast helper */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  /* ── Accommodation CRUD ── */
  function openAdd() {
    setEditingId(null);
    setFormInitial(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(acc: Accommodation) {
    setEditingId(acc.id);
    setFormInitial({
      hotel_name: acc.hotel_name,
      room_type: acc.room_type,
      description: acc.description ?? "",
      price_per_night: String(acc.price_per_night),
      currency: acc.currency,
      max_guests: String(acc.max_guests),
      available: acc.available === 1,
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSaveAccommodation(data: AccommodationFormData) {
    if (!data.hotel_name.trim() || !data.room_type.trim()) {
      setFormError("Hotel name and room type are required.");
      return;
    }
    const price = parseFloat(data.price_per_night);
    if (isNaN(price) || price < 0) {
      setFormError("Please enter a valid price.");
      return;
    }
    setFormError("");
    setSaving(true);

    const body = {
      hotel_name: data.hotel_name.trim(),
      room_type: data.room_type.trim(),
      description: data.description.trim() || null,
      price_per_night: price,
      currency: data.currency,
      max_guests: parseInt(data.max_guests) || 2,
      available: data.available,
    };

    try {
      const url = editingId
        ? `/api/accommodations/${editingId}`
        : "/api/accommodations";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (result.success) {
        setShowForm(false);
        setEditingId(null);
        await fetchAll();
        showToast(editingId ? "Room updated successfully." : "Room added successfully.");
      } else {
        setFormError(result.error ?? "Failed to save.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccommodation(id: number) {
    try {
      const res = await fetch(`/api/accommodations/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        await fetchAll();
        showToast(result.message ?? "Room removed.");
      }
    } catch {
      showToast("Failed to delete room.");
    }
  }

  async function handleToggleAvailable(acc: Accommodation) {
    try {
      await fetch(`/api/accommodations/${acc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...acc, available: acc.available === 1 ? false : true }),
      });
      await fetchAll();
      showToast(`Room ${acc.available === 1 ? "hidden" : "made available"}.`);
    } catch {
      showToast("Failed to update status.");
    }
  }

  /* ── Guest operations ── */
  async function handleDeleteGuest(id: number) {
    try {
      const res = await fetch(`/api/rsvp/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setGuests((g) => g.filter((x) => x.id !== id));
        showToast("RSVP deleted.");
      }
    } catch {
      showToast("Failed to delete RSVP.");
    }
  }

  function openNewGuest() {
    setEditingGuestId(null);
    setGuestFormInitial(EMPTY_GUEST_FORM);
    setShowGuestForm(true);
  }

  function openEditGuest(guest: Guest) {
    setEditingGuestId(guest.id);
    setGuestFormInitial({
      full_name: guest.full_name,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      attending: guest.attending,
      guest_count: String(guest.guest_count),
      arriving_early: guest.arriving_early ?? "",
      needs_accommodation: guest.needs_accommodation ?? "",
      accommodation_id: guest.accommodation_id ? String(guest.accommodation_id) : "",
      staying_for_dinner: guest.staying_for_dinner ?? "",
      dietary_notes: guest.dietary_notes ?? "",
      message: guest.message ?? "",
    });
    setShowGuestForm(true);
  }

  async function handleSaveGuest(data: GuestFormData) {
    setSavingGuest(true);
    try {
      const body = {
        full_name: data.full_name.trim(),
        email: data.email || null,
        phone: data.phone || null,
        attending: data.attending,
        guest_count: Number(data.guest_count) || 1,
        arriving_early: data.arriving_early || null,
        needs_accommodation: data.needs_accommodation || null,
        accommodation_id: data.accommodation_id ? Number(data.accommodation_id) : null,
        staying_for_dinner: data.staying_for_dinner || null,
        dietary_notes: data.dietary_notes || null,
        message: data.message || null,
      };
      if (editingGuestId) {
        const res = await fetch(`/api/rsvp/${editingGuestId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) { await fetchAll(); setShowGuestForm(false); showToast("RSVP updated."); }
        else showToast(result.error ?? "Failed to update.");
      } else {
        const res = await fetch("/api/rsvp", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) { await fetchAll(); setShowGuestForm(false); showToast("RSVP created."); }
        else showToast(result.error ?? "Failed to create.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setSavingGuest(false);
    }
  }

  /* ── Derived stats ── */
  const attending = guests.filter((g) => g.attending === "yes");
  const declining = guests.filter((g) => g.attending === "no");
  const totalAttendingPeople = attending.reduce((s, g) => s + (Number(g.guest_count) || 0), 0);
  const totalGuests = guests.length;
  const confirmedDonations = donations.filter((d) => d.status === "confirmed");
  const totalDonations = confirmedDonations.reduce((s, d) => s + (Number(d.amount) || 0), 0);

  /* ── Filtered guest list ── */
  const filteredGuests = guests.filter((g) => {
    const matchesFilter = guestFilter === "all" || g.attending === guestFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      g.full_name.toLowerCase().includes(q) ||
      (g.email ?? "").toLowerCase().includes(q) ||
      (g.phone ?? "").includes(q);
    return matchesFilter && matchesSearch;
  });

  /* ── Recent activity feed (last 5 RSVPs + last 5 donations by created_at desc) ── */
  type ActivityItem =
    | { kind: "rsvp"; ts: string; guest: Guest }
    | { kind: "donation"; ts: string; donation: Donation };

  const activityItems: ActivityItem[] = [
    ...guests.slice(0, 5).map((g): ActivityItem => ({ kind: "rsvp", ts: g.created_at, guest: g })),
    ...donations.slice(0, 5).map((d): ActivityItem => ({ kind: "donation", ts: d.created_at, donation: d })),
  ]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 8);

  /* ── Tab page title ── */
  const pageTitles: Record<NavTab, string> = {
    dashboard:      "Dashboard",
    rsvps:          "RSVPs",
    donations:      "Donations",
    accommodations: "Accommodations",
  };

  /* ── Sidebar nav items ── */
  const navItems: { id: NavTab; icon: string; label: string; count?: number }[] = [
    { id: "dashboard",      icon: "📊", label: "Dashboard" },
    { id: "rsvps",          icon: "👥", label: "RSVPs",          count: guests.length },
    { id: "donations",      icon: "💛", label: "Donations",      count: donations.length },
    { id: "accommodations", icon: "🏨", label: "Accommodations", count: accommodations.length },
  ];

  /* ─────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "var(--font-body, system-ui, sans-serif)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Guest form modal */}
      {showGuestForm && (
        <GuestFormModal
          title={editingGuestId ? "Edit RSVP" : "New RSVP"}
          initial={guestFormInitial}
          accommodations={accommodations}
          onSave={handleSaveGuest}
          onClose={() => setShowGuestForm(false)}
          saving={savingGuest}
        />
      )}

      {/* ════════════════════════════════════════════════
          MOBILE TOP BAR (visible on small screens)
      ════════════════════════════════════════════════ */}
      <div
        className="mobile-topbar"
        style={{
          display: "none",
          background: C.sidebarBg,
          padding: "0 16px",
          height: 52,
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
          Eyram &amp; Loretta
        </span>
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
          aria-label="Toggle menu"
        >
          <span style={{ display: "block", width: 22, height: 2, background: "white", borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2, background: "white", borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2, background: "white", borderRadius: 2 }} />
        </button>
      </div>

      {/* ════════════════════════════════════════════════
          BODY: sidebar + main
      ════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* ── Sidebar ── */}
        <aside
          className="sidebar"
          style={{
            width: 260,
            background: C.sidebarBg,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            minHeight: "100vh",
          }}
        >
          {/* Brand */}
          <div style={{ padding: "28px 24px 20px" }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "white",
                fontFamily: "var(--font-playfair, Georgia, serif)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              Eyram &amp; Loretta
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Wedding Admin · 2 May 2026
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 16px 12px" }} />

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "0 10px" }}>
            {navItems.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: active ? `rgba(156,0,82,0.6)` : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.55)",
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    marginBottom: 2,
                    textAlign: "left",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                        color: active ? "white" : "rgba(255,255,255,0.5)",
                        borderRadius: 20,
                        padding: "2px 8px",
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom links */}
          <div style={{ padding: "12px 10px 24px" }}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 6px 12px" }} />
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
                fontSize: 13,
                marginBottom: 2,
              }}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L1.586 10H1a1 1 0 010-2h.586L6.293 3.293a1 1 0 011.414 1.414L4.414 8H14a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              View RSVP page
            </a>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M10 3a1 1 0 011 1v2h2a1 1 0 010 2h-2v2a1 1 0 01-1.707.707l-3-3a1 1 0 010-1.414l3-3A1 1 0 0110 3zM3 3a1 1 0 011-1h1a1 1 0 010 2H4v8h1a1 1 0 010 2H4a1 1 0 01-1-1V3z" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              display: "flex",
            }}
            onClick={() => setSidebarOpen(false)}
          >
            <div style={{ background: "rgba(0,0,0,0.5)", position: "absolute", inset: 0 }} />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                width: 260,
                background: C.sidebarBg,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "28px 24px 20px" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "white", fontFamily: "var(--font-playfair, Georgia, serif)" }}>
                  Eyram &amp; Loretta
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Wedding Admin · 2 May 2026
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 16px 12px" }} />
              <nav style={{ flex: 1, padding: "0 10px" }}>
                {navItems.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: active ? "rgba(156,0,82,0.6)" : "transparent",
                        color: active ? "white" : "rgba(255,255,255,0.55)",
                        fontSize: 14,
                        fontWeight: active ? 600 : 400,
                        cursor: "pointer",
                        marginBottom: 2,
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.count !== undefined && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", borderRadius: 20, padding: "2px 8px" }}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* Top header bar */}
          <div
            style={{
              background: "white",
              borderBottom: "1px solid #F0D0E8",
              padding: "0 28px",
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2D2226" }}>
              {pageTitles[tab]}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => fetchAll()}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #E5E7EB",
                  background: "white",
                  color: loading ? "#A8A3A0" : "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="13"
                  height="13"
                  fill="currentColor"
                  style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
                >
                  <path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 01.908-.418A6 6 0 118 2v1z" clipRule="evenodd" />
                  <path d="M8 4.466V.534a.25.25 0 01.41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 018 4.466z" />
                </svg>
                {loading ? "Loading…" : "Refresh"}
              </button>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/admin/login";
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1.5px solid rgba(156,0,82,0.25)",
                  background: C.cream,
                  color: C.magenta,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

            {/* Global error */}
            {error && (
              <div
                style={{
                  background: "#FEE2E2",
                  color: "#991B1B",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 20,
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#A8A3A0", fontSize: 15 }}>
                Loading…
              </div>
            )}

            {/* ════════════════════════════════════════════
                DASHBOARD TAB
            ════════════════════════════════════════════ */}
            {!loading && tab === "dashboard" && (
              <div>
                {/* Stats row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 16,
                    marginBottom: 28,
                  }}
                >
                  <StatCard label="Total RSVPs"      value={guests.length}     accent={C.gold} />
                  <StatCard label="Attending"         value={attending.length}  sub={`${totalAttendingPeople} people total`} accent="#059669" />
                  <StatCard label="Declining"         value={declining.length}  accent="#DC2626" />
                  <StatCard label="Total Guests"      value={totalGuests}       accent={C.magenta} />
                  <StatCard
                    label="Total Donations"
                    value={formatPrice(totalDonations, "GHS")}
                    sub="confirmed only"
                    accent={C.goldMed}
                  />
                  <StatCard
                    label="Visitors (24h)"
                    value={analytics.unique24h}
                    sub={`${analytics.views24h} page views`}
                    accent="#0EA5E9"
                  />
                  <StatCard
                    label="Visitors (7d)"
                    value={analytics.unique7d}
                    sub={`${analytics.views7d} page views`}
                    accent="#2563EB"
                  />
                </div>

                {/* Charts row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 20,
                    marginBottom: 28,
                  }}
                >
                  {/* Attendance bar chart */}
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "20px 24px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2D2226", marginBottom: 16 }}>
                      RSVP Attendance
                    </div>
                    <AttendanceBarChart
                      attending={attending.length}
                      declining={declining.length}
                    />
                    <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: "#059669", display: "inline-block" }} />
                        Attending
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: "#DC2626", display: "inline-block" }} />
                        Declined
                      </div>
                    </div>
                  </div>

                  {/* Donations line chart */}
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "20px 24px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2D2226", marginBottom: 16 }}>
                      Donations Over Time (GHS)
                    </div>
                    <DonationsLineChart donations={donations} />
                  </div>
                </div>

                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "20px 24px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    marginBottom: 28,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2D2226", marginBottom: 12 }}>
                    Top Pages (Last 7 Days)
                  </div>
                  {analytics.topPages.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#A8A3A0" }}>No visitor data yet.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {analytics.topPages.map((p) => (
                        <div key={p.path} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: "#374151" }}>{p.path}</span>
                          <span style={{ color: "#6B7280", fontWeight: 600 }}>{p.views}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent activity feed */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "20px 24px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2D2226", marginBottom: 16 }}>
                    Recent Activity
                  </div>
                  {activityItems.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#A8A3A0", padding: "24px 0", fontSize: 14 }}>
                      No activity yet.
                    </div>
                  ) : (
                    <div>
                      {activityItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "12px 0",
                            borderBottom: idx < activityItems.length - 1 ? "1px solid #F3F4F6" : "none",
                          }}
                        >
                          {/* Icon */}
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                              flexShrink: 0,
                              background:
                                item.kind === "rsvp"
                                  ? (item.guest.attending === "yes" ? "#D1FAE5" : "#FEE2E2")
                                  : "#FEF3C7",
                            }}
                          >
                            {item.kind === "rsvp"
                              ? (item.guest.attending === "yes" ? "✅" : "❌")
                              : "💛"}
                          </div>

                          {/* Text */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {item.kind === "rsvp" ? (
                              <>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#2D2226" }}>
                                  {item.guest.full_name}
                                </div>
                                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                                  {item.guest.attending === "yes"
                                    ? `RSVP'd attending · ${item.guest.guest_count} guest${item.guest.guest_count !== 1 ? "s" : ""}`
                                    : "Unable to attend — sends best wishes"}
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#2D2226" }}>
                                  {item.donation.donor_name ?? "Anonymous"}
                                </div>
                                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                                  Donated {formatPrice(item.donation.amount, item.donation.currency)}
                                  {item.donation.donor_network ? ` via ${item.donation.donor_network}` : ""}
                                  {" · "}
                                  <span
                                    style={{
                                      color:
                                        item.donation.status === "confirmed"
                                          ? "#059669"
                                          : item.donation.status === "failed"
                                          ? "#DC2626"
                                          : C.gold,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {item.donation.status}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Time */}
                          <div style={{ fontSize: 12, color: "#A8A3A0", whiteSpace: "nowrap" }}>
                            {formatDate(item.ts)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                RSVPS TAB
            ════════════════════════════════════════════ */}
            {!loading && tab === "rsvps" && (
              <div>
                {/* Filters + New RSVP button */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={openNewGuest}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "9px 18px", borderRadius: 10, border: "none",
                      background: C.magenta, color: "white",
                      fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      boxShadow: "0 2px 8px rgba(156,0,82,0.2)",
                    }}
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/></svg>
                    New RSVP
                  </button>
                  <input
                    type="search"
                    placeholder="Search by name, email or phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      padding: "9px 14px",
                      fontSize: 14,
                      color: "#2D2226",
                      outline: "none",
                      minWidth: 240,
                      background: "white",
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["all", "yes", "no"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setGuestFilter(f)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 20,
                          border: "1.5px solid",
                          borderColor: guestFilter === f ? C.magenta : "#E5E7EB",
                          background: guestFilter === f ? C.magenta : "white",
                          color: guestFilter === f ? "white" : "#6B7280",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {f === "all" ? "All" : f === "yes" ? "Attending" : "Declined"}
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: "#A8A3A0", marginLeft: "auto" }}>
                    {filteredGuests.length} result{filteredGuests.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {filteredGuests.length === 0 ? (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "#A8A3A0",
                      fontSize: 15,
                    }}
                  >
                    {guests.length === 0 ? "No RSVPs received yet." : "No results match your search."}
                  </div>
                ) : (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      overflow: "auto",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                      <thead>
                        <tr style={{ background: C.cream }}>
                          {[
                            "Guest",
                            "Status",
                            "Party",
                            "Arrival",
                            "Accommodation",
                            "Dinner",
                            "Dietary",
                            "Message",
                            "Submitted",
                            "",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "12px 16px",
                                textAlign: h === "Party" || h === "" ? "center" : "left",
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.magenta,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                borderBottom: "2px solid rgba(200,150,12,0.2)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGuests.map((g) => (
                          <GuestRow key={g.id} guest={g} onDelete={handleDeleteGuest} onEdit={openEditGuest} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════
                DONATIONS TAB
            ════════════════════════════════════════════ */}
            {!loading && tab === "donations" && (
              <div>
                {/* Summary */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <StatCard
                    label="Total Donations"
                    value={confirmedDonations.length}
                    sub="confirmed only"
                    accent={C.goldMed}
                  />
                  <StatCard
                    label="Confirmed"
                    value={donations.filter((d) => d.status === "confirmed").length}
                    accent="#059669"
                  />
                  <StatCard
                    label="Pending"
                    value={donations.filter((d) => d.status === "pending").length}
                    accent={C.gold}
                  />
                  <StatCard
                    label="Total Amount (GHS)"
                    value={formatPrice(totalDonations, "GHS")}
                    sub="confirmed only"
                    accent={C.magenta}
                  />
                </div>

                {donations.length === 0 ? (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "#A8A3A0",
                      fontSize: 15,
                    }}
                  >
                    No donations recorded yet.
                  </div>
                ) : (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      overflow: "auto",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                      <thead>
                        <tr style={{ background: C.cream }}>
                          {["Date", "Donor", "Phone", "Network", "Amount", "Status"].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "12px 16px",
                                textAlign: "left",
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.magenta,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                borderBottom: "2px solid rgba(200,150,12,0.2)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map((d) => (
                          <tr key={d.id} style={{ background: "white" }}>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: 13,
                                color: "#A8A3A0",
                                borderBottom: "1px solid #F3F4F6",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(d.created_at)}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: 14,
                                color: "#2D2226",
                                borderBottom: "1px solid #F3F4F6",
                                fontWeight: 600,
                              }}
                            >
                              {d.donor_name ?? (
                                <span style={{ color: "#A8A3A0", fontWeight: 400 }}>Anonymous</span>
                              )}
                              <div style={{ fontSize: 11, color: "#A8A3A0", fontWeight: 400, marginTop: 1 }}>
                                ref: {d.reference}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: 13,
                                color: "#6B7280",
                                borderBottom: "1px solid #F3F4F6",
                              }}
                            >
                              {d.donor_phone ?? <span style={{ color: "#D1D5DB" }}>—</span>}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: 13,
                                color: "#6B7280",
                                borderBottom: "1px solid #F3F4F6",
                              }}
                            >
                              {d.donor_network ?? <span style={{ color: "#D1D5DB" }}>—</span>}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                fontSize: 14,
                                fontWeight: 700,
                                color: C.gold,
                                borderBottom: "1px solid #F3F4F6",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatPrice(d.amount, d.currency)}
                            </td>
                            <td
                              style={{
                                padding: "14px 16px",
                                borderBottom: "1px solid #F3F4F6",
                              }}
                            >
                              <Badge
                                color={
                                  d.status === "confirmed"
                                    ? "green"
                                    : d.status === "failed"
                                    ? "red"
                                    : "gold"
                                }
                              >
                                {d.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════
                ACCOMMODATIONS TAB
            ════════════════════════════════════════════ */}
            {!loading && tab === "accommodations" && (
              <div>
                {/* Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <p style={{ fontSize: 14, color: "#6B7280" }}>
                    These room options are shown to guests when they RSVP with early arrival.
                  </p>
                  {!showForm && (
                    <button
                      onClick={openAdd}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 20px",
                        background: C.magenta,
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                        <path d="M8 2a1 1 0 011 1v4h4a1 1 0 110 2H9v4a1 1 0 11-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z" />
                      </svg>
                      Add Room
                    </button>
                  )}
                </div>

                {/* Add / Edit form */}
                {showForm && (
                  <>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: C.magenta,
                        marginBottom: 12,
                        fontFamily: "var(--font-playfair, Georgia, serif)",
                      }}
                    >
                      {editingId ? "Edit Room" : "Add New Room"}
                    </div>
                    {formError && (
                      <div
                        style={{
                          background: "#FEE2E2",
                          color: "#991B1B",
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontSize: 14,
                          marginBottom: 12,
                        }}
                      >
                        {formError}
                      </div>
                    )}
                    <AccommodationForm
                      initial={formInitial}
                      onSave={handleSaveAccommodation}
                      onCancel={() => { setShowForm(false); setEditingId(null); }}
                      saving={saving}
                    />
                  </>
                )}

                {/* Accommodations list */}
                {accommodations.length === 0 && !showForm ? (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "#A8A3A0",
                      fontSize: 15,
                    }}
                  >
                    No room options added yet.{" "}
                    <button
                      onClick={openAdd}
                      style={{ color: C.magenta, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 15 }}
                    >
                      Add Room
                    </button>{" "}
                    to create your first option.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {accommodations.map((acc) => {
                      const bookings = guests.filter((g) => g.accommodation_id === acc.id).length;
                      return (
                        <div
                          key={acc.id}
                          style={{
                            background: "white",
                            borderRadius: 16,
                            padding: 20,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                            border: acc.available ? "1.5px solid #E5E7EB" : "1.5px dashed #E5E7EB",
                            opacity: acc.available ? 1 : 0.7,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 17, fontWeight: 700, color: "#2D2226", lineHeight: 1.2 }}>
                                {acc.room_type}
                              </div>
                              <div style={{ fontSize: 13, color: "#A8A3A0", marginTop: 2 }}>
                                {acc.hotel_name}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                              <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>
                                {formatPrice(acc.price_per_night, acc.currency)}
                              </div>
                              <div style={{ fontSize: 12, color: "#A8A3A0" }}>per night</div>
                            </div>
                          </div>

                          {acc.description && (
                            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 10, lineHeight: 1.5 }}>
                              {acc.description}
                            </p>
                          )}

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                            <Badge color={acc.available ? "green" : "grey"}>
                              {acc.available ? "Visible" : "Hidden"}
                            </Badge>
                            <Badge color="gold">
                              Up to {acc.max_guests} {acc.max_guests === 1 ? "guest" : "guests"}
                            </Badge>
                            {bookings > 0 && (
                              <Badge color="blue">
                                {bookings} booking{bookings > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => openEdit(acc)}
                              style={{
                                flex: 1,
                                padding: "8px 0",
                                borderRadius: 8,
                                border: "1.5px solid #E5E7EB",
                                background: "white",
                                color: "#374151",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleAvailable(acc)}
                              style={{
                                flex: 1,
                                padding: "8px 0",
                                borderRadius: 8,
                                border: "1.5px solid #E5E7EB",
                                background: "white",
                                color: acc.available ? "#D97706" : "#059669",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {acc.available ? "Hide" : "Show"}
                            </button>
                            <button
                              onClick={() => handleDeleteAccommodation(acc.id)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1.5px solid #FEE2E2",
                                background: "white",
                                color: "#DC2626",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                              title="Delete room"
                            >
                              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M7 2a1 1 0 00-.894.553L5.382 4H3a1 1 0 000 2v8a2 2 0 002 2h6a2 2 0 002-2V6a1 1 0 000-2h-2.382l-.724-1.447A1 1 0 009 2H7zm0 2h2l.382.764A1 1 0 0010.382 6H5.618A1 1 0 006.618 4.764L7 4zM6 8a1 1 0 012 0v3a1 1 0 11-2 0V8zm3 0a1 1 0 012 0v3a1 1 0 11-2 0V8z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#2D2226",
            color: "white",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            zIndex: 200,
          }}
        >
          {toast}
        </div>
      )}

      {/* ── Global styles ── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .sidebar      { display: none !important; }
          .mobile-topbar { display: flex !important; }
        }
        @media (max-width: 560px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

const ADMIN_C = {
  magenta:    "#9C0052",
  magentaMed: "#C20068",
  magentaBright: "#E91E8C",
  gold:       "#C8960C",
  goldMed:    "#E0B030",
  cream:      "#FEF0F6",
  border:     "#F0D0E8",
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

interface AccommodationFormData {
  hotel_name: string;
  room_type: string;
  description: string;
  price_per_night: string;
  currency: string;
  max_guests: string;
  available: boolean;
}

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

/* ─────────────────────────────────────────────────────────
   UI primitives
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
    red: { background: "#FEE2E2", color: "#991B1B" },
    gold: { background: "#FEF3C7", color: "#92400E" },
    grey: { background: "#F3F4F6", color: "#374151" },
    blue: { background: "#DBEAFE", color: "#1E40AF" },
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
        borderLeft: `4px solid ${accent ?? ADMIN_C.gold}`,
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
  };

  return (
    <div
      style={{
        background: ADMIN_C.cream,
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
          <label style={{ fontSize: 13, fontWeight: 600, color: ADMIN_C.magenta, display: "block", marginBottom: 6 }}>
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
          <label style={{ fontSize: 13, fontWeight: 600, color: ADMIN_C.magenta, display: "block", marginBottom: 6 }}>
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
          <label style={{ fontSize: 13, fontWeight: 600, color: ADMIN_C.magenta, display: "block", marginBottom: 6 }}>
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
          <label style={{ fontSize: 13, fontWeight: 600, color: ADMIN_C.magenta, display: "block", marginBottom: 6 }}>
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
          <label style={{ fontSize: 13, fontWeight: 600, color: ADMIN_C.magenta, display: "block", marginBottom: 6 }}>
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
          <label style={{ fontSize: 13, fontWeight: 600, color: ADMIN_C.magenta, display: "block", marginBottom: 6 }}>
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
        <label style={{ fontSize: 13, fontWeight: 600, color: ADMIN_C.magenta, display: "block", marginBottom: 6 }}>
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
            background: saving ? "#D1D5DB" : ADMIN_C.magenta,
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
   Guest row in table
───────────────────────────────────────────────────────── */
function GuestRow({
  guest,
  onDelete,
}: {
  guest: Guest;
  onDelete: (id: number) => void;
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
              <div style={{ fontSize: 12, color: ADMIN_C.gold, fontWeight: 600, marginTop: 2 }}>
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

      <td style={{ ...tdStyle, textAlign: "center" }}>
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
          <button
            onClick={() => setConfirming(true)}
            title="Delete RSVP"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", padding: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#D1D5DB")}
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm0 2h2l.382.764A1 1 0 0012.382 6H7.618A1 1 0 008.618 4.764L9 4zM7 8a1 1 0 012 0v5a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v5a1 1 0 11-2 0V8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────
   Main admin page
───────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [tab, setTab] = useState<"guests" | "accommodations">("guests");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Accommodation form state */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<AccommodationFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  /* Guest filter */
  const [guestFilter, setGuestFilter] = useState<"all" | "yes" | "no">("all");
  const [search, setSearch] = useState("");

  /* ── Data fetching ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [gRes, aRes] = await Promise.all([
        fetch("/api/rsvp"),
        fetch("/api/accommodations?all=true"),
      ]);
      const gData = await gRes.json();
      const aData = await aRes.json();
      if (gData.success) setGuests(gData.guests);
      if (aData.success) setAccommodations(aData.accommodations);
    } catch {
      setError("Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
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

  /* ── Derived stats ── */
  const attending = guests.filter((g) => g.attending === "yes");
  const declining = guests.filter((g) => g.attending === "no");
  const totalGuests = attending.reduce((s, g) => s + g.guest_count, 0);
  const needsAccom = guests.filter((g) => g.needs_accommodation === "yes" || g.accommodation_id != null);
  const stayingDinner = guests.filter((g) => g.staying_for_dinner === "yes");
  const arrivingEarly = guests.filter((g) => g.arriving_early === "yes");

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

  /* ─────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "var(--font-body)" }}>

      {/* ── Header ── */}
      <header
        style={{
          background: `linear-gradient(135deg, ${ADMIN_C.magenta} 0%, ${ADMIN_C.magentaMed} 100%)`,
          padding: "0 24px",
          boxShadow: "0 2px 16px rgba(156,0,82,0.35)",
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "white",
                fontFamily: "var(--font-playfair)",
                letterSpacing: "-0.01em",
              }}
            >
              Eyram &amp; Loretta
              <span style={{ color: "#E2B862", marginLeft: 8, fontSize: 13, fontWeight: 400 }}>
                Wedding Admin
              </span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
              Saturday, 2nd May 2026 · Elmina Beach Resort, Accra
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a
              href="/"
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0L1.586 10H1a1 1 0 010-2h.586L6.293 3.293a1 1 0 011.414 1.414L4.414 8H14a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              View RSVP page
            </a>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              style={{
                fontSize: 13, color: "rgba(255,255,255,0.7)", background: "none",
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6,
                padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                <path d="M10 3a1 1 0 011 1v2h2a1 1 0 010 2h-2v2a1 1 0 01-1.707.707l-3-3a1 1 0 010-1.414l3-3A1 1 0 0110 3zM3 3a1 1 0 011-1h1a1 1 0 010 2H4v8h1a1 1 0 010 2H4a1 1 0 01-1-1V3z"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Error ── */}
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

        {/* ── Toast ── */}
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
              zIndex: 100,
              animation: "fadeUp 0.3s ease-out",
            }}
          >
            {toast}
          </div>
        )}

        {/* ── Stats row ── */}
        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <StatCard label="Total RSVPs" value={guests.length} accent={ADMIN_C.gold} />
            <StatCard
              label="Attending"
              value={attending.length}
              sub={`${totalGuests} people total`}
              accent="#059669"
            />
            <StatCard label="Declined" value={declining.length} accent="#DC2626" />
            <StatCard
              label="Arriving Early"
              value={arrivingEarly.length}
              sub="Fri 1st May"
              accent="#D4793A"
            />
            <StatCard
              label="Need Accommodation"
              value={needsAccom.length}
              accent={ADMIN_C.magenta}
            />
            <StatCard
              label="Reception Dinner"
              value={stayingDinner.length}
              accent="#7C3AED"
            />
          </div>
        )}

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "white",
            borderRadius: 12,
            padding: 4,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            marginBottom: 24,
            width: "fit-content",
          }}
        >
          {(["guests", "accommodations"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "9px 20px",
                borderRadius: 9,
                border: "none",
                background: tab === t ? ADMIN_C.magenta : "transparent",
                color: tab === t ? "white" : "#6B7280",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                textTransform: "capitalize",
              }}
            >
              {t === "guests" ? `Guests (${guests.length})` : `Accommodations (${accommodations.length})`}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#A8A3A0", fontSize: 15 }}>
            Loading…
          </div>
        )}

        {/* ════════════════════════════════════════════════
            GUESTS TAB
        ════════════════════════════════════════════════ */}
        {!loading && tab === "guests" && (
          <div>
            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Search */}
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

              {/* Filter pills */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["all", "yes", "no"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setGuestFilter(f)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      border: "1.5px solid",
                      borderColor: guestFilter === f ? ADMIN_C.magenta : "#E5E7EB",
                      background: guestFilter === f ? ADMIN_C.magenta : "white",
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

            {/* Table */}
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
                    <tr style={{ background: ADMIN_C.cream }}>
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
                            color: ADMIN_C.magenta,
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
                      <GuestRow key={g.id} guest={g} onDelete={handleDeleteGuest} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            ACCOMMODATIONS TAB
        ════════════════════════════════════════════════ */}
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
                    background: ADMIN_C.magenta,
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
                    color: ADMIN_C.magenta,
                    marginBottom: 12,
                    fontFamily: "var(--font-playfair)",
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
                No room options added yet. Click{" "}
                <button
                  onClick={openAdd}
                  style={{ color: ADMIN_C.magenta, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 15 }}
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
                      {/* Top row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: "#2D2226",
                              lineHeight: 1.2,
                            }}
                          >
                            {acc.room_type}
                          </div>
                          <div style={{ fontSize: 13, color: "#A8A3A0", marginTop: 2 }}>
                            {acc.hotel_name}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: ADMIN_C.gold }}>
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

                      {/* Meta row */}
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

                      {/* Actions */}
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

      {/* Responsive grid fix for accommodation form */}
      <style>{`
        @media (max-width: 560px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

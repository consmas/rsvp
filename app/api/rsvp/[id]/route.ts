import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "@/src/lib/db";

/* PUT /api/rsvp/[id] — update a guest RSVP (admin use) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInit();
    const { id } = await params;
    const body = await request.json();
    const {
      full_name, email, phone, attending, guest_count,
      arriving_early, needs_accommodation, accommodation_id,
      staying_for_dinner, dietary_notes, message,
    } = body;

    if (!full_name?.trim()) {
      return NextResponse.json({ success: false, error: "Full name is required." }, { status: 400 });
    }
    if (!["yes", "no"].includes(attending)) {
      return NextResponse.json({ success: false, error: "Attending must be 'yes' or 'no'." }, { status: 400 });
    }

    const result = await db.execute({
      sql: `UPDATE guests SET
              full_name = ?, email = ?, phone = ?, attending = ?, guest_count = ?,
              arriving_early = ?, needs_accommodation = ?, accommodation_id = ?,
              staying_for_dinner = ?, dietary_notes = ?, message = ?
            WHERE id = ?`,
      args: [
        full_name.trim(),
        email || null,
        phone || null,
        attending,
        attending === "yes" ? (Number(guest_count) || 1) : 1,
        arriving_early || null,
        needs_accommodation || null,
        accommodation_id ? Number(accommodation_id) : null,
        staying_for_dinner || null,
        dietary_notes || null,
        message || null,
        id,
      ],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, error: "Guest not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/rsvp/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update guest." }, { status: 500 });
  }
}

/* DELETE /api/rsvp/[id] — remove a guest RSVP (admin use) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInit();
    const { id } = await params;
    const result = await db.execute({ sql: "DELETE FROM guests WHERE id = ?", args: [id] });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, error: "Guest not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/rsvp/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete guest." }, { status: 500 });
  }
}

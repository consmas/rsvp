import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "@/src/lib/db";

/* PUT /api/accommodations/[id] — update */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInit();
    const { id } = await params;
    const body = await request.json();
    const { hotel_name, room_type, description, price_per_night, currency, max_guests, available } = body;

    if (!hotel_name?.trim() || !room_type?.trim()) {
      return NextResponse.json({ success: false, error: "Hotel name and room type are required." }, { status: 400 });
    }

    const result = await db.execute({
      sql: `UPDATE accommodations
            SET hotel_name = ?, room_type = ?, description = ?,
                price_per_night = ?, currency = ?, max_guests = ?, available = ?
            WHERE id = ?`,
      args: [
        hotel_name.trim(),
        room_type.trim(),
        description?.trim() || null,
        price_per_night,
        currency || "GHS",
        max_guests ?? 2,
        available === false ? 0 : 1,
        id,
      ],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, error: "Accommodation not found." }, { status: 404 });
    }

    const updated = await db.execute({ sql: "SELECT * FROM accommodations WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true, accommodation: updated.rows[0] });
  } catch (error) {
    console.error("PUT /api/accommodations/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update." }, { status: 500 });
  }
}

/* DELETE /api/accommodations/[id] — remove */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInit();
    const { id } = await params;

    const inUse = await db.execute({
      sql: "SELECT COUNT(*) as count FROM guests WHERE accommodation_id = ?",
      args: [id],
    });
    const count = Number(inUse.rows[0]?.count ?? 0);

    if (count > 0) {
      await db.execute({ sql: "UPDATE accommodations SET available = 0 WHERE id = ?", args: [id] });
      return NextResponse.json({
        success: true,
        message: `Hidden (${count} existing RSVP${count > 1 ? "s" : ""} reference this room — it has been deactivated rather than deleted).`,
      });
    }

    const result = await db.execute({ sql: "DELETE FROM accommodations WHERE id = ?", args: [id] });
    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, error: "Accommodation not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/accommodations/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete." }, { status: 500 });
  }
}

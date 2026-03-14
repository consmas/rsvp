import { NextRequest, NextResponse } from "next/server";
import db from "@/src/lib/db";

/* PUT /api/accommodations/[id] — update */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hotel_name, room_type, description, price_per_night, currency, max_guests, available } =
      body;

    if (!hotel_name?.trim() || !room_type?.trim()) {
      return NextResponse.json(
        { success: false, error: "Hotel name and room type are required." },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `UPDATE accommodations
         SET hotel_name = ?, room_type = ?, description = ?,
             price_per_night = ?, currency = ?, max_guests = ?, available = ?
         WHERE id = ?`
      )
      .run(
        hotel_name.trim(),
        room_type.trim(),
        description?.trim() || null,
        price_per_night,
        currency || "GHS",
        max_guests ?? 2,
        available === false ? 0 : 1,
        id
      );

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: "Accommodation not found." }, { status: 404 });
    }

    const updated = db.prepare("SELECT * FROM accommodations WHERE id = ?").get(id);
    return NextResponse.json({ success: true, accommodation: updated });
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
    const { id } = await params;

    /* Check if any guests have this accommodation selected */
    const inUse = db
      .prepare("SELECT COUNT(*) as count FROM guests WHERE accommodation_id = ?")
      .get(id) as { count: number };

    if (inUse.count > 0) {
      /* Soft-delete: mark unavailable so existing RSVPs aren't broken */
      db.prepare("UPDATE accommodations SET available = 0 WHERE id = ?").run(id);
      return NextResponse.json({
        success: true,
        message: `Hidden (${inUse.count} existing RSVP${inUse.count > 1 ? "s" : ""} reference this room — it has been deactivated rather than deleted).`,
      });
    }

    const result = db.prepare("DELETE FROM accommodations WHERE id = ?").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: "Accommodation not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/accommodations/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "@/src/lib/db";

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

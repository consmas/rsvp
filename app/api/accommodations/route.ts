import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "@/src/lib/db";

/* GET /api/accommodations
   ?all=true  → return all rows (admin use)
   default    → return only available=1 rows (public form) */
export async function GET(request: NextRequest) {
  try {
    await ensureInit();
    const all = request.nextUrl.searchParams.get("all") === "true";
    const result = all
      ? await db.execute("SELECT * FROM accommodations ORDER BY hotel_name, room_type")
      : await db.execute("SELECT * FROM accommodations WHERE available = 1 ORDER BY hotel_name, price_per_night");

    return NextResponse.json({ success: true, accommodations: result.rows });
  } catch (error) {
    console.error("GET /api/accommodations error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch accommodations." }, { status: 500 });
  }
}

/* POST /api/accommodations — create a new option */
export async function POST(request: NextRequest) {
  try {
    await ensureInit();
    const body = await request.json();
    const { hotel_name, room_type, description, price_per_night, currency, max_guests, available } = body;

    if (!hotel_name?.trim()) {
      return NextResponse.json({ success: false, error: "Hotel name is required." }, { status: 400 });
    }
    if (!room_type?.trim()) {
      return NextResponse.json({ success: false, error: "Room type is required." }, { status: 400 });
    }
    if (typeof price_per_night !== "number" || price_per_night < 0) {
      return NextResponse.json({ success: false, error: "Valid price is required." }, { status: 400 });
    }

    const insert = await db.execute({
      sql: `INSERT INTO accommodations (hotel_name, room_type, description, price_per_night, currency, max_guests, available)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        hotel_name.trim(),
        room_type.trim(),
        description?.trim() || null,
        price_per_night,
        currency || "GHS",
        max_guests ?? 2,
        available === false ? 0 : 1,
      ],
    });

    const created = await db.execute({
      sql: "SELECT * FROM accommodations WHERE id = ?",
      args: [insert.lastInsertRowid],
    });

    return NextResponse.json({ success: true, accommodation: created.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/accommodations error:", error);
    return NextResponse.json({ success: false, error: "Failed to create accommodation." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import db from "@/src/lib/db";

/* POST /api/rsvp — submit an RSVP */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      attending,
      guest_count,
      arriving_early,
      needs_accommodation,
      accommodation_id,
      staying_for_dinner,
      dietary_notes,
      message,
    } = body;

    if (!full_name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 }
      );
    }
    if (!["yes", "no"].includes(attending)) {
      return NextResponse.json(
        { success: false, error: "Attending must be 'yes' or 'no'." },
        { status: 400 }
      );
    }

    /* If an accommodation_id was supplied, verify it exists */
    if (accommodation_id != null) {
      const acc = db
        .prepare("SELECT id FROM accommodations WHERE id = ?")
        .get(accommodation_id);
      if (!acc) {
        return NextResponse.json(
          { success: false, error: "Selected accommodation no longer exists." },
          { status: 400 }
        );
      }
    }

    const result = db
      .prepare(
        `INSERT INTO guests (
          full_name, email, phone, attending, guest_count,
          arriving_early, needs_accommodation, accommodation_id,
          staying_for_dinner, dietary_notes, message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        full_name.trim(),
        email || null,
        phone || null,
        attending,
        attending === "yes" ? (guest_count ?? 1) : 1,
        arriving_early ?? null,
        needs_accommodation ?? null,
        accommodation_id ?? null,
        staying_for_dinner ?? null,
        dietary_notes || null,
        message || null
      );

    return NextResponse.json(
      { success: true, id: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/rsvp error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/* GET /api/rsvp — list all RSVPs with accommodation details joined */
export async function GET() {
  try {
    const guests = db
      .prepare(
        `SELECT
           g.*,
           a.hotel_name    AS accommodation_hotel,
           a.room_type     AS accommodation_room,
           a.price_per_night AS accommodation_price,
           a.currency      AS accommodation_currency
         FROM guests g
         LEFT JOIN accommodations a ON g.accommodation_id = a.id
         ORDER BY g.created_at DESC`
      )
      .all();

    return NextResponse.json({ success: true, guests });
  } catch (error) {
    console.error("GET /api/rsvp error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}

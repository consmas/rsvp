import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "@/src/lib/db";

/* GET /api/donations — list all donations ordered by created_at DESC */
export async function GET() {
  try {
    await ensureInit();
    const result = await db.execute(
      "SELECT * FROM donations ORDER BY created_at DESC"
    );
    return NextResponse.json({ success: true, donations: result.rows });
  } catch (error) {
    console.error("GET /api/donations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations." },
      { status: 500 }
    );
  }
}

/* POST /api/donations — create a new donation record */
export async function POST(request: NextRequest) {
  try {
    await ensureInit();
    const body = await request.json();
    const {
      reference,
      amount,
      currency,
      donor_name,
      donor_phone,
      donor_network,
      status,
    } = body;

    if (!reference?.trim()) {
      return NextResponse.json(
        { success: false, error: "Reference is required." },
        { status: 400 }
      );
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid amount is required." },
        { status: 400 }
      );
    }

    const insert = await db.execute({
      sql: `INSERT INTO donations (reference, amount, currency, donor_name, donor_phone, donor_network, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        reference.trim(),
        amount,
        currency || "GHS",
        donor_name || null,
        donor_phone || null,
        donor_network || null,
        status || "pending",
      ],
    });

    const created = await db.execute({
      sql: "SELECT * FROM donations WHERE id = ?",
      args: [Number(insert.lastInsertRowid)],
    });

    return NextResponse.json(
      { success: true, donation: created.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/donations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create donation." },
      { status: 500 }
    );
  }
}

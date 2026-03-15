import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "../../../../src/lib/db";

const CLIENT_ID = process.env.FLW_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.FLW_CLIENT_SECRET ?? "";
const FLW_ORCHESTRATION_BASE =
  process.env.FLW_ORCHESTRATION_BASE_URL ?? "https://f4bexperience.flutterwave.com";

function toStatus(value: string | null | undefined): "confirmed" | "failed" | "pending" {
  const normalized = (value ?? "").toLowerCase();
  if (["successful", "succeeded", "completed", "paid", "confirmed"].includes(normalized)) return "confirmed";
  if (["failed", "cancelled", "canceled", "reversed", "declined"].includes(normalized)) return "failed";
  return "pending";
}

async function getFlwToken(): Promise<string> {
  const basicCreds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await fetch(
    "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicCreds}`,
      },
      body: "grant_type=client_credentials",
    }
  );
  const data = await res.json();
  return data.access_token ?? "";
}

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference")?.trim();
    if (!reference) {
      return NextResponse.json({ success: false, error: "reference is required." }, { status: 400 });
    }

    await ensureInit();
    const row = await db.execute({
      sql: `SELECT id, reference, status, flutterwave_charge_id FROM donations WHERE reference = ? LIMIT 1`,
      args: [reference],
    });
    const donation = row.rows[0] as unknown as
      | { id: number; reference: string; status: string; flutterwave_charge_id?: string | null }
      | undefined;

    if (!donation) {
      return NextResponse.json({ success: false, error: "Donation not found." }, { status: 404 });
    }

    if (donation.status === "confirmed" || donation.status === "failed") {
      return NextResponse.json({ success: true, status: donation.status, reference: donation.reference });
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json({ success: false, error: "Flutterwave credentials are missing." }, { status: 500 });
    }

    if (!donation.flutterwave_charge_id) {
      return NextResponse.json({ success: true, status: "pending", reference: donation.reference });
    }

    const token = await getFlwToken();
    if (!token) {
      return NextResponse.json({ success: false, error: "Could not authenticate with payment provider." }, { status: 502 });
    }

    const flwRes = await fetch(
      `${FLW_ORCHESTRATION_BASE}/charges/${encodeURIComponent(donation.flutterwave_charge_id)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Trace-Id": crypto.randomUUID(),
        },
      }
    );

    const raw = await flwRes.text();
    let payload: any = null;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { success: false, error: "Payment provider returned an invalid response while verifying status." },
        { status: 502 }
      );
    }

    const providerStatus = payload?.data?.status ?? payload?.status ?? "pending";
    const mappedStatus = toStatus(providerStatus);

    await db.execute({
      sql: `UPDATE donations SET status = ? WHERE reference = ?`,
      args: [mappedStatus, reference],
    });

    return NextResponse.json({
      success: true,
      reference,
      status: mappedStatus,
      providerStatus,
      rawStatus: payload?.status ?? null,
    });
  } catch (error) {
    console.error("GET /api/payment/verify error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify payment." }, { status: 500 });
  }
}

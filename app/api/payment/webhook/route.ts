import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "../../../../src/lib/db";

const WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET ?? "";

function toStatus(value: string | null | undefined): "confirmed" | "failed" | "pending" {
  const normalized = (value ?? "").toLowerCase();
  if (["successful", "succeeded", "completed", "paid", "confirmed"].includes(normalized)) return "confirmed";
  if (["failed", "cancelled", "canceled", "reversed", "declined"].includes(normalized)) return "failed";
  return "pending";
}

export async function POST(request: NextRequest) {
  try {
    const verifHash = request.headers.get("verif-hash") ?? request.headers.get("x-flw-signature");
    if (WEBHOOK_SECRET && verifHash !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = await request.json();

    const reference =
      payload?.data?.reference ??
      payload?.data?.tx_ref ??
      payload?.reference ??
      payload?.tx_ref ??
      null;
    const chargeId =
      payload?.data?.id ??
      payload?.data?.charge_id ??
      payload?.id ??
      payload?.charge_id ??
      null;
    const providerStatus =
      payload?.data?.status ??
      payload?.status ??
      null;
    const mappedStatus = toStatus(providerStatus);

    await ensureInit();

    if (reference) {
      await db.execute({
        sql: `UPDATE donations
              SET status = ?, flutterwave_charge_id = COALESCE(?, flutterwave_charge_id)
              WHERE reference = ?`,
        args: [mappedStatus, chargeId, String(reference)],
      });
    } else if (chargeId) {
      await db.execute({
        sql: `UPDATE donations
              SET status = ?
              WHERE flutterwave_charge_id = ?`,
        args: [mappedStatus, String(chargeId)],
      });
    } else {
      console.warn("FLW webhook received without reference/charge_id");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/payment/webhook error:", error);
    return NextResponse.json({ ok: false, error: "Webhook processing failed." }, { status: 500 });
  }
}


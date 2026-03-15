import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "../../../../src/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://el.rohodev.com";
const CLIENT_ID = process.env.FLW_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.FLW_CLIENT_SECRET ?? "";
const FLW_ORCHESTRATION_BASE =
  process.env.FLW_ORCHESTRATION_BASE_URL ?? "https://f4bexperience.flutterwave.com";

function normalizePhone(phone: string | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("233")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function getRedirectUrl(data: any): string | null {
  if (typeof data?.data?.redirect_url === "string" && data.data.redirect_url) return data.data.redirect_url;
  if (typeof data?.redirect_url === "string" && data.redirect_url) return data.redirect_url;
  const redirect = data?.data?.next_action?.redirect_url;
  if (typeof redirect === "string" && redirect) return redirect;
  if (typeof redirect?.url === "string" && redirect.url) return redirect.url;
  if (typeof data?.data?.next_action?.url === "string" && data.data.next_action.url) return data.data.next_action.url;
  if (typeof data?.data?.link === "string" && data.data.link) return data.data.link;
  return null;
}

function shortSnippet(input: string, max = 220): string {
  const clean = input.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
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

export async function POST(request: NextRequest) {
  try {
    const { amount, name, email, paymentMethod, momoPhone, momoNetwork } = await request.json();

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Flutterwave credentials are missing. Set FLW_CLIENT_ID and FLW_CLIENT_SECRET." },
        { status: 500 }
      );
    }

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Please enter a valid amount." }, { status: 400 });
    }

    if (paymentMethod !== "mobile_money") {
      return NextResponse.json(
        {
          error:
            "This endpoint currently supports only Mobile Money. Card direct charges require encrypted card fields and additional authorization steps.",
        },
        { status: 400 }
      );
    }

    const phoneNumber = normalizePhone(momoPhone);
    if (!phoneNumber || phoneNumber.length < 9) {
      return NextResponse.json(
        { error: "Enter a valid Ghana mobile money phone number (e.g. 0241234567)." },
        { status: 400 }
      );
    }

    const token = await getFlwToken();
    if (!token) {
      return NextResponse.json({ error: "Could not authenticate with payment provider." }, { status: 502 });
    }

    const reference = `el-wedding-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const traceId = crypto.randomUUID();

    const nameParts = (name || "Wedding Guest").trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Guest";

    const paymentMethodBody = {
      type: "mobile_money",
      mobile_money: {
        phone_number: phoneNumber,
        network: (momoNetwork ?? "MTN").toUpperCase(),
        country_code: "233",
      },
    };

    const res = await fetch(
      `${FLW_ORCHESTRATION_BASE}/orchestration/direct-charges`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Trace-Id": traceId,
          "X-Idempotency-Key": reference,
        },
        body: JSON.stringify({
          reference,
          amount,
          currency: "GHS",
          redirect_url: `${BASE_URL}/payment/success`,
          customer: {
            email: email || "guest@wedding.com",
            name: { first: firstName, last: lastName },
            phone: { country_code: "233", number: phoneNumber },
          },
          payment_method: paymentMethodBody,
        }),
      }
    );

    const rawBody = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error("FLW non-JSON response:", {
        status: res.status,
        contentType: res.headers.get("content-type"),
        body: shortSnippet(rawBody),
      });
      return NextResponse.json(
        {
          error:
            "Payment provider returned an unexpected response. Check FLW_ORCHESTRATION_BASE_URL and API environment (sandbox vs live).",
        },
        { status: 502 }
      );
    }

    console.log("FLW v4 response:", JSON.stringify(data));

    // MoMo payment_instruction: charge created, USSD push sent to phone
    if (
      (data?.status === "success" || data?.data?.status === "pending") &&
      data?.data?.next_action?.type === "payment_instruction"
    ) {
      const note = data.data.next_action.payment_instruction?.note ??
        "Please authorise this payment on your mobile phone. It may take a few minutes to confirm.";
      // Save donation record
      try {
        await ensureInit();
        await db.execute({
          sql: `INSERT INTO donations (reference, amount, currency, donor_name, donor_phone, donor_network, status, flutterwave_charge_id)
                VALUES (?, ?, 'GHS', ?, ?, ?, 'pending', ?)
                ON CONFLICT(reference) DO UPDATE SET
                  amount = excluded.amount,
                  donor_name = excluded.donor_name,
                  donor_phone = excluded.donor_phone,
                  donor_network = excluded.donor_network,
                  flutterwave_charge_id = excluded.flutterwave_charge_id`,
          args: [reference, amount, name || null, momoPhone || null, momoNetwork || null, data?.data?.id ?? null],
        });
      } catch (e) {
        console.error("Failed to save donation record:", e);
      }
      return NextResponse.json({
        pending: true,
        message: note,
        reference: data.data.reference,
      });
    }

    const url = getRedirectUrl(data);

    if (!url) {
      console.error("FLW v4 no redirect URL:", data);
      const validationErrors = data?.error?.validation_errors
        ?.map((e: { field_name?: string; message?: string }) => `${e.field_name ?? "field"}: ${e.message ?? "invalid"}`)
        .join("; ");
      return NextResponse.json(
        {
          error:
            validationErrors ||
            data?.error?.message ||
            "Could not create payment. Please try again or use a manual option.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/payment/initiate error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

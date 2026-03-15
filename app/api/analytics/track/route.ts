import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import db, { ensureInit } from "@/src/lib/db";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "";
  return request.headers.get("x-real-ip") ?? "";
}

export async function POST(request: NextRequest) {
  try {
    await ensureInit();
    const body = await request.json();
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    const referrer = typeof body?.referrer === "string" ? body.referrer.trim() : null;
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : null;

    if (!path || !path.startsWith("/")) {
      return NextResponse.json({ success: false, error: "Invalid path." }, { status: 400 });
    }
    if (path.startsWith("/api") || path.startsWith("/admin") || path.startsWith("/_next")) {
      return NextResponse.json({ success: true });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? "";
    const visitorHash = createHash("sha256").update(`${ip}|${userAgent}`).digest("hex");

    await db.execute({
      sql: `INSERT INTO page_visits (path, referrer, session_id, visitor_hash, user_agent)
            VALUES (?, ?, ?, ?, ?)`,
      args: [path, referrer, sessionId, visitorHash, userAgent.slice(0, 255)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/analytics/track error:", error);
    return NextResponse.json({ success: false, error: "Failed to track visit." }, { status: 500 });
  }
}


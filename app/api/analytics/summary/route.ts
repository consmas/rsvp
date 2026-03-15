import { NextResponse } from "next/server";
import db, { ensureInit } from "@/src/lib/db";

type CountRow = { count?: number | string | null };
type TopPageRow = { path?: string | null; views?: number | string | null };

function toNum(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

export async function GET() {
  try {
    await ensureInit();

    const [views24hR, views7dR, unique24hR, unique7dR, topPagesR] = await Promise.all([
      db.execute(`SELECT COUNT(*) AS count FROM page_visits WHERE created_at >= datetime('now', '-1 day')`),
      db.execute(`SELECT COUNT(*) AS count FROM page_visits WHERE created_at >= datetime('now', '-7 day')`),
      db.execute(`SELECT COUNT(DISTINCT visitor_hash) AS count FROM page_visits WHERE created_at >= datetime('now', '-1 day')`),
      db.execute(`SELECT COUNT(DISTINCT visitor_hash) AS count FROM page_visits WHERE created_at >= datetime('now', '-7 day')`),
      db.execute(`
        SELECT path, COUNT(*) AS views
        FROM page_visits
        WHERE created_at >= datetime('now', '-7 day')
        GROUP BY path
        ORDER BY views DESC
        LIMIT 5
      `),
    ]);

    const views24h = toNum((views24hR.rows[0] as unknown as CountRow | undefined)?.count);
    const views7d = toNum((views7dR.rows[0] as unknown as CountRow | undefined)?.count);
    const unique24h = toNum((unique24hR.rows[0] as unknown as CountRow | undefined)?.count);
    const unique7d = toNum((unique7dR.rows[0] as unknown as CountRow | undefined)?.count);
    const topPages = topPagesR.rows.map((row) => {
      const r = row as unknown as TopPageRow;
      return { path: r.path ?? "/", views: toNum(r.views) };
    });

    return NextResponse.json({
      success: true,
      analytics: {
        views24h,
        views7d,
        unique24h,
        unique7d,
        topPages,
      },
    });
  } catch (error) {
    console.error("GET /api/analytics/summary error:", error);
    return NextResponse.json({ success: false, error: "Failed to load analytics." }, { status: 500 });
  }
}


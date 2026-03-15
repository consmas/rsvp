import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.AUTH_SECRET ?? "el-wedding-admin-2026";

async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const lastPipe = decoded.lastIndexOf("|");
    const payload = decoded.slice(0, lastPipe);
    const sigB64 = decoded.slice(lastPipe + 1);

    const parts = payload.split("|");
    if (parts.length !== 2) return false;
    const expiry = parseInt(parts[1]);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

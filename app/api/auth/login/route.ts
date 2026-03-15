import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.AUTH_SECRET ?? "el-wedding-admin-2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "eyramkwakut@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Letmein12@3";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function createToken(email: string): Promise<string> {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${email}|${expiry}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return btoa(`${payload}|${sigB64}`);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const expectedHash = await sha256(ADMIN_PASSWORD);
    const submittedHash = await sha256(password ?? "");

    if (email !== ADMIN_EMAIL || submittedHash !== expectedHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createToken(email);
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

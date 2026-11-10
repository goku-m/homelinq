import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminSessionCookie, adminSessionCookieOptions } from "@/lib/admin-auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${adminSessionCookie}=`));
  const token = cookie?.slice(adminSessionCookie.length + 1);

  if (token && /^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    await query("DELETE FROM admin_sessions WHERE token_hash = $1", [
      createHash("sha256").update(token).digest("hex"),
    ]);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie, "", { ...adminSessionCookieOptions, maxAge: 0 });
  return response;
}

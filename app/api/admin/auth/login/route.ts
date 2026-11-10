import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  adminSessionCookieOptions,
  authenticateAdmin,
  createAdminSession,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const admin = await authenticateAdmin(body.email, body.password);

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createAdminSession(admin.id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminSessionCookie, token, adminSessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}

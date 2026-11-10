import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

export const adminSessionCookie = "homelinq_admin_session";
const sessionDurationSeconds = 60 * 60 * 24 * 30;

type AdminRecord = {
  id: string;
  email: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticateAdmin(email: string, password: string) {
  const result = await query<AdminRecord>(
    `
      SELECT id, email
      FROM admin_users
      WHERE email = $1 AND password_hash = crypt($2, password_hash)
      LIMIT 1
    `,
    [email.trim().toLowerCase(), password],
  );

  return result.rows[0] ?? null;
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);

  await query("DELETE FROM admin_sessions WHERE expires_at <= now()");
  await query(
    `
      INSERT INTO admin_sessions (admin_id, token_hash, expires_at)
      VALUES ($1, $2, now() + interval '30 days')
    `,
    [adminId, tokenHash],
  );

  return token;
}

export async function getAdminSessionByToken(token: string | undefined) {
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    return null;
  }

  const result = await query<AdminRecord>(
    `
      SELECT admin_users.id, admin_users.email
      FROM admin_sessions
      JOIN admin_users ON admin_users.id = admin_sessions.admin_id
      WHERE admin_sessions.token_hash = $1
        AND admin_sessions.expires_at > now()
      LIMIT 1
    `,
    [hashToken(token)],
  );

  return result.rows[0] ?? null;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return getAdminSessionByToken(cookieStore.get(adminSessionCookie)?.value);
}

export async function requireAdminPage(returnTo = "/admin") {
  const admin = await getAdminSession();

  if (!admin) {
    redirect(`/admin/login?next=${encodeURIComponent(returnTo)}`);
  }

  return admin;
}

export async function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${adminSessionCookie}=`));
  const token = cookie?.slice(adminSessionCookie.length + 1);

  return Boolean(await getAdminSessionByToken(token));
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  maxAge: sessionDurationSeconds,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

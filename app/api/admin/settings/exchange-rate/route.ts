import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import { getUsdToGhsRate } from "@/lib/exchange-rate";

function databaseError() {
  return NextResponse.json(
    { error: "The database is unavailable or migration 012 has not been applied. The exchange rate was not saved." },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    return NextResponse.json({ rate: await getUsdToGhsRate() });
  } catch {
    return databaseError();
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let rate: number;
    try {
    const payload = (await request.json()) as { rate?: unknown };
    rate = typeof payload.rate === "number" ? payload.rate : Number(payload.rate);
    } catch {
      return NextResponse.json({ error: "Enter a valid USD to GHS rate." }, { status: 400 });
    }

    if (!Number.isFinite(rate) || rate <= 0 || rate > 1_000_000) {
      return NextResponse.json({ error: "Enter a rate greater than 0." }, { status: 400 });
    }

    await query(
      `INSERT INTO app_settings (setting_key, setting_value, updated_at)
       VALUES ('usd_to_ghs_rate', $1, now())
       ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = EXCLUDED.setting_value, updated_at = now()`,
      [String(rate)],
    );
    revalidateTag("exchange-rate", { expire: 0 });
    return NextResponse.json({ rate });
  } catch {
    return databaseError();
  }
}

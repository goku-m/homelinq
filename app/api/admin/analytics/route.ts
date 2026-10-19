import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAdminAnalyticsData } from "@/lib/admin-dashboard";

export async function GET() {
  await connection();

  try {
    const analytics = await getAdminAnalyticsData();

    return NextResponse.json({ analytics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load analytics" },
      { status: 500 },
    );
  }
}

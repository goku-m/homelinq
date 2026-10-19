import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export async function GET() {
  await connection();

  try {
    const dashboard = await getAdminDashboardData();

    return NextResponse.json({ dashboard });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load dashboard" },
      { status: 500 },
    );
  }
}

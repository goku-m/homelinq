import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

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

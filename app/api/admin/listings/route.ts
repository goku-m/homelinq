import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAdminListings } from "@/lib/admin-dashboard";

export async function GET() {
  await connection();

  try {
    const listings = await getAdminListings();

    return NextResponse.json(
      { listings },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load listings" },
      { status: 500 },
    );
  }
}

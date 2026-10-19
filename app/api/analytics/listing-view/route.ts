import { NextResponse } from "next/server";
import { recordListingView } from "@/lib/listing-analytics";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !isRecord(body) ||
      typeof body.id !== "string" ||
      typeof body.listingSlug !== "string"
    ) {
      return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
    }

    await recordListingView({
      durationSeconds:
        typeof body.durationSeconds === "number" ? body.durationSeconds : undefined,
      id: body.id,
      listingSlug: body.listingSlug,
      referrer:
        typeof body.referrer === "string"
          ? body.referrer
          : request.headers.get("referer") ?? undefined,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to record view" },
      { status: 400 },
    );
  }
}

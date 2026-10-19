import { NextResponse } from "next/server";
import {
  recordListingLead,
  type ListingLeadChannel,
} from "@/lib/listing-analytics";

const channels: ListingLeadChannel[] = ["email", "phone", "whatsapp"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !isRecord(body) ||
      typeof body.listingSlug !== "string" ||
      !channels.includes(body.channel as ListingLeadChannel)
    ) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    await recordListingLead({
      channel: body.channel as ListingLeadChannel,
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
      { error: error instanceof Error ? error.message : "Unable to record lead" },
      { status: 400 },
    );
  }
}

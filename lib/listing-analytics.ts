import { query } from "@/lib/db";

export type ListingLeadChannel = "email" | "phone" | "whatsapp";

export type ListingViewInput = {
  durationSeconds?: number;
  id: string;
  listingSlug: string;
  referrer?: string;
  sessionId?: string;
  userAgent?: string;
};

export type ListingLeadInput = {
  channel: ListingLeadChannel;
  listingSlug: string;
  referrer?: string;
  sessionId?: string;
  userAgent?: string;
};

function cleanOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function cleanDuration(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
}

export async function recordListingView(input: ListingViewInput) {
  const durationSeconds = cleanDuration(input.durationSeconds);

  await query(
    `
      INSERT INTO listing_views (
        id,
        listing_id,
        listing_slug,
        session_id,
        referrer,
        user_agent,
        duration_seconds
      )
      VALUES (
        $1,
        (SELECT id FROM listings WHERE slug = $2),
        $2,
        $3,
        $4,
        $5,
        $6
      )
      ON CONFLICT (id) DO UPDATE
      SET
        duration_seconds = GREATEST(listing_views.duration_seconds, EXCLUDED.duration_seconds),
        updated_at = now()
    `,
    [
      input.id,
      input.listingSlug,
      cleanOptionalText(input.sessionId),
      cleanOptionalText(input.referrer),
      cleanOptionalText(input.userAgent),
      durationSeconds,
    ],
  );
}

export async function recordListingLead(input: ListingLeadInput) {
  await query(
    `
      INSERT INTO listing_leads (
        listing_id,
        listing_slug,
        channel,
        session_id,
        referrer,
        user_agent
      )
      VALUES (
        (SELECT id FROM listings WHERE slug = $1),
        $1,
        $2,
        $3,
        $4,
        $5
      )
    `,
    [
      input.listingSlug,
      input.channel,
      cleanOptionalText(input.sessionId),
      cleanOptionalText(input.referrer),
      cleanOptionalText(input.userAgent),
    ],
  );
}

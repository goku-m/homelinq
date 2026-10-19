import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  deleteListing,
  getListingBySlugFromDb,
  updateListing,
} from "@/lib/listing-repository";
import { parseListingPatch } from "@/lib/listing-validation";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/listings/[slug]">,
) {
  const { slug } = await context.params;
  const listing = await getListingBySlugFromDb(slug);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/listings/[slug]">,
) {
  try {
    const { slug } = await context.params;
    const patch = parseListingPatch(await request.json());
    const listing = await updateListing(slug, patch);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    revalidateTag("listings", { expire: 0 });
    revalidatePath("/admin");
    revalidatePath(`/listing-details/${listing.slug}`);

    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/listings/[slug]">,
) {
  const { slug } = await context.params;
  const listing = await deleteListing(slug);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  revalidateTag("listings", { expire: 0 });
  revalidatePath("/admin");
  revalidatePath(`/listing-details/${listing.slug}`);

  return NextResponse.json({ listing });
}

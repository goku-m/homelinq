import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createListing, listListings } from "@/lib/listing-repository";
import { parseListingInput } from "@/lib/listing-validation";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET() {
  const listings = await listListings();

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const listing = parseListingInput(await request.json());
    const created = await createListing(listing);
    revalidateTag("listings", { expire: 0 });
    revalidatePath("/admin");

    return NextResponse.json({ listing: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}

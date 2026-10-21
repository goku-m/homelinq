import { Suspense } from "react";
import { ExploreListings } from "./explore-listings";
import { QuickSearchModal } from "@/components/quick-search-modal";
import { SiteHeader } from "@/components/site-header";
import { searchListings } from "@/lib/listing-repository";
import type { ListingCategory, ListingType } from "@/types/listing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Properties for Sale, Rent, and Lease in Ghana",
  description:
    "Browse verified HomeLinq properties including houses, apartments, offices, shops, land, townhouses, warehouses, commercial spaces, and beachhouses across Ghana.",
  alternates: { canonical: "/explore" },
};

type ExploreSearchParams = Promise<Record<string, string | string[] | undefined>>;

function ExploreResultsFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14">
      <div className="h-12 w-72 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="h-96 animate-pulse rounded-2xl bg-white" key={index} />
        ))}
      </div>
    </section>
  );
}

async function ExploreResults({ searchParams }: { searchParams: ExploreSearchParams }) {
  const params = await searchParams;
  const value = (key: string) => {
    const parameter = params[key];
    return Array.isArray(parameter) ? parameter[0] : parameter;
  };
  const category = value("category");
  const propertyCategory = value("type");
  const currency = value("currency");
  const listingTypes: ListingType[] | undefined =
    category === "Sale"
      ? ["Sale"]
      : category === "Rent"
        ? value("includeLease") === "true"
          ? ["Rent", "Lease"]
          : ["Rent"]
        : undefined;
  const listings = await searchListings({
    beds: value("beds")?.split(" ")[0],
    listingTypes,
    propertyCategory: [
      "house",
      "apartment",
      "office",
      "shop",
      "land",
      "townhouse",
      "warehouse",
      "commercial-space",
      "beachhouse",
    ].includes(propertyCategory ?? "")
      ? (propertyCategory as ListingCategory)
      : undefined,
    currency: currency === "GHC" || currency === "USD" ? currency : undefined,
    location: value("location"),
    maxPrice: value("maxPrice") === "No max" ? undefined : value("maxPrice"),
    minPrice: value("minPrice") === "No min" ? undefined : value("minPrice"),
  });
  const pageTitle =
    category === "Sale"
      ? "Properties for Sale"
      : category === "Rent" && value("includeLease") === "true"
        ? "Properties for Rent and Lease"
        : category === "Rent"
          ? "Properties for Rent"
          : "All available properties";

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-black leading-tight text-[var(--theme-ink)] md:text-5xl">
            {pageTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Browse the complete HomeLinq portfolio of commercial spaces,
            office suites, and retail opportunities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <QuickSearchModal variant="explore" />
          <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-[var(--theme-primary)] shadow-sm ring-1 ring-slate-200">
            {listings.length} listings
          </div>
        </div>
      </div>

      <ExploreListings listings={listings} />
    </section>
  );
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: ExploreSearchParams;
}) {
  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-slate-950">
      <SiteHeader />
      <Suspense fallback={<ExploreResultsFallback />}>
        <ExploreResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

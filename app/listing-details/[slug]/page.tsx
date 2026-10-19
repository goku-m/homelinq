import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import { getListingBySlugFromDb, listListings } from "@/lib/listing-repository";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactPropertyAction } from "./contact-property-action";
import { ListingGallery } from "./listing-gallery";
import { ListingViewTracker } from "./listing-view-tracker";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[118px_1fr] bg-white transition hover:bg-[var(--theme-surface)] sm:grid-cols-[180px_1fr]">
      <dt className="border-l-4 border-[var(--theme-primary)] bg-[var(--theme-spring)] px-3 py-3 text-sm font-black text-[var(--theme-ink)] sm:px-4 sm:text-sm">
        {label}
      </dt>
      <dd className="min-w-0 px-3 py-3 text-sm font-semibold leading-6 text-slate-700 sm:px-4 sm:text-sm">
        {value}
      </dd>
    </div>
  );
}

export async function generateStaticParams() {
  const listings = await listListings();

  return listings.map((listing) => ({
    slug: listing.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: PageProps<"/listing-details/[slug]">["params"];
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlugFromDb(slug);

  if (!listing) {
    return { title: "Property not found" };
  }

  const description = `${listing.title} in ${listing.location}. ${listing.price}. Explore property details, amenities, availability, and contact options on HomeLinq Properties.`;
  return {
    title: `${listing.title} in ${listing.location}`,
    description,
    alternates: { canonical: `/listing-details/${listing.slug}` },
    openGraph: {
      type: "website",
      title: `${listing.title} in ${listing.location}`,
      description,
      images: [{ url: listing.image, alt: `${listing.title} property image` }],
    },
  };
}

function ListingDetailsFallback() {
  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-slate-950">
      <SiteHeader />
      <section className="mx-auto max-w-6xl rounded-none border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:mt-8 sm:rounded-2xl">
        <div className="h-5 w-72 max-w-full bg-slate-100" />
        <div className="mt-4 h-8 w-full max-w-3xl bg-slate-100" />
        <div className="mt-8 h-[420px] bg-slate-100" />
      </section>
    </main>
  );
}

async function ListingDetailsContent({
  params,
}: {
  params: PageProps<"/listing-details/[slug]">["params"];
}) {
  const { slug } = await params;
  const listing = await getListingBySlugFromDb(slug);

  if (!listing) {
    notFound();
  }

  const priceSuffix = listing.priceType === "Rent" ? "/ month" : "";
  const leaseOptionsLabel = listing.listingType === "Sale" ? "Price" : "Lease options";
  const contactSubject = encodeURIComponent(`Inquiry about ${listing.title}`);
  const contactEmail = "info@homelinqproperties.com";
  const contactPhone = "+233 54 100 0010";
  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.details,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://homelinqproperties.com"}/listing-details/${listing.slug}`,
    image: [listing.image, ...listing.gallery],
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.location,
      addressCountry: "GH",
    },
    offers: {
      "@type": "Offer",
      price: listing.price.replace(/[^\d.]/g, ""),
      priceCurrency: listing.price.toUpperCase().includes("USD") ? "USD" : "GHS",
      availability:
        listing.availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-slate-950">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        type="application/ld+json"
      />
      <ListingViewTracker listingSlug={listing.slug} />
      <SiteHeader />

      <section className="mx-auto min-h-screen max-w-6xl rounded-none border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:mt-8 sm:min-h-0 sm:rounded-2xl sm:p-4 md:p-5">
        <div className="mt-3 flex items-end justify-between gap-4 border-b-4 border-slate-200 pb-1 max-md:flex-col max-md:items-start">
          <h1 className="text-2xl font-black uppercase leading-tight text-[var(--theme-ink)] md:text-3xl">
            {listing.title} at {listing.location}
          </h1>
          <p className="w-full shrink-0 rounded-lg bg-[var(--theme-spring)] px-4 py-2 text-2xl font-black text-[#622347] md:w-auto">
            {listing.price}
            <span className="text-sm font-medium">{priceSuffix}</span>
          </p>
        </div>

        <div className="mt-4">
          <ContactPropertyAction
            email={contactEmail}
            listingSlug={listing.slug}
            phone={contactPhone}
            subject={contactSubject}
            variant="button"
          />
        </div>

        <div className="mt-8">
          <ListingGallery listing={listing} />
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-6xl rounded-none bg-white px-3 pb-8 pt-4 font-sans text-slate-900 sm:mt-8 sm:rounded-2xl sm:px-5 sm:pt-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-black text-[var(--theme-ink)]">
              Property details
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">
              {listing.details}
            </p>
          </div>

        </div>

        <dl className="mt-5 overflow-hidden rounded-xl border border-slate-200 shadow-[0_16px_36px_rgba(21,33,52,0.08)] divide-y divide-slate-200">
          <DetailRow
            label={leaseOptionsLabel}
            value={
              listing.listingType === "Sale" ? (
                <span className="rounded-md bg-[var(--theme-surface)] px-3 py-2 font-black text-[var(--theme-primary)]">
                  {listing.price}
                </span>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {listing.leaseOptions.map((option, index) => (
                    <span
                      className="rounded-md bg-[var(--theme-surface)] px-3 py-2 text-[var(--theme-ink)]"
                      key={`${option}-${index}`}
                    >
                      {option}
                    </span>
                  ))}
                </div>
              )
            }
          />
          <DetailRow label="Commission" value={listing.commission} />
          <DetailRow label="Registration fee" value={listing.registrationFee} />
          <DetailRow label="Bedrooms" value={listing.bedrooms} />
          <DetailRow label="Bathrooms" value={listing.showers} />
          <DetailRow label="Garage" value={listing.garage} />
          <DetailRow label="Furnished" value={listing.furnished} />
          <DetailRow
            label="Amenities"
            value={
              <ul className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <li
                    className="rounded-full bg-[var(--theme-spring)] px-3 py-1.5 text-xs font-black text-[#173c66]"
                    key={amenity}
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            }
          />
        </dl>

        <div className="mt-6 flex justify-center sm:justify-end">
          <ContactPropertyAction
            email={contactEmail}
            listingSlug={listing.slug}
            phone={contactPhone}
            subject={contactSubject}
            variant="button"
          />
        </div>
      </section>
    </main>
  );
}

export default function ListingDetailsPage({
  params,
}: PageProps<"/listing-details/[slug]">) {
  return (
    <Suspense fallback={<ListingDetailsFallback />}>
      <ListingDetailsContent params={params} />
    </Suspense>
  );
}

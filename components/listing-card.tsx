import Image from "next/image";
import Link from "next/link";
import { getListingCardImageUrl } from "@/lib/listing-image-url";
import { Listing } from "@/types/listing";

function BedIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 md:h-3.5 md:w-3.5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 11V6.8C4 5.8 4.8 5 5.8 5h3.4c1 0 1.8.8 1.8 1.8V11m-7 0h16m-16 0v8m16-8V8.8c0-1-.8-1.8-1.8-1.8H14c-1.1 0-2 .9-2 2v2m8 8v-3H4v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 md:h-3.5 md:w-3.5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 10.2c0 5.1-7 10-7 10s-7-4.9-7-10a7 7 0 1 1 14 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M12 12.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ShowerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 11h10M9 11V8.5a3 3 0 0 1 6 0V11m-7 4v.2m4-.2v.2m4-.2v.2M7 19v.2m4-.2v.2m4-.2v.2m4-8.2v9M5 20h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ImageCountIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.8 6.5A2.5 2.5 0 0 1 7.3 4h9.4a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1-2.5 2.5H7.3a2.5 2.5 0 0 1-2.5-2.5v-11Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="m7 16 3.2-3.2 2.4 2.4 1.5-1.5L17 16M8 8.5h.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function uniqueImageCount(listing: Listing) {
  return new Set([listing.image, ...listing.gallery]).size;
}

export function ListingCard({ listing }: { listing: Listing }) {

  const priceLabel =
    listing.priceType === "Rent"
      ? "per month"
      : listing.priceType === "Sale"
        ? "for sale"
        : "for lease";
  const imageCount = uniqueImageCount(listing);


  return (
    <Link
      className="group block h-full rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-rose-mist)]/60"
      href={`/listing-details/${listing.slug}`}
    >
      <article className="h-full overflow-hidden rounded-2xl bg-white shadow-[0_22px_45px_rgba(21,33,52,0.14)] ring-1 ring-slate-200/70 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_56px_rgba(21,33,52,0.18)]">
        <div className="relative h-44">
          <Image
            alt={`${listing.title} property`}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 768px) 30vw, 90vw"
            src={getListingCardImageUrl(listing.image)}
          />
          <span
            className={`absolute left-4 top-4 rounded-full bg-[var(--theme-muted-teal)] px-3 py-1 text-xs font-black text-white`}
          >
            For {listing.listingType}
          </span>
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/72 px-3 py-1 text-xs font-black text-white backdrop-blur">
            <ImageCountIcon />
            {imageCount}
          </span>
        </div>

        <div className="p-6">
          <div>
            <h3 className="text-lg font-black leading-tight text-slate-950">
              {listing.title}
            </h3>
            <div className="mt-2">
              <p className="text-base font-black text-[var(--theme-muted-teal)]">
                {listing.price}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-normal text-slate-400">
                {priceLabel}
              </p>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
            <LocationIcon />
            {listing.location}
          </p>
          <p className="mt-3 min-h-5 text-sm leading-6 text-slate-600">
            {listing.details.length > 50
              ? `${listing.details.slice(0, 50)}...`
              : listing.details}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-2 rounded-full bg-[var(--theme-silver)]/25 px-3 py-2 text-sm font-black text-[var(--theme-deep-teal)] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs">
              <BedIcon />
              <span>
                {listing.bedrooms} Bedroom{listing.bedrooms === 1 ? "" : "s"}
              </span>
            </span>
            <span className="flex items-center gap-2 rounded-full bg-[var(--theme-silver)]/25 px-3 py-2 text-sm font-black text-[var(--theme-deep-teal)] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs">
              <ShowerIcon />
              <span>
                {listing.showers} Bath{listing.showers === 1 ? "" : "s"}
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

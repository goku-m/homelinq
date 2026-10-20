"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { ListingImageUploader } from "@/components/listing-image-uploader";
import type { Listing, ListingAvailability, ListingCategory, ListingPriceRange, ListingType } from "@/types/listing";

const amenityOptions = [
  "Air conditioning",
  "Security service",
  "Standby generator",
  "Parking",
  "Reception",
  "Fiber-ready",
  "Street frontage",
  "Service access",
  "Display windows",
  "Storage",
  "Concierge",
  "Elevator",
  "Water reservoir",
  "Secure parking",
  "City views",
  "Swimming Pool",
];
const categoryOptions: { label: string; value: ListingCategory }[] = [
  { label: "House", value: "house" },
  { label: "Apartment", value: "apartment" },
  { label: "Office", value: "office" },
  { label: "Shop", value: "shop" },
  { label: "Land", value: "land" },
];

type ListingFormState = {
  category: ListingCategory;
  amenities: string[];
  availability: ListingAvailability;
  bedrooms: string;
  commission: string;
  currency: "GHC" | "USD";
  details: string;
  featured: boolean;
  furnished: string;
  gallery: string[];
  garage: string;
  image: string;
  leaseOptions: string;
  listingType: ListingType;
  location: string;
  price: string;
  priceRange: ListingPriceRange;
  registrationCurrency: "GHC" | "USD";
  registrationFee: string;
  showers: string;
  slug: string;
  title: string;
};

type PropertyFormProps = {
  cancelHref?: string;
  listing?: Listing;
  mode: "create" | "edit";
};

const emptyForm: ListingFormState = {
  category: "office",
  amenities: [],
  availability: "available",
  bedrooms: "0",
  commission: "",
  currency: "GHC",
  details: "",
  featured: false,
  furnished: "",
  gallery: [],
  garage: "0",
  image: "",
  leaseOptions: "",
  listingType: "Rent",
  location: "",
  price: "",
  priceRange: "Per month",
  registrationCurrency: "GHC",
  registrationFee: "",
  showers: "0",
  slug: "",
  title: "",
};

function slugFromTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatList(value: string[]) {
  return value.join("\n");
}

function numberFromString(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePrice(value: string): Pick<ListingFormState, "currency" | "price"> {
  const trimmedValue = value.trim();

  if (/^(GHC|GHS)\s+/i.test(trimmedValue)) {
    return {
      currency: "GHC",
      price: trimmedValue.replace(/^(GHC|GHS)\s+/i, ""),
    };
  }

  if (/^GH₵\s*/i.test(trimmedValue)) {
    return {
      currency: "GHC",
      price: trimmedValue.replace(/^GH₵\s*/i, ""),
    };
  }

  if (trimmedValue.startsWith("₵")) {
    return {
      currency: "GHC",
      price: trimmedValue.replace(/^₵\s*/, ""),
    };
  }

  if (trimmedValue.toUpperCase().startsWith("USD ")) {
    return {
      currency: "USD",
      price: trimmedValue.replace(/^USD\s+/i, ""),
    };
  }

  if (trimmedValue.startsWith("$")) {
    return {
      currency: "USD",
      price: trimmedValue.replace(/^\$\s*/, ""),
    };
  }

  return {
    currency: "GHC",
    price: trimmedValue,
  };
}

function parseRegistrationFee(value: string): Pick<ListingFormState, "registrationCurrency" | "registrationFee"> {
  const trimmedValue = value.trim();

  if (/^(GHC|GHS)\s+/i.test(trimmedValue) || /^GHâ‚µ\s*/i.test(trimmedValue) || trimmedValue.startsWith("â‚µ")) {
    return {
      registrationCurrency: "GHC",
      registrationFee: trimmedValue.replace(/^(GHC|GHS)\s+/i, "").replace(/^GHâ‚µ\s*/i, "").replace(/^â‚µ\s*/, ""),
    };
  }

  return {
    registrationCurrency: "USD",
    registrationFee: trimmedValue.replace(/^USD\s+/i, "").replace(/^\$\s*/, ""),
  };
}

function normalizeCommission(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue === "10.0%") {
    return "10%";
  }

  if (trimmedValue === "5.0%") {
    return "5%";
  }

  return trimmedValue;
}

const currencySymbols: Record<ListingFormState["currency"], string> = {
  GHC: "GH₵",
  USD: "$",
};

function formatPrice(currency: ListingFormState["currency"], price: string) {
  const trimmedPrice = price.trim();

  if (trimmedPrice === "") {
    return "";
  }

  return `${currencySymbols[currency]} ${trimmedPrice}`;
}

function formatRegistrationFee(currency: ListingFormState["registrationCurrency"], fee: string) {
  const trimmedFee = fee.trim();

  if (trimmedFee === "") {
    return "";
  }

  return `${currencySymbols[currency]} ${trimmedFee}`;
}

function listingToForm(listing: Listing): ListingFormState {
  const parsedPrice = parsePrice(listing.price);
  const parsedRegistrationFee = parseRegistrationFee(listing.registrationFee);

  return {
    category: listing.category,
    amenities: listing.amenities,
    availability: listing.availability,
    bedrooms: String(listing.bedrooms),
    commission: normalizeCommission(listing.commission),
    currency: parsedPrice.currency,
    details: listing.details,
    featured: Boolean(listing.featured),
    furnished: listing.furnished,
    gallery: listing.gallery,
    garage: String(listing.garage),
    image: listing.image,
    leaseOptions: formatList(listing.leaseOptions),
    listingType: listing.listingType,
    location: listing.location,
    price: parsedPrice.price,
    priceRange: listing.priceRange,
    registrationCurrency: parsedRegistrationFee.registrationCurrency,
    registrationFee: parsedRegistrationFee.registrationFee,
    showers: String(listing.showers),
    slug: listing.slug,
    title: listing.title,
  };
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label className="grid gap-1.5" htmlFor={htmlFor}>
      <span className="text-xs font-black uppercase tracking-normal text-slate-500">
        {children}
      </span>
    </label>
  );
}

export function PropertyForm({
  cancelHref = "/admin",
  listing,
  mode,
}: PropertyFormProps) {
  const [form, setForm] = useState(() => (listing ? listingToForm(listing) : emptyForm));
  const [error, setError] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");

  const selectedAmenitySet = useMemo(
    () => new Set(form.amenities),
    [form.amenities],
  );

  const updateForm = <Key extends keyof ListingFormState>(
    key: Key,
    value: ListingFormState[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateTitle = (title: string) => {
    setForm((current) => ({
      ...current,
      slug: current.slug === "" || current.slug === slugFromTitle(current.title)
        ? slugFromTitle(title)
        : current.slug,
      title,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    const amenity = customAmenity.trim();

    if (!amenity || form.amenities.includes(amenity)) {
      return;
    }

    setForm((current) => ({
      ...current,
      amenities: [...current.amenities, amenity],
    }));
    setCustomAmenity("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isUploadingImages) {
      setError("Wait for image uploads to finish before saving.");
      return;
    }

    if (form.image === "") {
      setError("Add at least one property image.");
      return;
    }

    setIsSaving(true);

    const nextListing: Listing = {
      category: form.category,
      amenities: form.amenities,
      availability: form.availability,
      bedrooms: numberFromString(form.bedrooms),
      commission: form.commission.trim(),
      details: form.details.trim(),
      featured: form.featured,
      furnished: form.furnished.trim(),
      gallery: form.gallery,
      garage: numberFromString(form.garage),
      image: form.image.trim(),
      leaseOptions: parseList(form.leaseOptions),
      listingType: form.listingType,
      location: form.location.trim(),
      price: formatPrice(form.currency, form.price),
      priceRange: form.priceRange,
      priceType: form.listingType,
      registrationFee: formatRegistrationFee(form.registrationCurrency, form.registrationFee),
      showers: numberFromString(form.showers),
      slug: form.slug.trim() || slugFromTitle(form.title),
      title: form.title.trim(),
    };

    try {
      const response = await fetch(
        mode === "edit" && listing
          ? `/api/listings/${encodeURIComponent(listing.slug)}`
          : "/api/listings",
        {
          body: JSON.stringify(nextListing),
          headers: {
            "Content-Type": "application/json",
          },
          method: mode === "edit" ? "PATCH" : "POST",
        },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(
          payload.error ?? (mode === "edit" ? "Unable to save property" : "Unable to add property"),
        );
      }

      // Full navigation ensures the admin dashboard starts with fresh server data.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin?section=properties");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "edit"
            ? "Unable to save property"
            : "Unable to add property",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <section className="rounded-2xl bg-white p-5 shadow-[0_22px_45px_rgba(21,33,52,0.12)] ring-1 ring-slate-300">
        <h2 className="text-lg font-black text-slate-950">Property details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <input
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="title"
              onChange={(event) => updateTitle(event.target.value)}
              required
              value={form.title}
            />
          </div>
          <div>
            <FieldLabel htmlFor="listingType">Listing type</FieldLabel>
            <select
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="listingType"
              onChange={(event) =>
                updateForm("listingType", event.target.value as ListingType)
              }
              value={form.listingType}
            >
              <option value="Rent">Rent</option>
              <option value="Sale">Sale</option>
              <option value="Lease">Lease</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <select
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="category"
              onChange={(event) =>
                updateForm("category", event.target.value as ListingCategory)
              }
              value={form.category}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="price">Price</FieldLabel>
            <div className={`grid ${form.listingType === "Sale" ? "grid-cols-[104px_1fr]" : "grid-cols-[104px_1fr_128px]"}`}>
              <select
                aria-label="Price currency"
                className="h-11 rounded-l-lg border border-r-0 border-[var(--theme-border)] bg-slate-50 px-3 text-sm font-black text-slate-700 outline-none focus:border-[var(--theme-primary)]"
                onChange={(event) =>
                  updateForm(
                    "currency",
                    event.target.value as ListingFormState["currency"],
                  )
                }
                value={form.currency}
              >
                <option value="GHC">GHC</option>
                <option value="USD">USD</option>
              </select>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-700">
                  {currencySymbols[form.currency]}
                </span>
                <input
                  className="h-11 w-full rounded-r-lg border border-[var(--theme-border)] pl-14 pr-3 text-sm outline-none focus:border-[var(--theme-primary)]"
                  id="price"
                  onChange={(event) => updateForm("price", event.target.value)}
                  placeholder="4,800"
                  required
                  value={form.price}
                />
              </div>
              {form.listingType !== "Sale" ? (
                <select
                  aria-label="Price range"
                  className="h-11 rounded-r-lg border border-l-0 border-[var(--theme-border)] bg-slate-50 px-2 text-sm font-black text-slate-700 outline-none focus:border-[var(--theme-primary)]"
                  onChange={(event) => updateForm("priceRange", event.target.value as ListingPriceRange)}
                  value={form.priceRange}
                >
                  <option value="Per Day">Per Day</option>
                  <option value="Per week">Per week</option>
                  <option value="Per month">Per month</option>
                </select>
              ) : null}
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <input
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="location"
              onChange={(event) => updateForm("location", event.target.value)}
              required
              value={form.location}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel htmlFor="details">Details</FieldLabel>
            <textarea
              className="min-h-32 w-full rounded-lg border border-[var(--theme-border)] px-3 py-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="details"
              onChange={(event) => updateForm("details", event.target.value)}
              required
              value={form.details}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_22px_45px_rgba(21,33,52,0.12)] ring-1 ring-slate-300">
        <h2 className="text-lg font-black text-slate-950">Attributes</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <FieldLabel htmlFor="availability">Availability</FieldLabel>
            <select
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="availability"
              onChange={(event) =>
                updateForm(
                  "availability",
                  event.target.value as ListingAvailability,
                )
              }
              value={form.availability}
            >
              <option value="available">available</option>
              <option value="not available">not available</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel>
            <input
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="bedrooms"
              min="0"
              onChange={(event) => updateForm("bedrooms", event.target.value)}
              type="number"
              value={form.bedrooms}
            />
          </div>
          <div>
            <FieldLabel htmlFor="showers">Bathrooms</FieldLabel>
            <input
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="showers"
              min="0"
              onChange={(event) => updateForm("showers", event.target.value)}
              type="number"
              value={form.showers}
            />
          </div>
          <div>
            <FieldLabel htmlFor="garage">Garage</FieldLabel>
            <input
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="garage"
              min="0"
              onChange={(event) => updateForm("garage", event.target.value)}
              type="number"
              value={form.garage}
            />
          </div>
          <div>
            <FieldLabel htmlFor="furnished">Furnished</FieldLabel>
            <select
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="furnished"
              onChange={(event) => updateForm("furnished", event.target.value)}
              required
              value={form.furnished}
            >
              <option value="">Select furnishing</option>
              <option value="Fully furnished">Fully furnished</option>
              <option value="Semi-furnished">Semi-furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
          <label className="flex h-11 items-center gap-3 self-end rounded-lg border border-[var(--theme-border)] px-3 text-sm font-semibold text-slate-700">
            <input
              checked={form.featured}
              className="h-4 w-4"
              onChange={(event) => updateForm("featured", event.target.checked)}
              type="checkbox"
            />
            Featured listing
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_22px_45px_rgba(21,33,52,0.12)] ring-1 ring-slate-300">
        <h2 className="text-lg font-black text-slate-950">Pricing and media</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="commission">Commission</FieldLabel>
            <select
              className="h-11 w-full rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="commission"
              onChange={(event) => updateForm("commission", event.target.value)}
              required
              value={form.commission}
            >
              <option value="">Select commission</option>
              <option value="1 Month">1 Month</option>
              <option value="5%">5%</option>
              <option value="10%">10%</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="registrationFee">Registration fee</FieldLabel>
            <div className="grid grid-cols-[104px_1fr]">
              <select
                aria-label="Registration fee currency"
                className="h-11 rounded-l-lg border border-r-0 border-[var(--theme-border)] bg-slate-50 px-3 text-sm font-black text-slate-700 outline-none focus:border-[var(--theme-primary)]"
                onChange={(event) => updateForm("registrationCurrency", event.target.value as ListingFormState["registrationCurrency"])}
                value={form.registrationCurrency}
              >
                <option value="GHC">GHC</option>
                <option value="USD">USD</option>
              </select>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-700">
                  {currencySymbols[form.registrationCurrency]}
                </span>
                <input
                  className="h-11 w-full rounded-r-lg border border-[var(--theme-border)] pl-14 pr-3 text-sm outline-none focus:border-[var(--theme-primary)]"
                  id="registrationFee"
                  onChange={(event) => updateForm("registrationFee", event.target.value)}
                  placeholder="300"
                  required
                  value={form.registrationFee}
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <ListingImageUploader
              gallery={form.gallery}
              image={form.image}
              onBusyChange={setIsUploadingImages}
              onChange={(selection) =>
                setForm((current) => ({
                  ...current,
                  gallery: selection.gallery,
                  image: selection.image,
                }))
              }
              required
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_22px_45px_rgba(21,33,52,0.12)] ring-1 ring-slate-300">
        <h2 className="text-lg font-black text-slate-950">Amenities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {amenityOptions.map((amenity) => {
            const isSelected = selectedAmenitySet.has(amenity);

            return (
              <button
                className={`rounded-full px-3 py-2 text-sm font-normal transition ${isSelected
                    ? "bg-[var(--theme-primary)] text-white"
                    : "bg-[var(--theme-spring)] text-[var(--theme-deep-teal)] hover:bg-[var(--theme-silver)]/30"
                  }`}
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                type="button"
              >
                {amenity}
              </button>
            );
          })}
        </div>
        <div className="mt-5 rounded-lg border border-[var(--theme-border)] bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-normal text-slate-500">
            Selected amenities
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {form.amenities.length > 0 ? (
              form.amenities.map((amenity) => (
                <button
                  className="rounded-full bg-white px-3 py-2 text-sm font-normal text-[var(--theme-deep-teal)] shadow-sm ring-1 ring-slate-300"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  type="button"
                >
                  {amenity}
                </button>
              ))
            ) : (
              <span className="text-sm font-semibold text-slate-500">
                No amenities selected
              </span>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            aria-label="Custom amenity"
            className="h-11 flex-1 rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
            onChange={(event) => setCustomAmenity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomAmenity();
              }
            }}
            placeholder="Type another amenity"
            value={customAmenity}
          />
          <button
            className="h-11 rounded-lg border border-[var(--theme-primary)] px-4 text-sm font-black text-[var(--theme-primary)] hover:bg-[var(--theme-spring)]"
            onClick={addCustomAmenity}
            type="button"
          >
            Add amenity
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_22px_45px_rgba(21,33,52,0.12)] ring-1 ring-slate-300">
        <h2 className="text-lg font-black text-slate-950">Search labels</h2>
        <div className="mt-5 grid gap-4">
          <div>
            <FieldLabel htmlFor="leaseOptions">Lease options</FieldLabel>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[var(--theme-border)] px-3 py-3 text-sm outline-none focus:border-[var(--theme-primary)]"
              id="leaseOptions"
              onChange={(event) =>
                updateForm("leaseOptions", event.target.value)
              }
              placeholder="One per line or comma-separated"
              value={form.leaseOptions}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface)]/95 py-4 backdrop-blur">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--theme-border)] bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50"
          href={cancelHref}
        >
          Cancel
        </Link>
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--theme-primary)] px-6 text-sm font-black text-white hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving || isUploadingImages || form.image === ""}
          type="submit"
        >
          {isUploadingImages
            ? "Uploading"
            : isSaving
              ? mode === "edit"
                ? "Saving"
                : "Saving"
              : mode === "edit"
                ? "Save Property"
                : "Add Property"}
        </button>
      </div>
    </form>
  );
}

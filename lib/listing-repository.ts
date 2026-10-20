import {
  cacheLife,
  cacheTag,
} from "next/cache";

import { Listing, ListingCategory } from "@/types/listing";
import { query } from "./db";

type ListingRow = {
  category: Listing["category"];
  id: string;
  amenities: string[];
  availability: Listing["availability"];
  bedrooms: number;
  commission: string;
  details: string;
  featured: boolean;
  furnished: string;
  gallery: string[];
  garage: number;
  image: string;
  lease_options: string[];
  listing_type: Listing["listingType"];
  location: string;
  price: string;
  price_range: Listing["priceRange"];
  price_type: Listing["priceType"];
  registration_fee: string;
  showers: number;
  slug: string;
  title: string;
};

export type ListingInput = Listing;

export type ListingPatch =
  Partial<ListingInput>;

function fromRow(row: ListingRow): Listing {
  return {
    id: row.id,
    category: row.category,
    slug: row.slug,
    title: row.title,

    listingType: row.listing_type,
    priceType: row.price_type,

    price: row.price,
    priceRange: row.price_range,
    location: row.location,
    details: row.details,

    availability: row.availability,

    bedrooms: row.bedrooms,
    showers: row.showers,
    garage: row.garage,

    furnished: row.furnished,
    commission: row.commission,
    registrationFee: row.registration_fee,

    image: row.image,
    gallery: row.gallery ?? [],

    leaseOptions: row.lease_options ?? [],
    amenities: row.amenities ?? [],

    featured: row.featured,
  };
}

function toDbValues(listing: ListingInput) {
  return [
    listing.slug,
    listing.title,
    listing.category,
    listing.listingType,
    listing.priceType,
    listing.price,
    listing.priceRange,
    listing.location,
    listing.details,
    listing.availability,
    listing.bedrooms,
    listing.showers,
    listing.garage,
    listing.furnished,
    listing.commission,
    listing.registrationFee,
    listing.image,
    listing.gallery,
    listing.leaseOptions,
    listing.amenities,
    Boolean(listing.featured),
  ];
}

/* ========================================
   GET ALL LISTINGS
======================================== */

export async function listListings() {
  "use cache";

  cacheLife("minutes");
  cacheTag("listings");

  const result = await query<ListingRow>(`
    SELECT
      id,
      slug,
      title,
      category,
      listing_type,
      price_type,
      price,
      price_range,
      location,
      details,
      availability,
      bedrooms,
      showers,
      garage,
      furnished,
      commission,
      registration_fee,
      image,
      gallery,
      lease_options,
      amenities,
      featured
    FROM listings
    ORDER BY created_at DESC, title ASC
  `);

  return result.rows.map(fromRow);
}

export type ListingSearchFilters = {
  beds?: string;
  listingTypes?: Listing["listingType"][];
  propertyCategory?: ListingCategory;
  currency?: "GHC" | "USD";
  location?: string;
  maxPrice?: string;
  minPrice?: string;
};

export async function searchListings(filters: ListingSearchFilters) {
  const values: string[] = [];
  const conditions: string[] = [];
  const addValue = (value: string) => {
    values.push(value);
    return `$${values.length}`;
  };
  const numericPrice = "NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric";

  if (filters.location?.trim()) {
    const location = addValue(`%${filters.location.trim()}%`);
    conditions.push(`(location ILIKE ${location} OR title ILIKE ${location} OR details ILIKE ${location})`);
  }

  if (filters.listingTypes && filters.listingTypes.length > 0) {
    const categoryValues = filters.listingTypes.map((category) => addValue(category));
    conditions.push(`listing_type IN (${categoryValues.join(", ")})`);
  }

  if (filters.propertyCategory) {
    conditions.push(`category = ${addValue(filters.propertyCategory)}`);
  }

  if (filters.currency === "GHC") {
    conditions.push("(price ILIKE 'GHC %' OR price ILIKE 'GHS %' OR price ILIKE 'GH%'");
    conditions[conditions.length - 1] += " OR price ILIKE '₵%')";
  } else if (filters.currency === "USD") {
    conditions.push("(price ILIKE '$%' OR price ILIKE 'USD %')");
  }

  const minPrice = Number(filters.minPrice?.replace(/,/g, ""));
  if (Number.isFinite(minPrice) && minPrice > 0) {
    conditions.push(`${numericPrice} >= ${addValue(String(minPrice))}`);
  }

  const maxPrice = Number(filters.maxPrice?.replace(/,/g, ""));
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    conditions.push(`${numericPrice} <= ${addValue(String(maxPrice))}`);
  }

  if (filters.beds) {
    if (filters.beds === "5+") {
      conditions.push("bedrooms >= 5");
    } else {
      const beds = Number(filters.beds);
      if (Number.isInteger(beds) && beds > 0) {
        conditions.push(`bedrooms = ${addValue(String(beds))}`);
      }
    }
  }

  const result = await query<ListingRow>(`
    SELECT
      id,
      slug,
      title,
      category,
      listing_type,
      price_type,
      price,
      price_range,
      location,
      details,
      availability,
      bedrooms,
      showers,
      garage,
      furnished,
      commission,
      registration_fee,
      image,
      gallery,
      lease_options,
      amenities,
      featured
    FROM listings
    ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
    ORDER BY created_at DESC, title ASC
  `, values);

  return result.rows.map(fromRow);
}

/* ========================================
   GET FEATURED LISTINGS
======================================== */

export async function listFeaturedListings() {
  "use cache";

  cacheLife("minutes");
  cacheTag("listings");

  const result = await query<ListingRow>(`
    SELECT
      id,
      slug,
      title,
      category,
      listing_type,
      price_type,
      price,
      price_range,
      location,
      details,
      availability,
      bedrooms,
      showers,
      garage,
      furnished,
      commission,
      registration_fee,
      image,
      gallery,
      lease_options,
      amenities,
      featured
    FROM listings
    WHERE featured = true
    ORDER BY created_at DESC, title ASC
  `);

  return result.rows.map(fromRow);
}

/* ========================================
   GET SINGLE LISTING
======================================== */

export async function getListingBySlugFromDb(
  slug: string,
) {
  "use cache";

  cacheLife("minutes");
  cacheTag("listings");

  const result = await query<ListingRow>(
    `
      SELECT
        id,
        slug,
      title,
      category,
        listing_type,
        price_type,
        price,
        price_range,
        location,
        details,
        availability,
        bedrooms,
        showers,
        garage,
        furnished,
        commission,
        registration_fee,
        image,
        gallery,
        lease_options,
        amenities,
        featured
      FROM listings
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );

  if (!result.rows[0]) {
    return undefined;
  }

  return fromRow(result.rows[0]);
}

/* ========================================
   CREATE LISTING
======================================== */

export async function createListing(
  listing: ListingInput,
) {
  const result = await query<ListingRow>(
    `
      INSERT INTO listings (
        slug,
      title,
      category,
        listing_type,
        price_type,
        price,
        price_range,
        location,
        details,
        availability,
        bedrooms,
        showers,
        garage,
        furnished,
        commission,
        registration_fee,
        image,
        gallery,
        lease_options,
        amenities,
        featured
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21
      )
      RETURNING
        id,
        slug,
        title,
        category,
        listing_type,
        price_type,
        price,
        price_range,
        location,
        details,
        availability,
        bedrooms,
        showers,
        garage,
        furnished,
        commission,
        registration_fee,
        image,
        gallery,
        lease_options,
        amenities,
        featured
    `,
    toDbValues(listing),
  );

  return fromRow(result.rows[0]);
}

/* ========================================
   UPDATE LISTING
======================================== */

export async function updateListing(
  slug: string,
  patch: ListingPatch,
) {
  /*
   * Don't use the cached getListingBySlugFromDb()
   * here because mutations should work with the
   * latest database state.
   */
  const currentResult = await query<ListingRow>(
    `
      SELECT
        id,
        slug,
        title,
        category,
        listing_type,
        price_type,
        price,
        price_range,
        location,
        details,
        availability,
        bedrooms,
        showers,
        garage,
        furnished,
        commission,
        registration_fee,
        image,
        gallery,
        lease_options,
        amenities,
        featured
      FROM listings
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );

  if (!currentResult.rows[0]) {
    return undefined;
  }

  const current = fromRow(
    currentResult.rows[0],
  );

  const next: ListingInput = {
    ...current,
    ...patch,
    slug: patch.slug ?? current.slug,
  };

  const result = await query<ListingRow>(
    `
      UPDATE listings
      SET
        slug = $1,
        title = $2,
        category = $3,
        listing_type = $4,
        price_type = $5,
        price = $6,
        price_range = $7,
        location = $8,
        details = $9,
        availability = $10,
        bedrooms = $11,
        showers = $12,
        garage = $13,
        furnished = $14,
        commission = $15,
        registration_fee = $16,
        image = $17,
        gallery = $18,
        lease_options = $19,
        amenities = $20,
        featured = $21,
        updated_at = now()
      WHERE slug = $22
      RETURNING
        id,
        slug,
        title,
        category,
        listing_type,
        price_type,
        price,
        price_range,
        location,
        details,
        availability,
        bedrooms,
        showers,
        garage,
        furnished,
        commission,
        registration_fee,
        image,
        gallery,
        lease_options,
        amenities,
        featured
    `,
    [
      ...toDbValues(next),
      slug,
    ],
  );

  if (!result.rows[0]) {
    return undefined;
  }

  return fromRow(result.rows[0]);
}

/* ========================================
   DELETE LISTING
======================================== */

export async function deleteListing(
  slug: string,
) {
  const result = await query<ListingRow>(
    `
      DELETE FROM listings
      WHERE slug = $1
      RETURNING
        id,
        slug,
        title,
        listing_type,
        price_type,
        price,
        price_range,
        location,
        details,
        availability,
        bedrooms,
        showers,
        garage,
        furnished,
        commission,
        registration_fee,
        image,
        gallery,
        lease_options,
        amenities,
        featured
    `,
    [slug],
  );

  if (!result.rows[0]) {
    return undefined;
  }

  return fromRow(result.rows[0]);
}

import type { Listing, ListingAvailability, ListingCategory, ListingPriceRange, ListingType } from "@/types/listing";

const listingTypes: ListingType[] = ["Rent", "Sale", "Lease"];
const listingPriceRanges: ListingPriceRange[] = ["Per Day", "Per week", "Per month"];
const availabilityTypes: ListingAvailability[] = ["available", "not available"];
const listingCategories: ListingCategory[] = ["house", "apartment", "office", "shop", "land"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}

function numberValue(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} must be a number`);
  }

  return value;
}

function stringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${field} must be an array of strings`);
  }

  return value;
}

function listingTypeValue(value: unknown, field: string) {
  if (!listingTypes.includes(value as ListingType)) {
    throw new Error(`${field} must be Rent, Sale, or Lease`);
  }

  return value as ListingType;
}

function listingPriceRangeValue(value: unknown) {
  if (!listingPriceRanges.includes(value as ListingPriceRange)) {
    throw new Error("priceRange must be Per Day, Per week, or Per month");
  }

  return value as ListingPriceRange;
}

function availabilityValue(value: unknown) {
  if (!availabilityTypes.includes(value as ListingAvailability)) {
    throw new Error("availability must be available or not available");
  }

  return value as ListingAvailability;
}

function listingCategoryValue(value: unknown) {
  if (!listingCategories.includes(value as ListingCategory)) {
    throw new Error("category must be house, apartment, office, shop, or land");
  }

  return value as ListingCategory;
}

export function parseListingInput(body: unknown): Listing {
  if (!isRecord(body)) {
    throw new Error("Request body must be an object");
  }

  return {
    category: listingCategoryValue(body.category),
    listingType: listingTypeValue(body.listingType, "listingType"),
    amenities: stringArray(body.amenities, "amenities"),
    availability: availabilityValue(body.availability),
    bedrooms: numberValue(body.bedrooms, "bedrooms"),
    commission: stringValue(body.commission, "commission"),
    details: stringValue(body.details, "details"),
    featured: Boolean(body.featured),
    furnished: stringValue(body.furnished, "furnished"),
    garage: numberValue(body.garage, "garage"),
    gallery: stringArray(body.gallery, "gallery"),
    image: stringValue(body.image, "image"),
    leaseOptions: stringArray(body.leaseOptions, "leaseOptions"),
    location: stringValue(body.location, "location"),
    price: stringValue(body.price, "price"),
    priceRange: listingPriceRangeValue(body.priceRange),
    priceType: listingTypeValue(body.priceType, "priceType"),
    registrationFee: stringValue(body.registrationFee, "registrationFee"),
    showers: numberValue(body.showers, "showers"),
    slug: stringValue(body.slug, "slug"),
    title: stringValue(body.title, "title"),
  };
}

export function parseListingPatch(body: unknown): Partial<Listing> {
  if (!isRecord(body)) {
    throw new Error("Request body must be an object");
  }

  const patch: Partial<Listing> = {};

  if (body.category !== undefined) patch.category = listingCategoryValue(body.category);
  if (body.listingType !== undefined) patch.listingType = listingTypeValue(body.listingType, "listingType");
  if (body.amenities !== undefined) patch.amenities = stringArray(body.amenities, "amenities");
  if (body.availability !== undefined) patch.availability = availabilityValue(body.availability);
  if (body.bedrooms !== undefined) patch.bedrooms = numberValue(body.bedrooms, "bedrooms");
  if (body.commission !== undefined) patch.commission = stringValue(body.commission, "commission");
  if (body.details !== undefined) patch.details = stringValue(body.details, "details");
  if (body.featured !== undefined) patch.featured = Boolean(body.featured);
  if (body.furnished !== undefined) patch.furnished = stringValue(body.furnished, "furnished");
  if (body.garage !== undefined) patch.garage = numberValue(body.garage, "garage");
  if (body.gallery !== undefined) patch.gallery = stringArray(body.gallery, "gallery");
  if (body.image !== undefined) patch.image = stringValue(body.image, "image");
  if (body.leaseOptions !== undefined) patch.leaseOptions = stringArray(body.leaseOptions, "leaseOptions");
  if (body.location !== undefined) patch.location = stringValue(body.location, "location");
  if (body.price !== undefined) patch.price = stringValue(body.price, "price");
  if (body.priceRange !== undefined) patch.priceRange = listingPriceRangeValue(body.priceRange);
  if (body.priceType !== undefined) patch.priceType = listingTypeValue(body.priceType, "priceType");
  if (body.registrationFee !== undefined) patch.registrationFee = stringValue(body.registrationFee, "registrationFee");
  if (body.showers !== undefined) patch.showers = numberValue(body.showers, "showers");
  if (body.slug !== undefined) patch.slug = stringValue(body.slug, "slug");
  if (body.title !== undefined) patch.title = stringValue(body.title, "title");

  return patch;
}

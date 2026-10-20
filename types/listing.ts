export type ListingAvailability = "available" | "not available";

export type ListingType = "Rent" | "Sale" | "Lease";
export type ListingPriceRange = "Per Day" | "Per week" | "Per month";
export type ListingCategory = "house" | "apartment" | "office" | "shop" | "land";

export type Listing = {
    id?: string;
    category: ListingCategory;
    listingType: ListingType,
    amenities: string[];
    availability: ListingAvailability;
    bedrooms: number;
    commission: string;
    details: string;
    featured?: boolean;
    furnished: string;
    garage: number;
    gallery: string[];
    image: string;
    leaseOptions: string[];
    location: string;
    price: string;
    priceRange: ListingPriceRange;
    priceType: ListingType;
    registrationFee: string;
    showers: number;
    slug: string;
    title: string;
};

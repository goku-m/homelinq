import { query } from "@/lib/db";
import type { Listing, ListingAvailability, ListingType } from "@/types/listing";

type AdminListingRow = {
  category: Listing["category"];
  id: string;
  amenities?: string[];
  availability: ListingAvailability;
  bedrooms?: number;
  commission?: string;
  created_at: Date;
  details?: string;
  featured: boolean;
  furnished?: string;
  gallery?: string[];
  garage?: number;
  image?: string;
  lease_options?: string[];
  listing_type: ListingType;
  location: string;
  price: string;
  price_range: Listing["priceRange"];
  price_type: ListingType;
  registration_fee?: string;
  showers?: number;
  slug: string;
  title: string;
  updated_at: Date;
};

export type AdminMetric = {
  label: string;
  value: string;
  tone: "blue" | "green" | "amber" | "red";
};

export type AdminDistributionItem = {
  count: number;
  label: string;
  share: number;
  value: number;
};

export type AdminTypeBreakdownItem = {
  count: number;
  label: ListingType;
  share: number;
};

export type AdminRecentListing = {
  availability: ListingAvailability;
  featured: boolean;
  location: string;
  price: string;
  slug: string;
  title: string;
  type: ListingType;
  updatedAt: string;
};

export type AdminDashboardData = {
  generatedAt: string;
  locationDistribution: AdminDistributionItem[];
  metrics: AdminMetric[];
  recentListings: AdminRecentListing[];
  typeBreakdown: AdminTypeBreakdownItem[];
};

export type AdminAnalyticsMetric = {
  delta: string;
  direction: "up" | "down";
  label: string;
  value: string;
};

export type AdminAnalyticsMonth = {
  label: string;
  value: number;
};

export type AdminTopProperty = {
  image: string;
  slug: string;
  title: string;
  views: number;
};

export type AdminAnalyticsData = {
  generatedAt: string;
  metrics: AdminAnalyticsMetric[];
  topProperties: AdminTopProperty[];
  viewsOverTime: AdminAnalyticsMonth[];
};

function listingFromRow(row: Required<AdminListingRow>): Listing {
  return {
    id: row.id,
    category: row.category,
    amenities: row.amenities ?? [],
    availability: row.availability,
    bedrooms: row.bedrooms,
    commission: row.commission,
    details: row.details,
    featured: row.featured,
    furnished: row.furnished,
    garage: row.garage,
    gallery: row.gallery ?? [],
    image: row.image,
    leaseOptions: row.lease_options ?? [],
    listingType: row.listing_type,
    location: row.location,
    price: row.price,
    priceRange: row.price_range,
    priceType: row.price_type,
    registrationFee: row.registration_fee,
    showers: row.showers,
    slug: row.slug,
    title: row.title,
  };
}

function parsePrice(price: string) {
  const numericPrice = Number(price.replace(/[^\d.]/g, ""));

  return Number.isFinite(numericPrice) ? numericPrice : 0;
}

function annualizedValue(listing: Pick<AdminListingRow, "listing_type" | "price" | "price_type">) {
  const price = parsePrice(listing.price);

  if (listing.listing_type === "Sale" && listing.price_type === "Sale") {
    return price;
  }

  return price * 12;
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("en-GH", {
    currency: "GHS",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
    notation: value >= 1_000_000 ? "compact" : "standard",
    style: "currency",
  }).format(value);
}

function percentShare(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function sortByCountThenLabel<T extends { count: number; label: string }>(a: T, b: T) {
  return b.count - a.count || a.label.localeCompare(b.label);
}

function formatPercentDelta(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "+100%" : "+0%";
  }

  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";

  return `${sign}${delta.toFixed(1)}%`;
}

function formatDurationDelta(current: number, previous: number) {
  const delta = current - previous;
  const sign = delta >= 0 ? "+" : "-";
  const absoluteDelta = Math.abs(delta);

  return `${sign}${Math.floor(absoluteDelta / 60)}:${String(absoluteDelta % 60).padStart(2, "0")}`;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const result = await query<AdminListingRow>(`
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
      availability,
      featured,
      created_at,
      updated_at
    FROM listings
    ORDER BY updated_at DESC, created_at DESC
  `);

  const listings = result.rows;
  const totalProperties = listings.length;
  const availableCount = listings.filter((listing) => listing.availability === "available").length;
  const featuredCount = listings.filter((listing) => listing.featured).length;
  const portfolioValue = listings.reduce(
    (total, listing) => total + annualizedValue(listing),
    0,
  );

  const locationTotals = new Map<string, { count: number; value: number }>();
  const typeTotals = new Map<ListingType, number>();

  for (const listing of listings) {
    const locationTotal = locationTotals.get(listing.location) ?? { count: 0, value: 0 };
    locationTotal.count += 1;
    locationTotal.value += annualizedValue(listing);
    locationTotals.set(listing.location, locationTotal);

    typeTotals.set(listing.listing_type, (typeTotals.get(listing.listing_type) ?? 0) + 1);
  }

  const maxLocationValue = Math.max(
    0,
    ...Array.from(locationTotals.values(), (item) => item.value),
  );

  return {
    generatedAt: new Date().toISOString(),
    locationDistribution: Array.from(locationTotals, ([label, item]) => ({
      count: item.count,
      label,
      share: percentShare(item.value, maxLocationValue),
      value: item.value,
    }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
      .slice(0, 5),
    metrics: [
      {
        label: "Total Properties",
        tone: "blue",
        value: String(totalProperties),
      },
      {
        label: "Portfolio Value",
        tone: "green",
        value: compactCurrency(portfolioValue),
      },
      {
        label: "Available Now",
        tone: "amber",
        value: String(availableCount),
      },
      {
        label: "Featured Listings",
        tone: "red",
        value: String(featuredCount),
      },
    ],
    recentListings: listings.slice(0, 6).map((listing) => ({
      availability: listing.availability,
      featured: listing.featured,
      location: listing.location,
      price: listing.price,
      slug: listing.slug,
      title: listing.title,
      type: listing.listing_type,
      updatedAt: listing.updated_at.toISOString(),
    })),
    typeBreakdown: Array.from(typeTotals, ([label, count]) => ({
      count,
      label,
      share: percentShare(count, totalProperties),
    })).sort(sortByCountThenLabel),
  };
}

export async function getAdminListings() {
  const result = await query<Required<AdminListingRow>>(`
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
      featured,
      created_at,
      updated_at
    FROM listings
    ORDER BY updated_at DESC, created_at DESC
  `);

  return result.rows.map(listingFromRow);
}

export async function getAdminAnalyticsData(): Promise<AdminAnalyticsData> {
  type MetricRow = {
    average_duration_seconds: string | null;
    current_average_duration_seconds: string | null;
    current_lead_count: string;
    current_view_count: string;
    lead_count: string;
    previous_average_duration_seconds: string | null;
    previous_lead_count: string;
    previous_view_count: string;
    view_count: string;
  };
  type TopPropertyRow = {
    image: string;
    slug: string;
    title: string;
    views: string;
  };
  type MonthlyViewRow = {
    month: string;
    views: string;
  };

  const [metricsResult, topPropertiesResult, monthlyViewsResult] = await Promise.all([
    query<MetricRow>(`
      SELECT
        (SELECT count(*)::text FROM listing_views) AS view_count,
        (SELECT count(*)::text FROM listing_leads) AS lead_count,
        (SELECT avg(NULLIF(duration_seconds, 0))::text FROM listing_views) AS average_duration_seconds,
        (
          SELECT count(*)::text
          FROM listing_views
          WHERE viewed_at >= now() - interval '30 days'
        ) AS current_view_count,
        (
          SELECT count(*)::text
          FROM listing_views
          WHERE viewed_at >= now() - interval '60 days'
            AND viewed_at < now() - interval '30 days'
        ) AS previous_view_count,
        (
          SELECT count(*)::text
          FROM listing_leads
          WHERE created_at >= now() - interval '30 days'
        ) AS current_lead_count,
        (
          SELECT count(*)::text
          FROM listing_leads
          WHERE created_at >= now() - interval '60 days'
            AND created_at < now() - interval '30 days'
        ) AS previous_lead_count,
        (
          SELECT avg(NULLIF(duration_seconds, 0))::text
          FROM listing_views
          WHERE viewed_at >= now() - interval '30 days'
        ) AS current_average_duration_seconds,
        (
          SELECT avg(NULLIF(duration_seconds, 0))::text
          FROM listing_views
          WHERE viewed_at >= now() - interval '60 days'
            AND viewed_at < now() - interval '30 days'
        ) AS previous_average_duration_seconds
    `),
    query<TopPropertyRow>(`
      SELECT
        listings.slug,
        listings.title,
        listings.image,
        count(listing_views.id)::text AS views
      FROM listings
      LEFT JOIN listing_views
        ON listing_views.listing_id = listings.id
      GROUP BY listings.slug, listings.title, listings.image, listings.updated_at
      ORDER BY count(listing_views.id) DESC, listings.updated_at DESC
      LIMIT 5
    `),
    query<MonthlyViewRow>(`
      SELECT
        to_char(months.month_start, 'Mon') AS month,
        count(listing_views.id)::text AS views
      FROM generate_series(
        date_trunc('month', now()) - interval '11 months',
        date_trunc('month', now()),
        interval '1 month'
      ) AS months(month_start)
      LEFT JOIN listing_views
        ON listing_views.viewed_at >= months.month_start
        AND listing_views.viewed_at < months.month_start + interval '1 month'
      GROUP BY months.month_start
      ORDER BY months.month_start
    `),
  ]);

  const metrics = metricsResult.rows[0];
  const totalViews = Number(metrics?.view_count ?? 0);
  const leadGeneration = Number(metrics?.lead_count ?? 0);
  const currentViews = Number(metrics?.current_view_count ?? 0);
  const previousViews = Number(metrics?.previous_view_count ?? 0);
  const currentLeads = Number(metrics?.current_lead_count ?? 0);
  const previousLeads = Number(metrics?.previous_lead_count ?? 0);
  const conversionRate = totalViews === 0 ? 0 : (leadGeneration / totalViews) * 100;
  const currentConversionRate = currentViews === 0 ? 0 : (currentLeads / currentViews) * 100;
  const previousConversionRate = previousViews === 0 ? 0 : (previousLeads / previousViews) * 100;
  const avgSeconds = Math.round(Number(metrics?.average_duration_seconds ?? 0));
  const currentAvgSeconds = Math.round(Number(metrics?.current_average_duration_seconds ?? 0));
  const previousAvgSeconds = Math.round(Number(metrics?.previous_average_duration_seconds ?? 0));

  return {
    generatedAt: new Date().toISOString(),
    metrics: [
      {
        delta: formatPercentDelta(currentViews, previousViews),
        direction: currentViews >= previousViews ? "up" : "down",
        label: "Total Views",
        value: new Intl.NumberFormat("en-US").format(totalViews),
      },
      {
        delta: `${currentConversionRate >= previousConversionRate ? "+" : ""}${(currentConversionRate - previousConversionRate).toFixed(1)}%`,
        direction: currentConversionRate >= previousConversionRate ? "up" : "down",
        label: "Conversion Rate",
        value: `${conversionRate.toFixed(1)}%`,
      },
      {
        delta: formatDurationDelta(currentAvgSeconds, previousAvgSeconds),
        direction: currentAvgSeconds >= previousAvgSeconds ? "up" : "down",
        label: "Avg. Time on Site",
        value: `${Math.floor(avgSeconds / 60)}:${String(avgSeconds % 60).padStart(2, "0")}`,
      },
      {
        delta: formatPercentDelta(currentLeads, previousLeads),
        direction: currentLeads >= previousLeads ? "up" : "down",
        label: "Lead Generation",
        value: String(leadGeneration),
      },
    ],
    topProperties: topPropertiesResult.rows.map((property) => ({
      image: property.image,
      slug: property.slug,
      title: property.title,
      views: Number(property.views),
    })),
    viewsOverTime: monthlyViewsResult.rows.map((row) => ({
      label: row.month,
      value: Number(row.views),
    })),
  };
}

import type { MetadataRoute } from "next";
import { listListings } from "@/lib/listing-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://homelinqproperties.com";
  const staticRoutes = ["", "/explore", "/about", "/contact"].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "" ? "daily" as const : "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const listings = await listListings();
    return [
      ...staticRoutes,
      ...listings.map((listing) => ({
        url: `${baseUrl}/listing-details/${listing.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}

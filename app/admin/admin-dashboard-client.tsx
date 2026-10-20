"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminAnalyticsData,
  AdminDashboardData,
  AdminMetric,
} from "@/lib/admin-dashboard";
import { getListingCardImageUrl } from "@/lib/listing-image-url";
import type { Listing, ListingAvailability, ListingType } from "@/types/listing";

const typeColors = ["#622347", "#122e34", "#677e8a", "#e0b4b2", "#abafb5"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GH", {
    currency: "GHS",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
    notation: value >= 1_000_000 ? "compact" : "standard",
    style: "currency",
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

const adminNavItems = [
  ["overview", "Overview"],
  ["properties", "Properties"],
  ["analytics", "Analytics"],
] as const;

type AdminIconName =
  | "analytics"
  | "bath"
  | "bed"
  | "building"
  | "cash"
  | "check"
  | "close"
  | "contacts"
  | "edit"
  | "grid"
  | "home"
  | "list"
  | "menu"
  | "overview"
  | "plus"
  | "properties"
  | "search"
  | "settings"
  | "star"
  | "trash"
  | "tours"
  | "users";

export type AdminSection = (typeof adminNavItems)[number][0];

type PropertyViewMode = "grid" | "list";

function Icon({ name }: { name: AdminIconName }) {
  const common = {
    "aria-hidden": true,
    className: "h-5 w-5",
    fill: "none",
    viewBox: "0 0 24 24",
  };

  const paths = {
    analytics: <path d="m4 17 5-5 4 4 7-8M4 20h16" />,
    bath: <path d="M7 11h10M9 11V8.5a3 3 0 0 1 6 0V11m-7 4v.2m4-.2v.2m4-.2v.2M7 19v.2m4-.2v.2m4-.2v.2m4-8.2v9M5 20h14" />,
    bed: <path d="M4 11V6.8C4 5.8 4.8 5 5.8 5h3.4c1 0 1.8.8 1.8 1.8V11m-7 0h16m-16 0v8m16-8V8.8c0-1-.8-1.8-1.8-1.8H14c-1.1 0-2 .9-2 2v2m8 8v-3H4v3" />,
    building: <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16M9 8h3M9 12h3M9 16h3M3 21h18" />,
    cash: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />,
    check: <path d="m5 13 4 4L19 7" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    contacts: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />,
    edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />,
    grid: <path d="M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h6v6h-6v-6Z" />,
    home: <path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3v-9.5Z" />,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    overview: <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />,
    plus: <path d="M12 5v14M5 12h14" />,
    properties: <path d="M5 21V4h14v17M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" />,
    search: <path d="m21 21-4.4-4.4M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />,
    settings: <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2 3.4-.2-.1a1.6 1.6 0 0 0-1.9.1 8 8 0 0 1-1.6.9 1.6 1.6 0 0 0-1 1.5V23H9v-.3a1.6 1.6 0 0 0-1-1.5 8 8 0 0 1-1.6-.9 1.6 1.6 0 0 0-1.9-.1l-.2.1-2-3.4.1-.1A1.6 1.6 0 0 0 2.6 15 8 8 0 0 1 2.3 13a1.6 1.6 0 0 0-1.3-1.5H1V8h.1a1.6 1.6 0 0 0 1.3-1.5A8 8 0 0 1 2.7 5a1.6 1.6 0 0 0-.3-1.8l-.1-.1 2-3.4.2.1a1.6 1.6 0 0 0 1.9-.1A8 8 0 0 1 8 1.8 1.6 1.6 0 0 0 9 .3V0h4v.3a1.6 1.6 0 0 0 1 1.5 8 8 0 0 1 1.6.9 1.6 1.6 0 0 0 1.9.1l.2-.1 2 3.4-.1.1a1.6 1.6 0 0 0-.3 1.8 8 8 0 0 1 .4 1.5 1.6 1.6 0 0 0 1.3 1.5h.1v3.5H21a1.6 1.6 0 0 0-1.3 1.5 8 8 0 0 1-.3 1Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />,
    tours: <path d="M8 2v4M16 2v4M4 9h16M6 4h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />,
  };

  return (
    <svg {...common}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        {paths[name]}
      </g>
    </svg>
  );
}

function AdminBrand({ hasBorder = true }: { hasBorder?: boolean }) {
  return (
    <div className={`flex h-16 items-center gap-3 px-4 ${hasBorder ? "border-b border-white/10" : ""}`}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--theme-muted-teal)] shadow-sm">
        <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3.2 3.9 7.7v8.6l8.1 4.5 8.1-4.5V7.7L12 3.2Zm0 3.1 4.9 2.7-4.9 2.7L7.1 9 12 6.3Zm-5.2 5.4 3.7 2v4.3l-3.7-2.1v-4.2Zm10.4 4.2-3.7 2.1v-4.3l3.7-2v4.2Z" />
        </svg>
      </span>
      <span className="text-lg font-black">HomeLinq</span>
    </div>
  );
}

function AdminSidebarNav({
  activeSection,
  onNavigate,
}: {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
}) {
  return (
    <nav className="mt-4 grid gap-1 px-3 text-sm font-semibold">
      {adminNavItems.map(([icon, label]) => (
        <button
          className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left ${icon === activeSection ? "bg-[var(--theme-primary)] text-white" : "text-white/78 hover:bg-white/8 hover:text-white"}`}
          key={label}
          onClick={() => onNavigate(icon)}
          type="button"
        >
          <Icon name={icon} />
          {label}
        </button>
      ))}
      <Link
        className="mt-4 flex items-center gap-3 rounded-lg border-t border-white/10 px-3 py-4 text-white/78 transition hover:bg-white/8 hover:text-white"
        href="/"
      >
        <Icon name="home" />
        Back to Home
      </Link>
    </nav>
  );
}

function MetricCard({ metric }: { metric: AdminMetric }) {
  const iconByTone = {
    amber: "check",
    blue: "building",
    green: "cash",
    red: "star",
  } as const;
  const toneClass = "bg-[var(--theme-muted-teal)]/10 text-[var(--theme-muted-teal)]";

  return (
    <article className="flex min-h-24 min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{metric.label}</p>
        <p className="mt-1 break-words text-xl font-black tracking-normal text-slate-950 sm:text-2xl">
          {metric.value}
        </p>
      </div>
      <span className={`grid h-12 w-12 place-items-center rounded-lg ${toneClass}`}>
        <Icon name={iconByTone[metric.tone]} />
      </span>
    </article>
  );
}

function DonutChart({ data }: { data: AdminDashboardData["typeBreakdown"] }) {
  const gradient = useMemo(() => {
    if (data.length === 0) {
      return "#abafb5";
    }

    let current = 0;
    const segments = data.map((item, index) => {
      const next = current + item.share;
      const segment = `${typeColors[index % typeColors.length]} ${current}% ${next}%`;
      current = next;
      return segment;
    });

    if (current < 100) {
      segments.push(`#abafb5 ${current}% 100%`);
    }

    return `conic-gradient(${segments.join(", ")})`;
  }, [data]);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div
        aria-hidden="true"
        className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
        style={{ background: gradient }}
      >
        <div className="h-20 w-20 rounded-full bg-white" />
      </div>
      <div className="grid flex-1 gap-3">
        {data.map((item, index) => (
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm" key={item.label}>
            <span className="flex min-w-0 items-center gap-2 text-slate-700">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: typeColors[index % typeColors.length] }}
              />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="font-black text-slate-950">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardContent({ dashboard }: { dashboard: AdminDashboardData }) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.98fr]">
        <article className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-black text-slate-950">Portfolio Value by Location</h2>
            <span className="text-xs font-bold text-slate-400">Live</span>
          </div>
          <div className="mt-5 grid gap-4">
            {dashboard.locationDistribution.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-slate-600">{item.label}</span>
                  <span className="shrink-0 text-right text-xs font-black text-slate-950 sm:text-sm">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[var(--theme-primary)]"
                    style={{ width: `${Math.max(item.share, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-black text-slate-950">Listing Type Breakdown</h2>
          <div className="mt-6">
            <DonutChart data={dashboard.typeBreakdown} />
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-black text-slate-950">Recently Updated Listings</h2>
          <p className="text-xs font-bold text-slate-400">
            Last refreshed {formatTime(dashboard.generatedAt)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-5 py-3 font-black">Property</th>
                <th className="hidden px-5 py-3 font-black sm:table-cell">Type</th>
                <th className="hidden px-5 py-3 font-black sm:table-cell">Status</th>
                <th className="px-5 py-3 font-black">Price</th>
                <th className="hidden px-5 py-3 font-black md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.recentListings.map((listing) => (
                <tr className="hover:bg-slate-50" key={listing.slug}>
                  <td className="px-5 py-4">
                    <Link className="font-black text-slate-950 hover:text-[var(--theme-primary)]" href={`/listing-details/${listing.slug}`}>
                      {listing.title}
                    </Link>
                    <p className="mt-1 text-xs font-medium text-slate-500">{listing.location}</p>
                  </td>
                  <td className="hidden px-5 py-4 font-semibold text-slate-700 sm:table-cell">{listing.type}</td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${listing.availability === "available" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {listing.availability}
                    </span>
                  </td>
                  <td className="max-w-0 break-words px-5 py-4 font-black text-slate-950">{listing.price}</td>
                  <td className="hidden px-5 py-4 font-semibold text-slate-500 md:table-cell">{formatTime(listing.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AnalyticsMetricCard({
  metric,
}: {
  metric: AdminAnalyticsData["metrics"][number];
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
      <p className="mt-1 text-2xl font-black tracking-normal text-slate-950">
        {metric.value}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${
          metric.direction === "up" ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {metric.direction === "up" ? "↗" : "↘"} {metric.delta}
      </p>
    </article>
  );
}

function ViewsChart({ data }: { data: AdminAnalyticsData["viewsOverTime"] }) {
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="flex h-72 flex-col justify-end">
      <div className="flex h-56 items-end gap-3 border-b border-slate-100 px-2">
        {data.map((item) => (
          <div className="flex h-full flex-1 items-end" key={item.label}>
            <div
              className="w-full rounded-t-lg bg-[var(--theme-primary)]/85 transition hover:bg-[var(--theme-primary-hover)]"
              style={{ height: `${Math.max(8, (item.value / maxValue) * 100)}%` }}
              title={`${item.label}: ${item.value} views`}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-12 gap-2 text-center text-xs font-medium text-slate-500">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function AnalyticsContent({
  analytics,
  error,
  isLoading,
}: {
  analytics: AdminAnalyticsData | null;
  error: string;
  isLoading: boolean;
}) {
  const maxViews = Math.max(
    1,
    ...(analytics?.topProperties.map((property) => property.views) ?? []),
  );

  if (isLoading && !analytics) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-28 rounded-lg bg-white shadow-sm" key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="h-80 rounded-lg bg-white shadow-sm" />
          <div className="h-80 rounded-lg bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-black text-rose-600">
          {error || "Unable to load analytics."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.metrics.map((metric) => (
          <AnalyticsMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-950">Views Over Time</h2>
          <ViewsChart data={analytics.viewsOverTime} />
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-950">
            Top Performing Properties
          </h2>
          <div className="mt-5 grid gap-4">
            {analytics.topProperties.map((property, index) => (
              <div
                className="grid grid-cols-[28px_44px_1fr] items-center gap-3 sm:grid-cols-[28px_44px_1fr_96px]"
                key={property.slug}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                  {index + 1}
                </span>
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    alt={`${property.title} thumbnail`}
                    className="object-cover"
                    fill
                    sizes="40px"
                    src={property.image}
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <Link
                    className="block truncate text-sm font-black text-slate-950 hover:text-blue-700"
                    href={`/listing-details/${property.slug}`}
                  >
                    {property.title}
                  </Link>
                  <p className="mt-0.5 text-sm font-medium text-slate-500">
                    {property.views} views
                  </p>
                </div>
                <div className="hidden h-2 overflow-hidden rounded-full bg-slate-100 sm:block">
                  <div
                    className="h-full rounded-full bg-[var(--theme-primary)]"
                    style={{ width: `${Math.max(8, (property.views / maxViews) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function listingImageCount(listing: Listing) {
  return new Set([listing.image, ...listing.gallery]).size;
}

function ListingActions({
  listing,
  onDelete,
}: {
  listing: Listing;
  onDelete: (listing: Listing) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        aria-label={`Edit ${listing.title}`}
        className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-[var(--theme-spring)] hover:text-[var(--theme-primary)]"
        href={`/admin/properties/${encodeURIComponent(listing.slug)}/edit`}
      >
        <Icon name="edit" />
      </Link>
      <button
        aria-label={`Delete ${listing.title}`}
        className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
        onClick={() => onDelete(listing)}
        type="button"
      >
        <Icon name="trash" />
      </button>
    </div>
  );
}

function PropertyGridCard({
  listing,
  onDelete,
}: {
  listing: Listing;
  onDelete: (listing: Listing) => void;
}) {
  const priceLabel =
    listing.priceType === "Rent"
      ? "per month"
      : listing.priceType === "Sale"
        ? "for sale"
        : "for lease";

  return (
    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-[0_22px_45px_rgba(21,33,52,0.14)] ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(21,33,52,0.18)] focus-within:-translate-y-1 focus-within:shadow-[0_28px_56px_rgba(21,33,52,0.18)]">
      <div className="relative h-44 bg-slate-100">
        <Image
          alt={`${listing.title} property`}
          className="object-cover transition duration-500 hover:scale-105"
          fill
          sizes="(min-width: 768px) 30vw, 90vw"
          src={getListingCardImageUrl(listing.image)}
          unoptimized
        />
        <span className="absolute left-4 top-4 rounded-full bg-[var(--theme-primary)] px-3 py-1 text-xs font-black text-white">
          For {listing.listingType}
        </span>
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/72 px-3 py-1 text-xs font-black text-white backdrop-blur">
          {listingImageCount(listing)} images
        </span>
        <div className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <ListingActions listing={listing} onDelete={onDelete} />
        </div>
      </div>

      <div className="p-6">
        <div>
          <Link
            className="min-w-0 text-lg font-black leading-tight text-slate-950 hover:text-[var(--theme-primary)]"
            href={`/listing-details/${listing.slug}`}
          >
            {listing.title}
          </Link>
          <div className="mt-2">
            <p className="text-base font-black text-[var(--theme-primary)]">
              {listing.price}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-normal text-slate-400">
              {priceLabel}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm font-bold text-slate-500">
          {listing.location}
        </p>
        <p className="mt-3 min-h-5 text-sm leading-6 text-slate-600">
          {listing.details.length > 50
            ? `${listing.details.slice(0, 50)}...`
            : listing.details}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-2 rounded-full bg-[var(--theme-spring)] px-3 py-2 text-sm font-black text-[#183866] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs">
            <Icon name="bed" />
            <span>
              {listing.bedrooms} Bedroom{listing.bedrooms === 1 ? "" : "s"}
            </span>
          </span>
          <span className="flex items-center gap-2 rounded-full bg-[var(--theme-spring)] px-3 py-2 text-sm font-black text-[#183866] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs">
            <Icon name="bath" />
            <span>
              {listing.showers} Bath{listing.showers === 1 ? "" : "s"}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

function PropertyListRow({
  listing,
  onDelete,
}: {
  listing: Listing;
  onDelete: (listing: Listing) => void;
}) {
  const priceLabel =
    listing.priceType === "Rent"
      ? "per month"
      : listing.priceType === "Sale"
        ? "for sale"
        : "for lease";

  return (
    <article className="grid gap-5 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_22px_45px_rgba(21,33,52,0.14)] ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(21,33,52,0.18)] md:grid-cols-[220px_1fr_auto] md:items-center">
      <div className="relative h-44 overflow-hidden rounded-xl bg-slate-100 md:h-36">
        <Image
          alt={`${listing.title} property`}
          className="object-cover transition duration-500 hover:scale-105"
          fill
          sizes="220px"
          src={getListingCardImageUrl(listing.image)}
          unoptimized
        />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--theme-primary)] px-3 py-1 text-xs font-black text-white">
          For {listing.listingType}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <Link
            className="min-w-0 text-lg font-black leading-tight text-slate-950 hover:text-[var(--theme-primary)]"
            href={`/listing-details/${listing.slug}`}
          >
            {listing.title}
          </Link>
          <div className="shrink-0 text-right">
            <p className="text-base font-black text-[var(--theme-primary)]">{listing.price}</p>
            <p className="text-[11px] font-bold uppercase tracking-normal text-slate-400">
              {priceLabel}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-slate-500">{listing.location}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {listing.details.length > 90
            ? `${listing.details.slice(0, 90)}...`
            : listing.details}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-2 rounded-full bg-[var(--theme-spring)] px-3 py-2 text-sm font-black text-[#183866] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs">
            <Icon name="bed" />
            {listing.bedrooms} Bedroom{listing.bedrooms === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-[var(--theme-spring)] px-3 py-2 text-sm font-black text-[#183866] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs">
            <Icon name="bath" />
            {listing.showers} Bath{listing.showers === 1 ? "" : "s"}
          </span>
          <span className={`rounded-full px-3 py-2 text-sm font-black md:px-2.5 md:py-1.5 md:text-xs ${listing.availability === "available" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {listing.availability}
          </span>
          {listing.featured ? (
            <span className="rounded-full bg-orange-50 px-3 py-2 text-sm font-black text-orange-700 md:px-2.5 md:py-1.5 md:text-xs">
              Featured
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex md:self-start">
        <ListingActions listing={listing} onDelete={onDelete} />
      </div>
    </article>
  );
}

function PropertiesContent({
  actionMessage,
  filteredListings,
  isLoading,
  listings,
  onDelete,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onViewModeChange,
  propertyError,
  searchQuery,
  statusFilter,
  typeFilter,
  viewMode,
}: {
  actionMessage: string;
  filteredListings: Listing[];
  isLoading: boolean;
  listings: Listing[];
  onDelete: (listing: Listing) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | ListingAvailability) => void;
  onTypeChange: (value: "all" | ListingType) => void;
  onViewModeChange: (mode: PropertyViewMode) => void;
  propertyError: string;
  searchQuery: string;
  statusFilter: "all" | ListingAvailability;
  typeFilter: "all" | ListingType;
  viewMode: PropertyViewMode;
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_136px_150px_auto]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" />
            </span>
            <input
              className="h-11 w-full rounded-lg border border-slate-200 pl-11 pr-3 text-sm outline-none focus:border-blue-500"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search properties..."
              type="search"
              value={searchQuery}
            />
          </label>
          <select
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            onChange={(event) => onTypeChange(event.target.value as "all" | ListingType)}
            value={typeFilter}
          >
            <option value="all">All Types</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
            <option value="Lease">Lease</option>
          </select>
          <select
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            onChange={(event) => onStatusChange(event.target.value as "all" | ListingAvailability)}
            value={statusFilter}
          >
            <option value="all">All Status</option>
            <option value="available">available</option>
            <option value="not available">not available</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              aria-label="View properties as grid"
              className={`grid h-10 w-10 place-items-center rounded-lg ${viewMode === "grid" ? "bg-[var(--theme-spring)] text-[var(--theme-primary)]" : "text-slate-600 hover:bg-slate-100"}`}
              onClick={() => onViewModeChange("grid")}
              type="button"
            >
              <Icon name="grid" />
            </button>
            <button
              aria-label="View properties as list"
              className={`grid h-10 w-10 place-items-center rounded-lg ${viewMode === "list" ? "bg-[var(--theme-spring)] text-[var(--theme-primary)]" : "text-slate-600 hover:bg-slate-100"}`}
              onClick={() => onViewModeChange("list")}
              type="button"
            >
              <Icon name="list" />
            </button>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-4 text-sm font-black text-white hover:bg-[var(--theme-primary-hover)]"
              href="/admin/properties/new"
            >
              <Icon name="plus" />
              Add Property
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold text-slate-500">
          Showing {filteredListings.length} of {listings.length} properties
        </p>
        {actionMessage ? <p className="font-bold text-blue-700">{actionMessage}</p> : null}
        {propertyError ? <p className="font-bold text-rose-600">{propertyError}</p> : null}
      </div>

      {isLoading ? (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="h-[430px] rounded-2xl bg-white shadow-sm" key={index} />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <PropertyGridCard
              key={listing.slug}
              listing={listing}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredListings.map((listing) => (
            <PropertyListRow
              key={listing.slug}
              listing={listing}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredListings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-black text-slate-950">No properties match these filters.</p>
        </div>
      ) : null}

    </div>
  );
}

export function AdminDashboardClient({
  initialDashboard,
  initialSection,
}: {
  initialDashboard: AdminDashboardData;
  initialSection: AdminSection;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [listings, setListings] = useState<Listing[]>([]);
  const [propertyError, setPropertyError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [viewMode, setViewMode] = useState<PropertyViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ListingType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ListingAvailability>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesQuery =
        normalizedQuery === "" ||
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.location.toLowerCase().includes(normalizedQuery) ||
        listing.price.toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === "all" || listing.listingType === typeFilter;
      const matchesStatus = statusFilter === "all" || listing.availability === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [listings, searchQuery, statusFilter, typeFilter]);

  const refreshListings = useCallback(async () => {
    setIsLoadingProperties(true);
    setPropertyError("");

    try {
      const response = await fetch(`/api/admin/listings?refresh=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error("Unable to load properties");
      }

      const payload = (await response.json()) as { listings: Listing[] };
      setListings(payload.listings);
    } catch (error) {
      setPropertyError(error instanceof Error ? error.message : "Unable to load properties");
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError("");

    try {
      const response = await fetch("/api/admin/analytics", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load analytics");
      }

      const payload = (await response.json()) as { analytics: AdminAnalyticsData };
      setAnalytics(payload.analytics);
    } catch (error) {
      setAnalyticsError(error instanceof Error ? error.message : "Unable to load analytics");
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeSection === "properties") {
        void refreshListings();
      }
      if (activeSection === "analytics" && !analytics) {
        void refreshAnalytics();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeSection, analytics, refreshAnalytics, refreshListings]);

  const refreshDashboard = async () => {
    const response = await fetch("/api/admin/dashboard", {
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as { dashboard: AdminDashboardData };
      setDashboard(payload.dashboard);
    }
  };

  const handleDeleteListing = async (listing: Listing) => {
    const shouldDelete = window.confirm(`Delete ${listing.title}?`);

    if (!shouldDelete) {
      return;
    }

    setPropertyError("");
    setActionMessage("");

    try {
      const response = await fetch(`/api/listings/${encodeURIComponent(listing.slug)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete property");
      }

      setListings((currentListings) =>
        currentListings.filter((currentListing) => currentListing.slug !== listing.slug),
      );
      setActionMessage("Property deleted.");
      void refreshDashboard();
    } catch (error) {
      setPropertyError(error instanceof Error ? error.message : "Unable to delete property");
    }
  };

  const handleNavigate = (section: AdminSection) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  const headerTitle =
    activeSection === "overview"
      ? "Overview"
      : activeSection === "properties"
        ? "Properties"
        : "Analytics";

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-[#101827] text-white lg:block">
        <AdminBrand />
        <AdminSidebarNav activeSection={activeSection} onNavigate={handleNavigate} />
      </aside>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-slate-950/52"
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          />
          <aside className="relative h-full w-72 max-w-[86vw] bg-[#101827] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pr-3">
              <AdminBrand hasBorder={false} />
              <button
                aria-label="Close admin navigation"
                className="grid h-10 w-10 place-items-center rounded-lg text-white/78 transition hover:bg-white/10 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <AdminSidebarNav activeSection={activeSection} onNavigate={handleNavigate} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open admin navigation"
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              type="button"
            >
              <Icon name="menu" />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-normal text-[var(--theme-primary)]">Admin</p>
              <h1 className="text-xl font-black tracking-normal text-slate-950">{headerTitle}</h1>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          {activeSection === "properties" ? (
            <PropertiesContent
              actionMessage={actionMessage}
              filteredListings={filteredListings}
              isLoading={isLoadingProperties}
              listings={listings}
              onDelete={handleDeleteListing}
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
              onTypeChange={setTypeFilter}
              onViewModeChange={setViewMode}
              propertyError={propertyError}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              viewMode={viewMode}
            />
          ) : activeSection === "analytics" ? (
            <AnalyticsContent
              analytics={analytics}
              error={analyticsError}
              isLoading={isLoadingAnalytics}
            />
          ) : (
            <DashboardContent dashboard={dashboard} />
          )}
        </main>
      </div>
    </div>
  );
}

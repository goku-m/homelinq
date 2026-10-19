import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingBySlugFromDb } from "@/lib/listing-repository";
import { PropertyForm } from "../../property-form";

export const instant = false;

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlugFromDb(slug);

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--theme-surface)] px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-[var(--theme-primary)]">
              Admin
            </p>
            <h1 className="text-2xl font-black tracking-normal text-slate-950">
              Edit Property
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {listing.title}
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
            href="/admin"
          >
            Back to dashboard
          </Link>
        </header>
        <PropertyForm listing={listing} mode="edit" />
      </div>
    </main>
  );
}

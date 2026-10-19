import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--theme-primary)]">
            About HomeLinq
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-[var(--theme-ink)] md:text-5xl">
            Linking people to the right property opportunities.
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            HomeLinq is a property discovery platform for homes, commercial
            spaces, offices, and retail opportunities in Ghana. We make it
            easier to browse available listings, compare property details, and
            connect directly with our team.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(21,33,52,0.1)] ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--theme-primary)]">Discover</p>
            <h2 className="mt-3 text-xl font-black text-[var(--theme-ink)]">Clear property search</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Search by location, category, listing type, bedrooms, currency,
              and price range to find opportunities that fit your needs.
            </p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(21,33,52,0.1)] ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--theme-primary)]">Connect</p>
            <h2 className="mt-3 text-xl font-black text-[var(--theme-ink)]">Local guidance</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Our team helps clients move from browsing to viewing and gives
              practical local guidance throughout the property journey.
            </p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(21,33,52,0.1)] ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--theme-primary)]">Grow</p>
            <h2 className="mt-3 text-xl font-black text-[var(--theme-ink)]">Property services</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              HomeLinq supports property management, brokerage, and commercial
              property needs with a straightforward, client-first approach.
            </p>
          </article>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[var(--theme-ink)] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-black">Ready to explore?</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Browse our available listings or speak with the HomeLinq team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-[var(--theme-ink)] transition hover:bg-slate-100"
              href="/explore"
            >
              Browse listings
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/35 px-5 text-sm font-black text-white transition hover:bg-white/10"
              href="/contact"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

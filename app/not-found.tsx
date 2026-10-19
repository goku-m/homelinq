import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-slate-950">
      <SiteHeader />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <p className="text-7xl font-black text-[var(--theme-primary)]">404</p>
        <h1 className="mt-5 text-3xl font-black text-[var(--theme-ink)]">Page not found</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
          The page or property you’re looking for may have moved or no longer exists.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--theme-primary)] px-5 text-sm font-black text-white transition hover:bg-[var(--theme-primary-hover)]"
            href="/"
          >
            Back home
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-[var(--theme-ink)] transition hover:bg-slate-50"
            href="/explore"
          >
            Browse listings
          </Link>
        </div>
      </section>
    </main>
  );
}

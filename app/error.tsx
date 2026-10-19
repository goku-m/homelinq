"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-slate-950">
      <SiteHeader />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--theme-primary)]">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-black text-[var(--theme-ink)]">We couldn’t load this page</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
          Please try again. If the problem continues, return home and try another page.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--theme-primary)] px-5 text-sm font-black text-white transition hover:bg-[var(--theme-primary-hover)]"
            onClick={() => {
              reset();
              router.refresh();
            }}
            type="button"
          >
            Try again
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-[var(--theme-ink)] transition hover:bg-slate-50"
            href="/"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}

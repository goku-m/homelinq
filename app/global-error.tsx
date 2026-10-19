"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--theme-surface)] font-sans text-slate-950">
        <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--theme-primary)]">HomeLinq</p>
          <h1 className="mt-4 text-3xl font-black text-[var(--theme-ink)]">A server error occurred</h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
            We’re having trouble loading HomeLinq right now. Please try again in a moment.
          </p>
          <button
            className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--theme-primary)] px-5 text-sm font-black text-white transition hover:bg-[var(--theme-primary-hover)]"
            onClick={() => reset()}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

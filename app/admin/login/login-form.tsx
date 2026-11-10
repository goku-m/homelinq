"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to sign in. Check your email and password.");
        return;
      }

      const nextPath = searchParams.get("next");
      const destination = nextPath?.startsWith("/admin/") && nextPath !== "/admin/login"
        ? nextPath
        : "/admin";
      router.replace(destination);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--theme-surface)] px-4 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-[0_22px_55px_rgba(21,33,52,0.14)] ring-1 ring-slate-200 sm:p-9">
        <div className="mx-auto mb-6 flex w-full justify-center rounded-xl bg-[var(--theme-ink)] px-5 py-3">
          <BrandLogo className="block w-[190px]" priority />
        </div>
        <p className="text-center text-sm text-slate-500">
          Sign in to manage HomeLinq properties.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Email
            <input
              autoComplete="username"
              className="h-12 rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/15"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="h-12 rounded-lg border border-slate-300 px-3 outline-none transition focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/15"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p aria-live="polite" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="mt-1 inline-flex h-12 items-center justify-center rounded-lg bg-[var(--theme-primary)] px-5 text-sm font-black text-white transition hover:bg-[var(--theme-primary-hover)] disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

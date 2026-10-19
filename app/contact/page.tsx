import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact HomeLinq Properties",
  description:
    "Contact HomeLinq Properties in Accra, Ghana about homes, offices, commercial spaces, land, and property services.",
  alternates: { canonical: "/contact" },
};

const contactEmail = "info@homelinqproperties.com";
const contactPhone = "+233 54 100 0010";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--theme-primary)]">
            Get in touch
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-[var(--theme-ink)] md:text-5xl">
            Contact HomeLinq Properties
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Our team is ready to help you find the right property, arrange a
            viewing, or answer questions about our listings.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <a
            className="rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(21,33,52,0.1)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-[var(--theme-primary)]/40"
            href={`mailto:${contactEmail}`}
          >
            <p className="text-xs font-black uppercase tracking-wider text-[var(--theme-primary)]">
              Email
            </p>
            <p className="mt-3 break-words text-lg font-black text-[var(--theme-ink)]">
              {contactEmail}
            </p>
            <p className="mt-2 text-sm text-slate-500">Send us an inquiry anytime.</p>
          </a>

          <a
            className="rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(21,33,52,0.1)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-[var(--theme-primary)]/40"
            href={`tel:${contactPhone.replace(/\s+/g, "")}`}
          >
            <p className="text-xs font-black uppercase tracking-wider text-[var(--theme-primary)]">
              Call or WhatsApp
            </p>
            <p className="mt-3 text-lg font-black text-[var(--theme-ink)]">{contactPhone}</p>
            <p className="mt-2 text-sm text-slate-500">Speak with our property team.</p>
          </a>

          <div className="rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(21,33,52,0.1)] ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--theme-primary)]">
              Visit us
            </p>
            <p className="mt-3 text-lg font-black text-[var(--theme-ink)]">Accra, Ghana</p>
            <p className="mt-2 text-sm text-slate-500">North Ridge business district.</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-[var(--theme-ink)] p-6 text-white sm:p-8">
          <h2 className="text-xl font-black">Looking for a property?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Browse our available properties and contact us about a listing that
            fits your needs.
          </p>
          <Link
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-[var(--theme-ink)] transition hover:bg-slate-100"
            href="/explore"
          >
            Browse listings
          </Link>
        </div>
      </section>
    </main>
  );
}

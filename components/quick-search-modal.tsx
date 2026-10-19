"use client";

import { useEffect, useState } from "react";

type QuickSearchModalProps = {
  variant: "explore" | "find" | "hero" | "icon";
};

const categories = [
  "Rent",
  "Sale",
  "Lease",
];

const propertyTypes = ["house", "apartment", "office", "shop", "land"];
const bedOptions = ["1 bed", "2 beds", "3 beds", "4 beds", "5+ beds"];
const currencies = ["GHC", "USD"];
const minPrices = ["No min", "1,000", "2,500", "5,000", "10,000", "100,000"];
const maxPrices = ["No max", "5,000", "10,000", "25,000", "100,000", "750,000"];

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m20 20-4.2-4.2m2.2-5.3a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ChevronIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-ink)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <select
          className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-[var(--theme-surface)] px-4 pr-11 text-sm font-semibold text-[var(--theme-ink)] outline-none transition focus:border-[var(--theme-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--theme-primary)]/15"
          defaultValue=""
          name={name}
        >
          <option disabled value="">
            {label}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <DownIcon />
      </span>
    </label>
  );
}

export function QuickSearchModal({ variant }: QuickSearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const trigger =
    variant === "icon" ? (
      <button
        aria-label="Open property search"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 md:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <SearchIcon />
      </button>
    ) : variant === "explore" ? (
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--theme-primary)]/20 transition hover:bg-[var(--theme-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/25"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <SearchIcon />
        Search listings
      </button>
    ) : variant === "find" ? (
      <button
        className="mt-7 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-6 text-sm font-bold text-white transition hover:bg-[var(--theme-primary-hover)]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Find It Here
        <ChevronIcon />
      </button>
    ) : (
      <button
        className="mr-5 mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-7 text-sm font-bold text-white shadow-xl shadow-black/25 transition hover:bg-[var(--theme-primary-hover)]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Quick Search
        <ChevronIcon />
      </button>
    );

  return (
    <>
      {trigger}

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--theme-ink)]/80 px-4 py-6 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="Close quick search"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />

          <form
            action="/explore"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.32)] ring-1 ring-white/50 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="mt-1 text-xl font-black text-[var(--theme-ink)]">
                  Find your next property
                </h2>
              </div>
              <button
                aria-label="Close quick search"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--theme-spring)] text-[var(--theme-ink)] transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/20"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="sr-only">Enter Location</span>
                <input
                  className="h-14 w-full rounded-xl border border-slate-200 bg-[var(--theme-surface)] px-4 text-sm font-semibold text-[var(--theme-ink)] outline-none transition placeholder:text-slate-500 focus:border-[var(--theme-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--theme-primary)]/15"
                  name="location"
                  placeholder="Enter Location"
                  type="search"
                />
              </label>

              <SelectField label="Category" name="category" options={categories} />

              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Houses" name="type" options={propertyTypes} />
                <SelectField label="Beds" name="beds" options={bedOptions} />
                <SelectField label="Currency" name="currency" options={currencies} />
                <SelectField label="Min Price" name="minPrice" options={minPrices} />
                <SelectField label="Max price" name="maxPrice" options={maxPrices} />
              </div>

              <button
                className="h-14 rounded-xl bg-[var(--theme-primary)] text-sm font-black uppercase text-white shadow-lg shadow-[var(--theme-primary)]/25 transition hover:bg-[var(--theme-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/25"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

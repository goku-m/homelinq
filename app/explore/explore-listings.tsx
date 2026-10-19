"use client";

import { useMemo, useRef, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { Listing } from "@/types/listing";

const PAGE_SIZE = 6;

export function ExploreListings({ listings }: { listings: Listing[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const listingsTopRef = useRef<HTMLDivElement | null>(null);
  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));

  const visibleListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return listings.slice(start, start + PAGE_SIZE);
  }, [currentPage, listings]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);

    if (nextPage === currentPage) {
      return;
    }

    setCurrentPage(nextPage);
    window.requestAnimationFrame(() => {
      listingsTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <>
      <div className="scroll-mt-24" ref={listingsTopRef} />
      <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {visibleListings.map((listing) => (
          <ListingCard key={`${listing.slug}-${listing.title}`} listing={listing} />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
        <p className="text-sm font-bold text-slate-500">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-[var(--theme-ink)] transition hover:border-[var(--theme-primary)]/50 hover:text-[var(--theme-primary)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            type="button"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              const isActive = page === currentPage;

              return (
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-black transition ${isActive
                    ? "bg-[var(--theme-primary)] text-white"
                    : "border border-slate-200 bg-white text-[var(--theme-ink)] hover:border-[var(--theme-primary)]/50 hover:text-[var(--theme-primary)]"
                    }`}
                  key={page}
                  onClick={() => goToPage(page)}
                  type="button"
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-[var(--theme-ink)] transition hover:border-[var(--theme-primary)]/50 hover:text-[var(--theme-primary)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

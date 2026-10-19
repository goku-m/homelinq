"use client";

import Image from "next/image";
import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Listing } from "@/types/listing";

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
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

function View360Icon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.5 12c0-3.1 3.4-5.6 7.5-5.6s7.5 2.5 7.5 5.6-3.4 5.6-7.5 5.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="m15.8 14.3 3.7-2.3-3.7-2.3M7.8 15.6H4.5v-2.4h2.4c.8 0 1.4-.6 1.4-1.3s-.6-1.3-1.4-1.3H4.5V8.4h3.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M10.4 15.6V8.4h2.2c1.8 0 3.1 1.5 3.1 3.6s-1.3 3.6-3.1 3.6h-2.2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function uniqueImages(images: string[]) {
  return images.filter((image, index) => images.indexOf(image) === index);
}

type SwipeStart = {
  x: number;
  y: number;
};

export function ListingGallery({ listing }: { listing: Listing }) {
  const images = useMemo(
    () => uniqueImages([listing.image, ...listing.gallery]),
    [listing.gallery, listing.image],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const swipeStart = useRef<SwipeStart | null>(null);
  const selectedImage = images[selectedIndex] ?? listing.image;

  const selectImage = (index: number) => {
    setSelectedIndex(index);
    thumbnailRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const goToPrevious = () => {
    selectImage((selectedIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    selectImage((selectedIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
      if (event.key === "ArrowLeft") {
        goToPrevious();
      }
      if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const handleModalPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleModalPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;

    if (start === null) {
      return;
    }

    const swipeX = event.clientX - start.x;
    const swipeY = event.clientY - start.y;
    const isHorizontalSwipe =
      Math.abs(swipeX) > 48 && Math.abs(swipeX) > Math.abs(swipeY) * 1.25;

    if (isHorizontalSwipe) {
      if (swipeX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    swipeStart.current = null;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.09)] max-sm:rounded-none max-sm:border-x-0">
      <div className="p-2 sm:p-4">
        <div className="relative min-h-[370px] overflow-hidden rounded-lg bg-slate-100 sm:min-h-[420px] md:min-h-[510px]">
          <button
            aria-label="Open selected image fullscreen"
            className="absolute inset-0 cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--theme-primary)]/35"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            <Image
              alt={`${listing.title} selected view`}
              className="object-contain transition-transform duration-500"
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              src={selectedImage}
            />
          </button>

          {images.length > 1 ? (
            <>
              <button
                aria-label="Show previous image"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-slate-950 shadow-[0_14px_30px_rgba(15,23,42,0.22)] ring-1 ring-white/70 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/35"
                onClick={goToPrevious}
                type="button"
              >
                <ChevronLeftIcon />
              </button>
              <button
                aria-label="Show next image"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-slate-950 shadow-[0_14px_30px_rgba(15,23,42,0.22)] ring-1 ring-white/70 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/35"
                onClick={goToNext}
                type="button"
              >
                <ChevronRightIcon />
              </button>
            </>
          ) : null}

          <div className="absolute bottom-4 left-4 rounded-full bg-slate-950/72 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex min-w-0 flex-1 justify-start gap-2 overflow-x-auto scroll-smooth pb-1">
            {images.map((image, index) => {
              const isSelected = index === selectedIndex;

              return (
                <button
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={isSelected}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-offset-2 transition sm:h-24 sm:w-36 ${
                    isSelected
                      ? "ring-2 ring-[var(--theme-primary)]"
                      : "opacity-72 ring-1 ring-slate-200 hover:opacity-100 hover:ring-[var(--theme-primary)]/45"
                  }`}
                  key={image}
                  onClick={() => selectImage(index)}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type="button"
                >
                  <Image
                    alt={`${listing.title} thumbnail ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="144px"
                    src={image}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
        <span className="inline-flex items-center gap-3 rounded-full bg-[var(--theme-spring)] px-4 py-2 text-sm font-black uppercase tracking-normal text-[var(--theme-primary)]">
          <View360Icon />
          360 view coming soon
        </span>
      </div>

      {isModalOpen ? (
        <div
          aria-label={`${listing.title} fullscreen gallery`}
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex touch-pan-y items-center justify-center bg-slate-950/96 text-white"
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          onPointerDown={handleModalPointerDown}
          onPointerUp={handleModalPointerEnd}
          role="dialog"
        >
          <button
            aria-label="Close fullscreen image"
            className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
            onClick={() => setIsModalOpen(false)}
            type="button"
          >
            <CloseIcon />
          </button>

          {images.length > 1 ? (
            <>
              <button
                aria-label="Show previous image"
                className="absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                onClick={goToPrevious}
                type="button"
              >
                <ChevronLeftIcon />
              </button>
              <button
                aria-label="Show next image"
                className="absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                onClick={goToNext}
                type="button"
              >
                <ChevronRightIcon />
              </button>
            </>
          ) : null}

          <div className="relative h-full w-full">
            <Image
              alt={`${listing.title} fullscreen selected view`}
              className="object-contain"
              fill
              priority
              sizes="100vw"
              src={selectedImage}
            />
          </div>

          <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/12 px-4 py-2 text-sm font-black backdrop-blur">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      ) : null}
    </div>
  );
}

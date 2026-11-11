"use client";

import { useState } from "react";

function ShareIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m8.6 11.4 6.8-3.8m-6.8 5 6.8 3.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

export function SharePropertyAction({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;

    if (isMobile && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // The native share sheet can be dismissed without completing a share.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access may be unavailable outside a secure browser context.
    }
  };

  return (
    <button
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-7 text-center text-sm font-black text-white shadow-lg shadow-[var(--theme-primary)]/20 transition hover:bg-[var(--theme-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/25"
      onClick={handleShare}
      type="button"
    >
      <ShareIcon />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

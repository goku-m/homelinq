"use client";

import { useEffect, useState } from "react";

type ContactPropertyActionProps = {
  email: string;
  listingSlug: string;
  phone: string;
  subject: string;
  variant: "button" | "text";
};

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.5 6.5h15v11h-15v-11Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="m5 7 7 6 7-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
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

export function ContactPropertyAction({
  email,
  listingSlug,
  phone,
  subject,
  variant,
}: ContactPropertyActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mailtoHref = `mailto:${email}?subject=${subject}`;

  const trackLead = (channel: "email" | "phone" | "whatsapp") => {
    const sessionId = window.localStorage.getItem("homelinq_session_id");

    void fetch("/api/analytics/listing-lead", {
      body: JSON.stringify({
        channel,
        listingSlug,
        referrer: document.referrer,
        sessionId,
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
    });
  };

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

  const desktopClass =
    variant === "text"
      ? "hidden shrink-0 text-sm font-black text-[var(--theme-primary)] underline-offset-4 transition hover:text-[var(--theme-deep-teal)] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/20 sm:inline"
      : "hidden h-12 w-full items-center justify-center rounded-lg bg-[var(--theme-deep-teal)] px-7 text-center text-sm font-black text-white shadow-lg shadow-[var(--theme-primary)]/20 transition hover:bg-[var(--theme-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/25 sm:inline-flex";
  const mobileClass =
    variant === "text"
      ? "shrink-0 text-sm font-black text-[var(--theme-primary)] underline-offset-4 transition hover:text-[var(--theme-deep-teal)] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/20 sm:hidden"
      : "inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--theme-deep-teal)] px-7 text-center text-sm font-black text-white shadow-lg shadow-[var(--theme-primary)]/20 transition hover:bg-[var(--theme-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/25 sm:hidden";

  return (
    <>
      <button className={desktopClass} onClick={() => setIsOpen(true)} type="button">
        {variant === "text" ? (
          <>
            Contact
            <span>&nbsp;About This Property</span>
          </>
        ) : (
          "Contact About This Property"
        )}
      </button>

      <button className={mobileClass} onClick={() => setIsOpen(true)} type="button">
        {variant === "text" ? "Contact" : "Contact About This Property"}
      </button>

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--theme-ink)]/75 px-4 py-6 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="Close contact options"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />

          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 text-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[var(--theme-primary)]">
                  Contact property
                </p>
                <h2 className="mt-1 text-xl font-black text-[var(--theme-ink)]">
                  Contact options
                </h2>
              </div>
              <button
                aria-label="Close contact options"
                className="grid h-10 w-10 place-items-center rounded-full bg-[var(--theme-spring)] text-[var(--theme-ink)]"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="min-h-20 rounded-xl bg-[var(--theme-spring)] px-4 py-3 text-[var(--theme-ink)]">
                <p className="text-sm font-black">Call or WhatsApp</p>
                <p className="mt-1 text-xl font-black tracking-wide">{phone}</p>
              </div>
              <a
                className="flex h-14 items-center gap-3 rounded-xl bg-[var(--theme-spring)] px-4 text-sm font-black text-[var(--theme-ink)] transition hover:bg-[#dfe8f3]"
                href={mailtoHref}
                onClick={() => trackLead("email")}
              >
                <EmailIcon />
                Send an Email
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

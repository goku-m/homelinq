"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export type NavItem = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  items: NavItem[];
};

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      {isOpen ? (
        <path
          d="m6 6 12 12M18 6 6 18"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      ) : (
        <path
          d="M5 7h14M5 12h14M5 17h14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      )}
    </svg>
  );
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canUsePortal = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );

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

  const drawer = (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[9999] flex min-h-screen flex-col bg-[var(--theme-ink)] text-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
        isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
      }`}
      id="mobile-navigation"
    >
      <div className="flex items-center justify-between px-5 py-6">
        <span className="text-xl font-black tracking-normal">HomeLinq</span>
        <button
          aria-label="Close navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/20"
          onClick={() => setIsOpen(false)}
          tabIndex={isOpen ? undefined : -1}
          type="button"
        >
          <MenuIcon isOpen />
        </button>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="flex flex-1 flex-col justify-center px-5 pb-20"
      >
        {items.map((item, index) => (
          <a
            className="border-t border-white/12 py-5 text-4xl font-black leading-none tracking-normal text-white transition hover:text-white/72"
            href={item.href}
            key={item.label}
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: isOpen ? `${index * 35}ms` : "0ms" }}
            tabIndex={isOpen ? undefined : -1}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 md:hidden"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      {canUsePortal ? createPortal(drawer, document.body) : null}
    </>
  );
}

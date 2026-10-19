import Link from "next/link";
import { MobileMenu, type NavItem } from "./mobile-menu";

const navItems: NavItem[] = [
  { href: "/explore?category=Sale", label: "For Sale" },
  { href: "/explore?category=Rent&includeLease=true", label: "For Rent" },
  { href: "/about", label: "About" },
  { href: "/explore", label: "Listings" },
  { href: "/contact", label: "Contact" },
];

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--theme-muted-teal)] shadow-sm">
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 3.2 3.9 7.7v8.6l8.1 4.5 8.1-4.5V7.7L12 3.2Zm0 3.1 4.9 2.7-4.9 2.7L7.1 9 12 6.3Zm-5.2 5.4 3.7 2v4.3l-3.7-2.1v-4.2Zm10.4 4.2-3.7 2.1v-4.3l3.7-2v4.2Z" />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="bg-[var(--theme-ink)] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link className="flex items-center gap-2.5 font-bold tracking-tight" href="/">
          <LogoMark />
          <span className="text-xl">HomeLinq</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="ml-auto mr-8 hidden items-center gap-8 text-base font-medium text-white/86 md:flex"
        >
          {navItems.map((item) => (
            <Link
              className="transition hover:text-white"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <MobileMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}

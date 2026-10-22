import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { ListingCard } from "@/components/listing-card";
import { MobileMenu, type NavItem } from "@/components/mobile-menu";
import { QuickSearchModal } from "@/components/quick-search-modal";
import { listFeaturedListings, listListings } from "@/lib/listing-repository";

const navItems: NavItem[] = [
  { href: "/explore?category=Sale", label: "For Sale" },
  { href: "/explore?category=Rent&includeLease=true", label: "For Rent" },
  { href: "/about", label: "About" },
  { href: "#listings", label: "Listings" },
  { href: "/contact", label: "Contact" },
];

const heroSlides: HeroSlide[] = [
  {
    src: "/homepage/commercial-hero.png?v=5",
    mobileSrc: "/homepage/hero-mobile.png?v=1",
    alt: "Premium commercial towers in a downtown business district",
  },
  {
    src: "/homepage/commercial-hero-3.png?v=5",
    mobileSrc: "/homepage/hero-mobile-2.png?v=1",
    alt: "Glass office towers around a landscaped commercial plaza",
  },
  {
    src: "/homepage/commercial-hero-2.png?v=5",
    mobileSrc: "/homepage/hero-mobile-3.png?v=1",
    alt: "Mixed-use commercial boulevard with offices and retail podiums",
  },
  {
    src: "/homepage/commercial-hero-4.png?v=5",
    mobileSrc: "/homepage/hero-mobile-4.png?v=1",
    alt: "Contemporary property exterior in a landscaped setting",
  },
];

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

export function LogoMark() {
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

export default async function Home() {
  const [featuredListings, listings] = await Promise.all([
    listFeaturedListings(),
    listListings(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--theme-surface)] text-[#111827]">
      <HeroCarousel slides={heroSlides}>
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <a className="flex items-center gap-2.5 font-bold tracking-tight" href="#">
            <span className="brand-logo-wrapper">
              <BrandLogo className="brand-logo-image" priority />
            </span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="ml-auto mr-8 hidden items-center gap-8 text-base font-bold text-white/86 md:flex"
          >
            {navItems.map((item) => (
              <a
                className="transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:text-white hover:drop-shadow-[0_4px_8px_rgba(255,255,255,0.2)]"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <MobileMenu items={navItems} />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex max-w-6xl px-5 pb-12 pt-8 sm:px-8 md:pb-16 md:pt-10">
          <div className="max-w-[470px]">
            <h1 className="text-[clamp(2rem,4vw,3.8rem)] font-black leading-[0.98] tracking-normal text-white drop-shadow-[0_7px_18px_rgba(0,0,0,0.34)]">
              Linking You To Your Dream Properties
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/78 md:text-base">
              At Homelinq Properties, we are dedicated to turning your property dreams into reality.
            </p>
            <QuickSearchModal variant="hero" />
            <a
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-6 text-sm font-bold text-white shadow-xl shadow-black/25 transition hover:bg-[var(--theme-primary-hover)]"
              href="/explore"
            >
              Explore
              <ChevronIcon />
            </a>
          </div>
        </div>
      </HeroCarousel>

      {/* <section
        aria-label="Search properties"
        className="relative z-20 mx-auto -mt-20 max-w-5xl px-5 sm:px-8"
      >
        <div className="rounded-[28px] bg-white/94 p-4 shadow-[0_24px_60px_rgba(21,33,52,0.16)] ring-1 ring-slate-200/80 backdrop-blur">
          <form className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="property-search">
              Search property location
            </label>
            <div className="flex min-h-14 flex-1 items-center gap-3 rounded-full bg-white px-5 shadow-inner ring-1 ring-slate-200">
              <SearchIcon className="h-5 w-5 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                id="property-search"
                placeholder="Search city, address, neighborhood"
                type="search"
              />
            </div>
            <button className="h-14 rounded-full bg-[var(--theme-primary)] px-8 text-sm font-bold text-white shadow-lg shadow-[var(--theme-primary)]/25 transition hover:bg-[var(--theme-primary-hover)]">
              Search Now
            </button>
          </form>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {filters.map((filter) => (
              <button
                className="flex min-h-20 items-center gap-3 rounded-xl bg-[#f1f4f8] px-4 text-left transition hover:bg-[#e9eef6]"
                key={filter.label}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#183866] text-white">
                  <ChevronIcon className="h-3 w-3" />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-normal text-slate-400">
                    {filter.eyebrow}
                  </span>
                  <span className="block text-sm font-black text-slate-950">
                    {filter.label}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section> */}

      <section
        className="mx-auto max-w-5xl px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24"
        id="listings"
      >
        <h2 className="max-w-2xl text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
          Find the perfect property with ease
        </h2>
        <div className="mt-8 grid gap-7 md:grid-cols-3">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.title} listing={listing} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <a
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-7 text-sm font-bold text-white shadow-lg shadow-[var(--theme-primary)]/20 transition hover:bg-[var(--theme-primary-hover)]"
            href="/explore"
          >
            Explore all listings
            <ChevronIcon />
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <div className="grid overflow-hidden rounded-[34px] bg-white shadow-[0_22px_54px_rgba(21,33,52,0.12)] ring-1 ring-slate-200/70 md:grid-cols-[1.15fr_1fr]">
          <div className="relative min-h-[300px] md:min-h-[360px]">
            <Image
              alt="Commercial office and retail buildings near an urban street"
              className="object-cover"
              fill
              sizes="(min-width: 768px) 44vw, 90vw"
              src="/homepage/find-house-card.png"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <h2 className="text-3xl font-black leading-tight tracking-normal text-slate-950 md:text-4xl">
              Looking For Afordable Homes & Properties Near You?
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Compare neighborhood demand, lease terms, and space quality with
              a local portfolio built for serious commercial searches.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-5 text-sm">
              <div>
                <dt className="font-semibold text-slate-400">Available now</dt>
                <dd className="mt-1 text-xl font-black text-slate-950">
                  {listings.length}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-400">Primary areas</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {["East Legon", "Kwabenya", "Ogbojo", "Adjiringanor"].map(
                    (area) => (
                      <span
                        className="rounded-full bg-[var(--theme-spring)] px-3 py-1.5 text-xs font-black text-[#183866]"
                        key={area}
                      >
                        {area}
                      </span>
                    ),
                  )}
                </dd>
              </div>
            </dl>
            <QuickSearchModal variant="find" />
          </div>
        </div>
      </section>
    </main>
  );
}

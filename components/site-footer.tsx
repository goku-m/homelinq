import Link from "next/link";

function LogoMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--theme-muted-teal)] shadow-sm">
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

function SocialIcon({ label }: { label: string }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-xs font-black text-white transition hover:border-white/60 hover:bg-white/10">
      {label}
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[var(--theme-ink)] text-white">
      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:gap-10">
        <div className="border-white/12 md:border-r md:pr-10">
          <Link className="inline-flex items-center gap-3 font-bold" href="/">
            <LogoMark />
            <span className="text-xl">HomeLinq</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/68">
            Linking clients to commercial spaces, homes, and investment-ready
            properties with clear local guidance.
          </p>

          <nav className="mt-6 grid gap-2 text-sm font-semibold text-white/76">
            <Link className="transition hover:text-white" href="/explore">
              Listings
            </Link>
            <Link className="transition hover:text-white" href="/explore?category=Sale">
              For Sale
            </Link>
            <Link className="transition hover:text-white" href="/explore?category=Rent&includeLease=true">
              For Rent
            </Link>
            <Link className="transition hover:text-white" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="mt-6 flex gap-3" aria-label="Social media handles">
            <a aria-label="Facebook @homelinqproperties" href="#">
              <SocialIcon label="f" />
            </a>
            <a aria-label="Instagram @homelinqproperties" href="#">
              <SocialIcon label="ig" />
            </a>
            <a aria-label="LinkedIn @homelinqproperties" href="#">
              <SocialIcon label="in" />
            </a>
          </div>

        </div>

        <div className="md:px-10">
          <div className="grid gap-8 sm:grid-cols-[1fr_0.7fr]">
            <div>
              <h2 className="text-xl font-black tracking-normal">Contact details</h2>
              <div className="mt-5 grid gap-3 text-sm text-white/72">
                <p>
                  <span className="font-black text-white">Email:</span>{" "}
                  info@homelinqproperties.com
                </p>
                <div>
                  <p className="font-black text-white">Contacts</p>
                  <p className="mt-1">+233 54 100 0010</p>
                </div>
                <div>
                  <p className="font-black text-white">Location</p>
                  <p className="mt-1">Accra, Ghana</p>
                  <p>East Legon</p>
                </div>
              </div>

            </div>

            <div className="border-white/12 sm:border-l sm:pl-8">
              <h2 className="text-xl font-black  tracking-normal text-white">
                Services
              </h2>
              <ul className="mt-5 grid gap-2 text-sm font-semibold text-white/72">
                <li>Property Management</li>
                <li>Import</li>
                <li>Brokerage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-xs font-semibold text-white/54 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HomeLinq Properties. All rights reserved.</p>
          <div className="flex gap-5">
            <Link className="transition hover:text-white" href="/#">
              Privacy Policy
            </Link>
            <Link className="transition hover:text-white" href="/#">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

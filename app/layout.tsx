import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://homelinqproperties.com"),
  title: {
    default: "HomeLinq Properties | Homes and Properties in Ghana",
    template: "%s | HomeLinq Properties",
  },
  description:
    "Discover homes, apartments, offices, shops, land, and commercial properties for sale, rent, and lease in Ghana.",
  keywords: [
    "properties in Ghana",
    "houses for sale in Accra",
    "houses for rent in Ghana",
    "commercial properties in Accra",
    "HomeLinq Properties",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: "HomeLinq Properties",
    title: "HomeLinq Properties | Homes and Properties in Ghana",
    description:
      "Find homes, commercial spaces, offices, shops, and land across Ghana.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeLinq Properties | Homes and Properties in Ghana",
    description:
      "Find homes, commercial spaces, offices, shops, and land across Ghana.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "HomeLinq Properties",
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://homelinqproperties.com",
              telephone: "+233 54 100 0010",
              email: "info@homelinqproperties.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Accra",
                addressCountry: "GH",
              },
            }),
          }}
          type="application/ld+json"
        />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

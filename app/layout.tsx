import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { Inter } from "next/font/google";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, absoluteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const TITLE = `${SITE_NAME} | India's 1st Performance-Based Mock Platform`;

export const metadata: Metadata = {
  // Required for Google: without metadataBase every relative OG/canonical URL
  // stays relative, and crawlers can't resolve the logo or the canonical page.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "mock test",
    "free mock test",
    "IBPS PO mock test",
    "SBI PO mock test",
    "banking exam preparation",
    "insurance exam mock test",
    "quantitative aptitude",
    "reasoning ability",
    "current affairs",
    SITE_NAME,
  ],
  // Points every page at its own canonical URL, so the site is indexed under
  // the real domain rather than a preview host.
  alternates: { canonical: "/" },
  // Explicitly invite indexing. Left unset, a stray noindex anywhere upstream
  // (a host default, a preview deployment) silently keeps the site out of
  // Google — the single most common cause of "we're not on Google at all".
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/logo.jpeg",
        width: 500,
        height: 500,
        alt: `${SITE_NAME} logo`,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo.jpeg"],
  },
};

// Tells Google which image is the site's logo and which name belongs to the
// domain. This is what populates the logo/name shown beside a search result —
// a favicon alone is not enough, Google needs the Organization markup.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/logo.jpeg"),
  image: absoluteUrl("/logo.jpeg"),
  description: SITE_DESCRIPTION,
  areaServed: "IN",
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-IN",
};

import { QueryProvider } from "@/lib/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={cn("font-sans", inter.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
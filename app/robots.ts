import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Without a robots.txt pointing at the sitemap, Google has to discover every
// page by following links. Auth-gated areas are disallowed: they redirect to
// login for a crawler, so letting them be crawled only burns crawl budget and
// risks thin/duplicate pages in the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard",
        "/results",
        "/purchases",
        "/settings",
        "/inquiries",
        "/tests/",
        "/paid-tests",
        "/leaderboard/",
        "/payment-success",
        "/api/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}

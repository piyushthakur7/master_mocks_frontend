/**
 * Canonical identity of the public site.
 *
 * Every SEO surface (metadataBase, canonical links, Open Graph, robots.txt,
 * sitemap.xml, JSON-LD) reads the domain from here, so switching hosts or
 * moving between the apex and www is a one-line change instead of a hunt.
 *
 * Set NEXT_PUBLIC_SITE_URL in the deployment environment. The fallback is the
 * production domain — it must NOT be a preview URL: Google indexes whatever
 * the canonical tag points at, and pointing it at a vercel.app preview splits
 * ranking between two hosts and can get the real domain treated as a duplicate.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://mastermocks.in"
).replace(/\/+$/, "");

export const SITE_NAME = "Master Mocks";

export const SITE_DESCRIPTION =
  "India's 1st performance-based mock test platform for Banking & Insurance exams. Attempt exam-level mocks, get detailed solutions, and earn cashback rewards on your performance.";

/** Absolute URL for a site-relative path — required by OG tags and JSON-LD. */
export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Only public, crawlable pages belong here — anything behind auth would just
// be a login redirect to a crawler. Keep in sync when adding marketing pages.
const ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/home", priority: 0.9, changeFrequency: "daily" },
  { path: "/mocks", priority: 0.9, changeFrequency: "daily" },

  { path: "/free-mocks", priority: 0.9, changeFrequency: "daily" },
  { path: "/free-mocks/quant", priority: 0.8, changeFrequency: "weekly" },
  { path: "/free-mocks/reasoning", priority: 0.8, changeFrequency: "weekly" },
  { path: "/free-mocks/current-affairs", priority: 0.8, changeFrequency: "daily" },

  { path: "/paid-mocks", priority: 0.8, changeFrequency: "weekly" },
  { path: "/paid-mocks/quant", priority: 0.7, changeFrequency: "weekly" },
  { path: "/paid-mocks/reasoning", priority: 0.7, changeFrequency: "weekly" },
  { path: "/paid-mocks/current-affairs", priority: 0.7, changeFrequency: "daily" },

  { path: "/free-pdfs", priority: 0.8, changeFrequency: "weekly" },
  { path: "/free-pdfs/quant", priority: 0.7, changeFrequency: "weekly" },
  { path: "/free-pdfs/reasoning", priority: 0.7, changeFrequency: "weekly" },
  { path: "/free-pdfs/current-affairs", priority: 0.7, changeFrequency: "daily" },

  { path: "/free-hacks/quant", priority: 0.7, changeFrequency: "weekly" },
  { path: "/free-hacks/reasoning", priority: 0.7, changeFrequency: "weekly" },
  { path: "/free-hacks/current-affairs", priority: 0.7, changeFrequency: "daily" },

  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}

import type { MetadataRoute } from "next";
import { EXAMPLES, resultPath } from "@/lib/share";

const SITE_URL = "https://japan-hsp-points.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...EXAMPLES.map((e, i) => ({ url: `${SITE_URL}${resultPath(e).replace(/&/g, "&amp;")}`, lastModified: now, changeFrequency: "monthly" as const, priority: i === 0 ? 0.7 : 0.6 })),
    { url: `${SITE_URL}/legal/disclaimer`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}

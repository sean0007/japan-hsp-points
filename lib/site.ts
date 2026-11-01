export const SITE_NAME = "Japan HSP Points Calculator";

export const SITE_TAGLINE =
  "Do I reach 70 or 80 points for Japan's Highly Skilled Professional visa (高度専門職)? Item-by-item breakdown for academic, specialized and management categories, the ¥3M salary floor, the permanent-residence fast track (70 → 3 years, 80 → 1 year), J-Skip and the bonus points you could still add.";

export const DISCLAIMER_SHORT = "Educational points calculator, not immigration or legal advice, not affiliated with the Immigration Services Agency of Japan. ISA decides; every point needs documents.";

export const HONESTY =
  "Rules as of 2026-10-30 from the HSP points ordinance (平成26年法務省令第37号, e-Gov), the ISA points table, the J-Skip ordinance and the PR guideline. A revision of the criteria is planned within FY2026; nothing has been published yet. It only scores what you enter.";

export const SIBLING_TOOLS = [
  { href: "https://japan-pr-check.vercel.app", label: "Japan PR Guideline Check" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee Calculator" },
  { href: "https://japan-reentry-check.vercel.app", label: "Japan Re-entry Deadline Check" },
  { href: "https://japan-mynumber-card-check.vercel.app", label: "Japan My Number Card Check" },
  { href: "https://japan-pet-quarantine.vercel.app", label: "Japan Pet Quarantine Check" },
  { href: "https://japan-overseas-dependents.vercel.app", label: "Japan Overseas Dependents Check" },
  { href: "https://japan-parttime-check.vercel.app", label: "Japan Part-time Work Check" },
  { href: "https://japan-driving-check.vercel.app", label: "Japan Driving Check" },
  { href: "https://house-rules-check.vercel.app", label: "House Rules Check" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://japan-hsp-points.vercel.app";
}

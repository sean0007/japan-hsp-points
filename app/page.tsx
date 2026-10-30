import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { SOURCES } from "@/lib/hsp";
import { EXAMPLE_80, EXAMPLE_ACADEMIC, EXAMPLE_MANAGER, EXAMPLE_SHARED, PUBLIC_URL, resultPath } from "@/lib/share";

const title = "Japan HSP points calculator (高度人材ポイント計算): do I reach 70 or 80 points?";
const description =
  "Free Highly Skilled Professional (高度専門職) points calculator for Japan: academic, specialized and management categories, item-by-item breakdown, the age-banded salary rules, the ¥3M floor, the 70 → 3-year and 80 → 1-year permanent-residence fast track, J-Skip and the bonus points you could still add (N1, Japanese degree, innovation employer…). Free JSON API for AI agents. Rules as of 2026-10-30; educational, not immigration advice.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Japan HSP Points Calculator",
  alternateName: ["高度人材ポイント計算", "高度専門職 ポイント 計算 シミュレーション", "Japan Highly Skilled Professional visa points calculator"],
  url: PUBLIC_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: ["en", "ja"],
  description: "Unofficial, free calculator for Japan's Highly Skilled Professional points system (高度人材ポイント制) with permanent-residence fast-track and J-Skip checks and a keyless JSON API. Not affiliated with the Immigration Services Agency of Japan.",
};

const faq: FaqItem[] = [
  {
    q: "Is there a free calculator for Japan's Highly Skilled Professional (HSP) points?",
    a: `Yes, this one: a free, unofficial HSP points calculator. Pick your category (academic, specialized/technical or business management), enter your age, expected salary, degree, experience and Japanese level, tick the bonus items, and it shows your total, an item-by-item breakdown with the ordinance basis, how many points you need for 70 and 80, the permanent-residence fast-track timing, J-Skip and which bonus points you could still add. AI agents can call ${PUBLIC_URL}/api/check. Not affiliated with ISA; not immigration advice.`,
  },
  {
    q: "How many points do I need for the HSP visa?",
    a: "70 points in your category (高度専門職1号イ academic, ロ specialized/technical or ハ business management). Specialized and management also need an expected annual salary of at least ¥3,000,000 regardless of points. With 70 points you can apply for permanent residence after 3 years; with 80 points after 1 year.",
  },
  {
    q: "Why do I get 0 salary points even though I earn ¥5.5 million?",
    a: "For academic and specialized, the lowest salary that scores depends on your age on the application date: under 30 from ¥4M (10 points), 30–34 from ¥5M, 35–39 from ¥6M, 40 and over from ¥8M. So ¥5.5M scores 15 at age 34 but 0 at 35. Salary means expected annual pay from the Japanese employer (plus any foreign sending company), including bonuses, not your past income. Management uses its own table from ¥10M (10) to ¥30M+ (50), with no age limit.",
  },
  {
    q: "Do JLPT N2 and a Japanese university degree both count?",
    a: "Not together. N2 (or BJT 400+) gives 10 only if you get neither the Japanese-university bonus (10) nor N1. N1 (or BJT 480+, or graduating from a foreign university with a Japanese major) gives 15 and does stack with the Japanese-degree bonus, so a Japanese master's graduate with N1 gets 10 + 15 = 25 bonus points.",
  },
  {
    q: "How fast can I get permanent residence with HSP points?",
    a: "Under the PR guideline, 80+ points: after 1 year of continuous residence, if you also had 80+ points 1 year before you apply. 70+ points: after 3 years, if you also had 70+ points 3 years before. J-Skip holders: 1 year. You do not need to hold the HSP visa itself; the points can be counted at application and as of 1 or 3 years earlier. Below 70 the general 10-year rule applies. For the other PR requirements (tax, pension, health insurance), see the Japan PR Guideline Check.",
  },
  {
    q: "What is J-Skip (特別高度人材) and do I need points?",
    a: "Since April 2023, J-Skip gives HSP status without points if: academic or specialized, a master's degree or higher and an annual salary of ¥20M+, or 10+ years' experience in the work and ¥20M+; management, 5+ years of business management experience and ¥40M+. It adds wider benefits, HSP (ii) after 1 year and PR after 1 year. The calculator flags it when your numbers meet the rule.",
  },
  {
    q: "Which bonus points are easiest to add?",
    a: "Often: JLPT N1 (15) or N2 (10), a degree from a Japanese university (10), an employer that receives a listed innovation-support measure (10, or 20 if it is an SME), a designated top university (10), an employer supported by a local government (10), and for specialized two related Japanese national qualifications or ISA-listed IT exams (10). Each one needs official proof; your employer or ISA can confirm whether it is on the published lists.",
  },
  {
    q: "Are the HSP points rules changing?",
    a: "Probably. In August 2026 the Ministry of Justice was reported to plan a revision of the HSP criteria by ministerial ordinance within FY2026 (by March 2027): higher salary thresholds, some items dropped and faster review. No draft or public comment had been published as of 2026-10-30, so this calculator applies the ordinance in force today (平成26年法務省令第37号) and will be updated when the new rules are published. In late October 2026 police also made arrests over HSP applications with false information: every point has to be proved with real documents.",
  },
  {
    q: "Is there a free API or MCP tool for AI agents?",
    a: `Yes. GET or POST ${PUBLIC_URL}/api/check?category=specialized&age=31&education=master&experienceYears=4&annualSalary=7500000&japanese=n2&qualifications=1 (keyless, CORS open), rules at /api/rules, OpenAPI at /openapi.json, llms.txt, and the MCP tool japan_hsp_points_check on free-agent-tools.vercel.app/mcp. Every response carries rulesAsOf, sources, the pending-revision note and a disclaimer.`,
  },
  {
    q: "高度人材ポイントは何点必要ですか？",
    a: "高度専門職1号イ（学術研究）・ロ（専門・技術）・ハ（経営・管理）のいずれかで70点以上です。ロ・ハは年収300万円以上も必要です。70点以上なら3年、80点以上なら1年の在留で永住許可申請の対象になります（申請時と3年前・1年前の両方で点数を満たすこと）。年収点は年齢で下限が変わり、30歳未満400万円、30〜34歳500万円、35〜39歳600万円、40歳以上800万円からです。",
  },
  {
    q: "日本語能力試験N2と日本の大学卒業の加点は両方もらえますか？",
    a: "もらえません。N2（BJT400点以上）の10点は、本邦大学卒業（10点）またはN1（15点）に該当しない場合のみです。N1は本邦大学卒業と併せて加点されます。2026年度内に省令改正（年収基準の引上げ等）が予定されていますが、2026年10月30日時点で案は未公表です。",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · 高度専門職 · ポイント計算</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Do I reach 70 HSP points?</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          Yes, this is a free calculator for Japan&apos;s Highly Skilled Professional points (高度人材ポイント制). Score your profile item by item, see how far you are from <strong>70</strong> (the visa) and <strong>80</strong> (permanent residence after 1 year instead of 3), why a salary that scored at 34 can score zero at 35, whether J-Skip applies, and which bonus points you could still add.
        </p>
        <p className="mt-3 text-sm text-muted">
          Examples:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            engineer, 31, ¥7.5M
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_80)}>
            Japanese master&apos;s + N1 = 80
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_ACADEMIC)}>
            researcher with a PhD
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_MANAGER)}>
            CEO with an MBA
          </a>
        </p>
      </section>

      <section className="mt-8">
        <Calculator />
      </section>

      <section className="mt-16 max-w-5xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">The points table in short</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Academic (イ)</th>
                <th className="px-4 py-3 font-medium">Specialized (ロ)</th>
                <th className="px-4 py-3 font-medium">Management (ハ)</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Education</td><td className="px-4 py-3">PhD 30 · master 20 · bachelor 10</td><td className="px-4 py-3">PhD 30 · MBA/MOT 25 · master 20 · bachelor 10</td><td className="px-4 py-3">MBA/MOT 25 · PhD/master 20 · bachelor 10</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Experience</td><td className="px-4 py-3">7y 15 · 5y 10 · 3y 5</td><td className="px-4 py-3">10y 20 · 7y 15 · 5y 10 · 3y 5</td><td className="px-4 py-3">10y 25 · 7y 20 · 5y 15 · 3y 10</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Salary</td><td className="px-4 py-3" colSpan={2}>¥10M 40 … ¥4M 10; counts from ¥4M (&lt;30), ¥5M (30–34), ¥6M (35–39), ¥8M (40+)</td><td className="px-4 py-3">¥30M 50 · ¥25M 40 · ¥20M 30 · ¥15M 20 · ¥10M 10</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Age</td><td className="px-4 py-3" colSpan={2}>&lt;30 15 · 30–34 10 · 35–39 5</td><td className="px-4 py-3">—</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Research / licences / position</td><td className="px-4 py-3">Research 20 (2+ kinds 25)</td><td className="px-4 py-3">Research 15 · JP qualifications 5 / 10</td><td className="px-4 py-3">Representative 10 · officer 5</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Bonuses (all)</td><td className="px-4 py-3" colSpan={3}>Innovation employer 10 (SME 20) · SME R&amp;D &gt;3% 5 · foreign qualification 5 · Japanese degree 10 · N1 15 / N2 10 · growth project 10 · top university 10 · JICA 5 · local-gov support 10 · investment management 10 (ロ, ハ) · ¥100M investment 5 (ハ)</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Pass line</td><td className="px-4 py-3">70</td><td className="px-4 py-3">70 + salary ≥ ¥3M</td><td className="px-4 py-3">70 + salary ≥ ¥3M</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">
          Official pages:{" "}
          {SOURCES.map((s, i) => (
            <span key={s}>
              {i ? " · " : ""}
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s.replace("https://", "").replace("www.", "").slice(0, 60)}
              </a>
            </span>
          ))}
        </p>
      </section>

      <section className="mt-12 max-w-3xl rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">For AI agents and developers</h2>
        <p className="mt-2 text-sm text-muted">
          Keyless JSON, CORS open, GET or POST:{" "}
          <a className="font-mono text-foreground underline underline-offset-2 break-all" href="/api/check?category=specialized&age=31&education=master&experienceYears=4&annualSalary=7500000&japanese=n2&qualifications=1">
            /api/check?category=specialized&amp;age=31&amp;education=master&amp;experienceYears=4&amp;annualSalary=7500000&amp;japanese=n2&amp;qualifications=1
          </a>
          . Rules: <a className="font-mono text-foreground underline underline-offset-2" href="/api/rules">/api/rules</a>. Docs: <a className="underline underline-offset-2" href="/openapi.json">OpenAPI</a>,{" "}
          <a className="underline underline-offset-2" href="/llms.txt">llms.txt</a>, MCP tool <span className="font-mono text-foreground">japan_hsp_points_check</span> on{" "}
          <a className="underline underline-offset-2" href="https://free-agent-tools.vercel.app" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
      </section>

      <FaqSection items={faq} heading="HSP points questions" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}

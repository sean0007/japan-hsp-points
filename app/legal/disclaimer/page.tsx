import type { Metadata } from "next";
import { PENDING_REVISION, RULES_AS_OF, SOURCES } from "@/lib/hsp";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational points calculator. It applies a dated reading (as of {RULES_AS_OF}) of the ministerial ordinance on the Highly Skilled Professional criteria (出入国管理及び難民認定法別表第一の二の表の高度専門職の項の下欄の基準を定める省令, 平成26年法務省令第37号, art. 1 and 2), the Immigration Services Agency&apos;s points table and evaluation page, the 特別加算 notice, the J-Skip ordinance (令和5年法務省令第25号) and the permanent-residence guideline to the answers you give.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it is not</h2>
          <p className="mt-2">
            It is not immigration or legal advice and is not affiliated with the Immigration Services Agency of Japan, the Ministry of Justice or any embassy. It cannot check your documents, whether your employer is on the innovation-support or local-government lists, whether your university is a designated one, or whether ISA will accept a research achievement or qualification. ISA decides every item, each point needs documentary proof, and the permanent-residence fast track also needs the general PR requirements (good conduct, taxes, pension and health insurance paid on time). Submitting false information is a crime. Ask ISA (外国人在留総合インフォメーションセンター, 0570-013904) or a licensed 行政書士 / lawyer for your case.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Pending revision</h2>
          <p className="mt-2">{PENDING_REVISION}</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">How points are counted</h2>
          <p className="mt-2">
            Age is your age on the application date. Salary is the expected annual pay from the Japanese employer (and a foreign sending company, for transfers) for the HSP activity, including bonuses, not past income. For academic and specialized, the salary brackets that count depend on age (under 30 from ¥4M, 30–34 from ¥5M, 35–39 from ¥6M, 40+ from ¥8M). Only the highest education level counts, plus 5 for degrees in several fields. N2 counts only if neither N1 nor the Japanese-degree bonus applies.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">What you enter stays in your browser (or in a share link you create). No login, no names, no passport or residence-card numbers, no database.</p>
        </section>
      </div>
    </div>
  );
}

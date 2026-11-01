"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import { CATEGORIES, CATEGORY_LABEL, EDUCATION, EDUCATION_LABEL, type Category, type Education, type JapaneseLevel, type Position } from "@/lib/hsp";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, safeCheck, type FlagName, type Shared } from "@/lib/share";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";

const VERDICT_STYLE: Record<string, string> = {
  qualifies_80: "text-teal-200",
  qualifies_70: "text-teal-200",
  below_70: "text-amber-200",
  below_salary_floor: "text-red-300",
};
const VERDICT_LABEL: Record<string, string> = {
  qualifies_80: "80+ · 1-year PR track",
  qualifies_70: "70+ · qualifies",
  below_70: "Below 70",
  below_salary_floor: "Salary below ¥3M",
};

type Flag = { key: FlagName; label: string; only?: Category[]; not?: Category[] };
const FLAG_LIST: Flag[] = [
  { key: "japaneseDegree", label: "Degree from a Japanese university or graduate school (+10)" },
  { key: "topUniversity", label: "Degree from a designated top university (top 300 in 2 rankings, Top Global University…) (+10)" },
  { key: "multipleDegrees", label: "Doctor / master / professional degrees in two or more fields (+5)" },
  { key: "innovationSupport", label: "Employer receives an innovation-support measure (+10)" },
  { key: "sme", label: "Employer is a small or medium enterprise (makes innovation support +20)" },
  { key: "smeResearch3pct", label: "SME employer spending over 3% of revenue on R&D (+5)" },
  { key: "foreignQualification", label: "Work-related foreign qualification or award (+5)" },
  { key: "growthProject", label: "Ministry-certified advanced project in a growth field (+10)" },
  { key: "localGovSupport", label: "Employer supported by a local government for hiring highly skilled foreigners (+10)" },
  { key: "jicaTraining", label: "Completed JICA Innovative Asia training (+5)" },
  { key: "investmentManagement", label: "Investment-management (financial) work (+10)", not: ["academic"] },
  { key: "personalInvestment100m", label: "I invest ¥100M or more in the business (+5)", only: ["management"] },
];

export function Calculator({ initial }: { initial?: Shared }) {
  const start = initial ?? EXAMPLE_SHARED;
  const [category, setCategory] = useState<Category>(start.category);
  const [age, setAge] = useState(start.age === null ? "" : String(start.age));
  const [education, setEducation] = useState<Education>(start.education);
  const [exp, setExp] = useState(String(start.experienceYears));
  const [salaryMan, setSalaryMan] = useState(String(Math.round(start.annualSalaryYen / 10_000)));
  const [japanese, setJapanese] = useState<JapaneseLevel>(start.japanese);
  const [quals, setQuals] = useState(String(start.qualifications));
  const [research, setResearch] = useState(String(start.researchItems));
  const [position, setPosition] = useState<Position>(start.position);
  const [flags, setFlags] = useState<FlagName[]>(start.flags);

  const ageN = age.trim() === "" ? null : Number(age);
  const salaryN = Number(salaryMan) * 10_000;
  const visible = FLAG_LIST.filter((f) => (!f.only || f.only.includes(category)) && (!f.not || !f.not.includes(category)));
  const shared: Shared = {
    category,
    age: ageN !== null && Number.isFinite(ageN) ? Math.floor(ageN) : null,
    education,
    experienceYears: Math.max(0, Math.floor(Number(exp) || 0)),
    annualSalaryYen: Number.isFinite(salaryN) && salaryN >= 0 ? salaryN : 0,
    japanese,
    qualifications: category === "specialized" ? Math.max(0, Math.floor(Number(quals) || 0)) : 0,
    researchItems: category === "management" ? 0 : Math.min(4, Math.max(0, Math.floor(Number(research) || 0))),
    position: category === "management" ? position : "none",
    flags: flags.filter((f) => visible.some((v) => v.key === f)),
  };
  const r = safeCheck(shared);
  const shareUrl = `${PUBLIC_URL}${resultPath(shared)}`;
  const toggle = (k: FlagName) => setFlags((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-7">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your profile</p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Category (what you will do in Japan)</span>
          <select data-testid="category" className={field} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c].en} · {CATEGORY_LABEL[c].code}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {category !== "management" ? (
            <label className="block">
              <span className="text-sm font-medium text-foreground">Age on the application date</span>
              <input data-testid="age" type="number" min={15} max={100} className={field} value={age} onChange={(e) => setAge(e.target.value)} />
            </label>
          ) : null}
          <label className="block">
            <span className="text-sm font-medium text-foreground">Expected annual pay in Japan (万円, incl. bonus)</span>
            <input data-testid="salary" type="number" min={0} step={10} className={field} value={salaryMan} onChange={(e) => setSalaryMan(e.target.value)} />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Highest degree</span>
          <select data-testid="education" className={field} value={education} onChange={(e) => setEducation(e.target.value as Education)}>
            {EDUCATION.map((ed) => (
              <option key={ed} value={ed}>
                {EDUCATION_LABEL[ed]}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">
            Years of experience {category === "academic" ? "in research / teaching" : category === "specialized" ? "in the work you will do" : "in business management"}
          </span>
          <input data-testid="exp" type="number" min={0} max={70} className={field} value={exp} onChange={(e) => setExp(e.target.value)} />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Japanese</span>
          <select data-testid="japanese" className={field} value={japanese} onChange={(e) => setJapanese(e.target.value as JapaneseLevel)}>
            <option value="none">No JLPT N1 / N2</option>
            <option value="n2">JLPT N2 or BJT 400+</option>
            <option value="n1">JLPT N1, BJT 480+ or a Japanese major abroad</option>
          </select>
        </label>
        {category !== "management" ? (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-foreground">Kinds of research achievement (patent, 3+ foreign-government grants, 3+ papers as corresponding author, other)</span>
            <select className={field} value={research} onChange={(e) => setResearch(e.target.value)}>
              <option value="0">None</option>
              <option value="1">One kind</option>
              <option value="2">Two or more kinds</option>
            </select>
          </label>
        ) : null}
        {category === "specialized" ? (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-foreground">Japanese national qualifications / ISA-listed IT exams related to the work</span>
            <select className={field} value={quals} onChange={(e) => setQuals(e.target.value)}>
              <option value="0">None</option>
              <option value="1">One</option>
              <option value="2">Two or more</option>
            </select>
          </label>
        ) : null}
        {category === "management" ? (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-foreground">Position</span>
            <select className={field} value={position} onChange={(e) => setPosition(e.target.value as Position)}>
              <option value="none">Other</option>
              <option value="representative">Representative director / representative executive officer</option>
              <option value="officer">Director or executive officer</option>
            </select>
          </label>
        ) : null}
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-foreground">Bonus points</legend>
          <div className="mt-2 space-y-2">
            {visible.map((f) => (
              <label key={f.key} className="flex items-start gap-2 text-sm text-muted">
                <input type="checkbox" className="mt-1" checked={flags.includes(f.key)} onChange={() => toggle(f.key)} />
                <span>{f.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="p-5 sm:p-7" data-testid="result">
          {r ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">{r.jSkip.eligible && r.verdict !== "qualifies_80" ? "J-Skip may apply · " : ""}{VERDICT_LABEL[r.verdict]} · {r.statusCode}</p>
              <p className={`mt-2 font-display text-6xl tracking-tight sm:text-7xl ${VERDICT_STYLE[r.verdict]}`}>
                {r.total} <span className="text-2xl text-muted">points</span>
              </p>
              <p className="mt-3 text-base text-foreground">{r.summary}</p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl border border-line p-3"><dt className="text-muted">To 70</dt><dd className="font-mono text-foreground">{r.pointsTo70 ? `${r.pointsTo70} more` : "reached"}</dd></div>
                <div className="rounded-2xl border border-line p-3"><dt className="text-muted">To 80</dt><dd className="font-mono text-foreground">{r.pointsTo80 ? `${r.pointsTo80} more` : "reached"}</dd></div>
                <div className="rounded-2xl border border-line p-3"><dt className="text-muted">PR fast track</dt><dd className="font-mono text-foreground">{r.pr.route === "none" ? "—" : `after ${r.pr.residenceNeeded}`}</dd></div>
              </dl>
              <h3 className="mt-6 text-sm font-semibold text-foreground">Breakdown</h3>
              <ul className="mt-2 divide-y divide-line rounded-2xl border border-line text-sm">
                {r.breakdown.map((i) => (
                  <li key={i.item} className="flex items-start justify-between gap-3 px-3 py-2">
                    <span>
                      <span className="text-foreground">{i.item}</span> <span className="text-muted">· {i.itemJa}</span>
                      <span className="block text-xs text-muted">{i.basis}</span>
                    </span>
                    <span className="font-mono text-foreground">+{i.points}</span>
                  </li>
                ))}
                {r.breakdown.length === 0 ? <li className="px-3 py-2 text-muted">No points yet.</li> : null}
              </ul>
              {r.jSkip.eligible ? (
                <div className="mt-4 rounded-2xl border border-teal-300/30 bg-teal-300/5 p-4 text-sm text-teal-100">
                  <p className="font-semibold">J-Skip (特別高度人材) may apply</p>
                  <p className="mt-1 leading-relaxed">{r.jSkip.note}</p>
                </div>
              ) : null}
              <p className="mt-4 text-sm leading-relaxed text-muted">{r.pr.note}</p>
              {r.couldAdd.length && r.verdict !== "qualifies_80" ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">Points you could still add</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                    {r.couldAdd.map((m) => (
                      <li key={m.item}>
                        <span className="text-foreground">+{m.points} {m.item}</span>: {m.how}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {r.warnings.length ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">Watch out</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                    {r.warnings.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p className="mt-4 rounded-2xl border border-amber/30 bg-amber/5 p-3 text-xs leading-relaxed text-amber-100">{r.pendingRevision}</p>
              <div className="mt-6">
                <ShareBar url={shareUrl} text={`Japan HSP points: ${r.total} (${r.statusCode})`} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Enter {category !== "management" ? "your age, " : ""}your expected salary and your degree to see your points.</p>
          )}
        </div>
        <CardDisclaimer />
      </div>
    </div>
  );
}

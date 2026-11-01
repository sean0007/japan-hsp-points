// Japan Highly Skilled Professional (高度専門職) points calculator.
// Source: 出入国管理及び難民認定法別表第一の二の表の高度専門職の項の下欄の基準を定める省令
// (平成26年法務省令第37号, e-Gov 426M60000010037, revision 2024-06-10) art. 1 (HSP i) and art. 2 (HSP ii),
// the ISA points table (EN/JA) and evaluation-items page, the 特別加算 notice (revised 2026-03-31),
// the 特別高度人材の基準を定める省令 (令和5年法務省令第25号, J-Skip) and the PR guideline (fast track for HSP).

export const RULES_AS_OF = "2026-10-30";

export const CATEGORIES = ["academic", "specialized", "management"] as const;
export type Category = (typeof CATEGORIES)[number];
export const EDUCATION = ["doctor", "mba", "master", "bachelor", "none"] as const;
export type Education = (typeof EDUCATION)[number];
export const JAPANESE = ["n1", "n2", "none"] as const;
export type JapaneseLevel = (typeof JAPANESE)[number];
export const POSITIONS = ["representative", "officer", "none"] as const;
export type Position = (typeof POSITIONS)[number];

export const CATEGORY_LABEL: Record<Category, { en: string; ja: string; code: string }> = {
  academic: { en: "Advanced academic research (HSP i-a)", ja: "高度学術研究活動", code: "高度専門職1号イ" },
  specialized: { en: "Advanced specialized / technical (HSP i-b)", ja: "高度専門・技術活動", code: "高度専門職1号ロ" },
  management: { en: "Advanced business management (HSP i-c)", ja: "高度経営・管理活動", code: "高度専門職1号ハ" },
};

export const EDUCATION_LABEL: Record<Education, string> = {
  doctor: "Doctoral degree (博士)",
  mba: "MBA / MOT professional degree (経営管理に関する専門職学位)",
  master: "Master's or professional degree (修士・専門職)",
  bachelor: "Bachelor's or equivalent (大卒・同等以上)",
  none: "No university degree",
};

export const SOURCES = [
  "https://laws.e-gov.go.jp/law/426M60000010037",
  "https://www.moj.go.jp/isa/applications/resources/newimmiact_3_evaluate_index.html",
  "https://www.moj.go.jp/isa/content/001398882.pdf",
  "https://www.moj.go.jp/isa/content/930001665.pdf",
  "https://www.moj.go.jp/isa/applications/resources/nyuukokukanri01_00009.html",
  "https://laws.e-gov.go.jp/law/505M60000010025",
  "https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan50.html",
] as const;

export const DISCLAIMER =
  "Educational points calculator, not immigration or legal advice, not affiliated with the Immigration Services Agency of Japan (ISA) or the Ministry of Justice. ISA decides how each item is proved and counted; every point needs documents. Rules as of 2026-10-30: the Ministry of Justice has said it will revise the HSP criteria (salary thresholds, some items) within FY2026, so re-check before applying.";

export const PENDING_REVISION =
  "Pending change: in August 2026 the Ministry of Justice was reported (Nikkei, 2026-08-14) to plan a ministerial-ordinance revision of the HSP points criteria within FY2026 (by March 2027), raising salary thresholds and dropping some items. No draft or public comment had been published as of 2026-10-30. This calculator applies the ordinance in force today.";

export class RuleInputError extends Error {}

export type CheckInput = {
  category: Category;
  age: number | null;
  education: Education;
  multipleDegrees?: boolean;
  experienceYears: number;
  annualSalaryYen: number;
  researchItems?: number;
  qualifications?: number;
  position?: Position;
  innovationSupport?: boolean;
  sme?: boolean;
  smeResearch3pct?: boolean;
  foreignQualification?: boolean;
  japaneseDegree?: boolean;
  japanese?: JapaneseLevel;
  growthProject?: boolean;
  topUniversity?: boolean;
  jicaTraining?: boolean;
  personalInvestment100m?: boolean;
  investmentManagement?: boolean;
  localGovSupport?: boolean;
};

export type Item = { item: string; itemJa: string; points: number; basis: string };
export type Missed = { item: string; points: number; how: string };
export type Verdict = "qualifies_80" | "qualifies_70" | "below_70" | "below_salary_floor";

export type CheckResult = {
  category: Category;
  categoryLabel: string;
  statusCode: string;
  total: number;
  threshold: number;
  verdict: Verdict;
  summary: string;
  breakdown: Item[];
  pointsTo70: number;
  pointsTo80: number;
  salaryFloor: { applies: boolean; minimumYen: number; ok: boolean };
  pr: { route: "hsp80" | "hsp70" | "none"; residenceNeeded: string; note: string };
  hsp2: string;
  jSkip: { eligible: boolean; rule: string; note: string };
  couldAdd: Missed[];
  warnings: string[];
  pendingRevision: string;
  rulesAsOf: string;
  sources: readonly string[];
};

const M = 10_000; // 1 万円

/** Salary points for HSP i-a / i-b by age band (ordinance art. 1(1)(i)ハ / (ii)ハ). */
const SALARY_AB: { min: number; pts: number }[] = [
  { min: 1000 * M, pts: 40 },
  { min: 900 * M, pts: 35 },
  { min: 800 * M, pts: 30 },
  { min: 700 * M, pts: 25 },
  { min: 600 * M, pts: 20 },
  { min: 500 * M, pts: 15 },
  { min: 400 * M, pts: 10 },
];
const SALARY_C: { min: number; pts: number }[] = [
  { min: 3000 * M, pts: 50 },
  { min: 2500 * M, pts: 40 },
  { min: 2000 * M, pts: 30 },
  { min: 1500 * M, pts: 20 },
  { min: 1000 * M, pts: 10 },
];

/** Lowest salary bracket that counts for an age (HSP i-a / i-b). */
export function salaryMinForAge(age: number): number {
  if (age < 30) return 400 * M;
  if (age < 35) return 500 * M;
  if (age < 40) return 600 * M;
  return 800 * M;
}

function agePoints(age: number): number {
  if (age < 30) return 15;
  if (age < 35) return 10;
  if (age < 40) return 5;
  return 0;
}

function yen(n: number): string {
  return `¥${Math.round(n).toLocaleString("en-US")}`;
}

function educationPoints(cat: Category, ed: Education): number {
  if (cat === "academic") return { doctor: 30, mba: 20, master: 20, bachelor: 10, none: 0 }[ed];
  if (cat === "specialized") return { doctor: 30, mba: 25, master: 20, bachelor: 10, none: 0 }[ed];
  return { doctor: 20, mba: 25, master: 20, bachelor: 10, none: 0 }[ed];
}

function experiencePoints(cat: Category, y: number): number {
  if (cat === "academic") return y >= 7 ? 15 : y >= 5 ? 10 : y >= 3 ? 5 : 0;
  if (cat === "specialized") return y >= 10 ? 20 : y >= 7 ? 15 : y >= 5 ? 10 : y >= 3 ? 5 : 0;
  return y >= 10 ? 25 : y >= 7 ? 20 : y >= 5 ? 15 : y >= 3 ? 10 : 0;
}

export function salaryPoints(cat: Category, salary: number, age: number | null): number {
  if (cat === "management") return SALARY_C.find((b) => salary >= b.min)?.pts ?? 0;
  if (age === null) return 0;
  if (salary < salaryMinForAge(age)) return 0;
  return SALARY_AB.find((b) => salary >= b.min)?.pts ?? 0;
}

function int(n: number | undefined, name: string, max = 100): number {
  const v = n ?? 0;
  if (!Number.isFinite(v) || v < 0 || v > max) throw new RuleInputError(`${name} must be a number from 0 to ${max}`);
  return v;
}

export function checkHsp(input: CheckInput): CheckResult {
  const cat = input.category;
  if (!(CATEGORIES as readonly string[]).includes(cat)) throw new RuleInputError(`Invalid category. Allowed: ${CATEGORIES.join(", ")}`);
  if (!(EDUCATION as readonly string[]).includes(input.education)) throw new RuleInputError(`Invalid education. Allowed: ${EDUCATION.join(", ")}`);
  const age = input.age;
  if (cat !== "management") {
    if (age === null || !Number.isFinite(age)) throw new RuleInputError("Missing age (or birthDate). Age counts for academic and specialized.");
  }
  if (age !== null && (age < 15 || age > 100)) throw new RuleInputError("age must be between 15 and 100");
  const exp = int(input.experienceYears, "experienceYears", 70);
  const salary = input.annualSalaryYen;
  if (!Number.isFinite(salary) || salary < 0 || salary > 10_000_000_000) throw new RuleInputError("annualSalary must be a yen amount (e.g. 8000000)");
  const research = Math.floor(int(input.researchItems, "researchItems", 4));
  const quals = Math.floor(int(input.qualifications, "qualifications", 20));
  const position: Position = input.position ?? "none";
  if (!(POSITIONS as readonly string[]).includes(position)) throw new RuleInputError(`Invalid position. Allowed: ${POSITIONS.join(", ")}`);
  const jp: JapaneseLevel = input.japanese ?? "none";
  if (!(JAPANESE as readonly string[]).includes(jp)) throw new RuleInputError(`Invalid japanese. Allowed: ${JAPANESE.join(", ")}`);

  const items: Item[] = [];
  const missed: Missed[] = [];
  const warnings: string[] = [];
  const add = (item: string, itemJa: string, points: number, basis: string) => {
    if (points > 0) items.push({ item, itemJa, points, basis });
  };

  // Education
  const edPts = educationPoints(cat, input.education);
  add("Education", "学歴", edPts, EDUCATION_LABEL[input.education]);
  // Ordinance: 複数の分野において博士若しくは修士の学位又は専門職学位を有していること (+5): needs postgraduate degrees, so not with a bachelor's as the highest degree.
  const postgrad = input.education === "doctor" || input.education === "master" || input.education === "mba";
  if (input.multipleDegrees && postgrad) add("Degrees in two or more fields", "複数分野の学位", 5, "Two or more of doctor / master / professional degrees in different fields (+5)");
  else if (input.multipleDegrees) warnings.push("The +5 for degrees in multiple fields only counts doctor's, master's or professional degrees (博士・修士・専門職学位) in two or more fields, not bachelor's degrees.");
  if (input.education === "none") warnings.push("Education points need a university degree or equivalent (graduation from a university or an institution of equal or higher level).");

  // Experience
  const expPts = experiencePoints(cat, exp);
  const expWhat = cat === "academic" ? "research, research guidance or education" : cat === "specialized" ? "the work you will do" : "business management or administration";
  add("Professional experience", "職歴", expPts, `${exp} years in ${expWhat}`);

  // Salary
  const salPts = salaryPoints(cat, salary, age);
  add("Annual salary", "年収", salPts, `${yen(salary)} expected annual pay in Japan`);
  if (cat !== "management" && age !== null && salary >= 400 * M && salPts === 0) {
    warnings.push(`At age ${age}, salary only scores from ${yen(salaryMinForAge(age))} (under 30: ¥4M, 30–34: ¥5M, 35–39: ¥6M, 40+: ¥8M). ${yen(salary)} earns 0 salary points.`);
  }

  // Age
  if (cat !== "management" && age !== null) add("Age", "年齢", agePoints(age), `Age ${age} on the application date`);

  // Research achievements
  if (cat === "academic") {
    const r = research >= 2 ? 25 : research === 1 ? 20 : 0;
    add("Research achievements", "研究実績", r, `${research} kind(s) of achievement (patent invention; 3+ competitive foreign-government grants; 3+ papers as lead/corresponding author in academic databases; other recognized achievement)`);
    if (research === 1) missed.push({ item: "A second kind of research achievement", points: 5, how: "2+ kinds score 25 instead of 20." });
  } else if (cat === "specialized") {
    add("Research achievements", "研究実績", research >= 1 ? 15 : 0, `${research} kind(s) of achievement (patent; foreign-government grants; papers; other)`);
  }

  // Qualifications (specialized only)
  if (cat === "specialized") {
    const q = quals >= 2 ? 10 : quals === 1 ? 5 : 0;
    add("Japanese national qualifications / IT exams", "資格", q, `${quals} Japanese national qualification(s) or IT qualification(s) related to the work`);
    if (quals === 1) missed.push({ item: "A second related qualification", points: 5, how: "Two or more score 10 instead of 5." });
  }

  // Position (management only)
  if (cat === "management") {
    add("Position", "地位", position === "representative" ? 10 : position === "officer" ? 5 : 0, position === "representative" ? "Representative director / representative executive officer" : "Director or executive officer");
  }

  // Bonuses
  if (input.innovationSupport) {
    add(
      input.sme ? "Innovation-support employer that is an SME" : "Employer receiving innovation support",
      "イノベーション促進支援措置",
      input.sme ? 20 : 10,
      input.sme ? "Employer gets a listed innovation-support measure and is a small or medium enterprise (20)" : "Employer gets a listed innovation-support measure (10; 20 if also an SME)",
    );
  } else missed.push({ item: "Employer receiving innovation support", points: 10, how: "10 if your employer gets a listed innovation-support measure; 20 if it is also an SME." });
  if (input.smeResearch3pct) add("SME spending over 3% of revenue on R&D", "試験研究費等比率が3%超の中小企業", 5, "Employer is an SME with test & research costs above 3% of revenue");
  if (input.foreignQualification) add("Foreign qualification or award", "職務に関連する外国の資格等", 5, "Qualification, certification or award related to the work, recognized by a foreign country");
  if (input.japaneseDegree) add("Degree from a Japanese university", "本邦の大学等を卒業又は大学院の課程を修了", 10, "Graduated from a Japanese university or completed a Japanese graduate course");
  else if (jp !== "n2") missed.push({ item: "Degree from a Japanese university", points: 10, how: "Graduating from (or completing a graduate course at) a Japanese university." });
  if (jp === "n1") add("Japanese ability (JLPT N1 or equivalent)", "日本語能力", 15, "JLPT N1, BJT 480+ or a Japanese-language major at a foreign university");
  else if (jp === "n2") {
    if (input.japaneseDegree) warnings.push("JLPT N2 (10) does not add on top of the Japanese-university degree bonus; it only counts when neither the Japanese degree nor N1 applies.");
    else add("Japanese ability (JLPT N2 or equivalent)", "日本語能力", 10, "JLPT N2 or BJT 400+");
    missed.push({ item: "JLPT N1 instead of N2", points: input.japaneseDegree ? 15 : 5, how: "N1 (or BJT 480+) scores 15 and stacks with the Japanese-degree bonus." });
  } else missed.push({ item: "Japanese ability", points: 15, how: input.japaneseDegree ? "JLPT N1 / BJT 480+ adds 15 (N2 adds nothing on top of a Japanese degree)." : "JLPT N1 / BJT 480+ adds 15; N2 / BJT 400+ adds 10." });
  if (input.growthProject) add("Advanced project in a growth field", "成長分野の先端的事業", 10, "Working on an advanced project in a growth field certified by the relevant ministry");
  if (input.topUniversity) add("Degree from a designated top university", "一定の大学を卒業", 10, "Graduated from a university ranked in the top 300 of two of QS / THE / ARWU (or one, for a Japanese university), a Top Global University, or an Innovative Asia partner school");
  if (input.jicaTraining) {
    if (input.japaneseDegree) warnings.push("JICA Innovative Asia training (5) is excluded if it was done as part of the Japanese university course already counted for the Japanese-degree bonus; ISA decides.");
    add("JICA Innovative Asia training", "外務省のイノベーティブ・アジア事業の研修", 5, "Completed JICA training under the Innovative Asia project");
  }
  if (cat === "management" && input.personalInvestment100m) add("Personal investment of ¥100M or more", "本人が1億円以上の投資", 5, "You invest ¥100,000,000 or more in the Japanese business");
  if (cat !== "academic" && input.investmentManagement) add("Investment-management work", "投資運用業等に係る業務", 10, "Work in investment management (financial instruments business) at the employer");
  if (input.localGovSupport) add("Employer supported by a local government", "地方公共団体の支援", 10, "Employer receives local-government support for hiring highly skilled foreign professionals (special-addition notice)");

  const total = items.reduce((s, i) => s + i.points, 0);
  const floorApplies = cat !== "academic";
  const floorOk = !floorApplies || salary >= 300 * M;
  const verdict: Verdict = !floorOk ? "below_salary_floor" : total >= 80 ? "qualifies_80" : total >= 70 ? "qualifies_70" : "below_70";

  if (cat !== "management" && age !== null && age < 40) {
    const nextAge = age < 30 ? 30 : age < 35 ? 35 : 40;
    warnings.push(`Age points drop at ${nextAge}: points are counted on the application date.`);
  }
  if (!input.topUniversity) missed.push({ item: "Degree from a designated top university", points: 10, how: "Top 300 in two of QS / THE / ARWU, Top Global University, or Innovative Asia partner school." });
  if (!input.growthProject) missed.push({ item: "Advanced project in a growth field", points: 10, how: "Project certified by the relevant ministry." });
  if (!input.localGovSupport) missed.push({ item: "Local-government support for the employer", points: 10, how: "Employer supported by a local government under the special-addition notice." });
  missed.sort((a, b) => b.points - a.points);

  // J-Skip (特別高度人材)
  const advancedDegree = input.education === "doctor" || input.education === "master" || input.education === "mba";
  const jEligible = cat === "management" ? exp >= 5 && salary >= 4000 * M : salary >= 2000 * M && (advancedDegree || exp >= 10);
  const jRule = cat === "management" ? "5+ years of business management experience AND annual salary ≥ ¥40,000,000" : "Master's degree or higher AND salary ≥ ¥20,000,000, OR 10+ years of experience in the work AND salary ≥ ¥20,000,000";

  const pr =
    verdict === "qualifies_80" || (jEligible && floorOk)
      ? { route: "hsp80" as const, residenceNeeded: "1 year", note: jEligible ? "J-Skip special highly skilled professionals can apply for permanent residence after 1 year. With 80+ points: 1 year of continuous residence with 80+ points (also counted as of 1 year before the application)." : "80+ points: permanent residence after 1 year of continuous residence, if you also had 80+ points 1 year before the application (PR guideline)." }
      : verdict === "qualifies_70"
        ? { route: "hsp70" as const, residenceNeeded: "3 years", note: "70+ points: permanent residence after 3 years of continuous residence, if you also had 70+ points 3 years before the application (PR guideline). Reaching 80 shortens this to 1 year." }
        : { route: "none" as const, residenceNeeded: "10 years (general rule, of which 5 years on a work or residence status)", note: "Below 70 points the HSP fast track does not apply. Other routes (spouse, long-term resident, general 10-year rule) may." };

  const salaryFloor = { applies: floorApplies, minimumYen: floorApplies ? 300 * M : 0, ok: floorOk };
  if (!floorOk) warnings.push(`Specialized and management HSP also require annual salary of at least ¥3,000,000, whatever the points. ${yen(salary)} is below it.`);

  const label = CATEGORY_LABEL[cat];
  const jSkipLeads = jEligible && floorOk && verdict !== "qualifies_80";
  const summary = jSkipLeads
    ? `J-Skip (特別高度人材) may apply: no points needed, permanent residence after 1 year. On the points table: ${total} points, ${verdict === "qualifies_70" ? `clears 70 for ${label.code}` : `${70 - total} short of 70 for ${label.code}`}.`
    : verdict === "below_salary_floor"
      ? `${total} points, but salary ${yen(salary)} is below the ¥3,000,000 minimum for ${label.code}: does not qualify.`
      : verdict === "qualifies_80"
        ? `${total} points: clears 70 for ${label.code} and 80 for the 1-year permanent-residence fast track.`
        : verdict === "qualifies_70"
          ? `${total} points: clears 70 for ${label.code}. ${80 - total} more for the 80-point 1-year PR fast track (70 points: 3 years).`
          : `${total} points: ${70 - total} short of the 70 needed for ${label.code}.`;

  return {
    category: cat,
    categoryLabel: `${label.en} · ${label.code}`,
    statusCode: label.code,
    total,
    threshold: 70,
    verdict,
    summary,
    breakdown: items,
    pointsTo70: Math.max(0, 70 - total),
    pointsTo80: Math.max(0, 80 - total),
    salaryFloor,
    pr,
    hsp2:
      "HSP (ii) (高度専門職2号, unlimited stay): after 3 years of activity on HSP (i) with 70+ points (1 year for J-Skip), plus good conduct and national-interest requirements (ordinance art. 2).",
    jSkip: {
      eligible: jEligible && floorOk,
      rule: jRule,
      note: jEligible
        ? "You may qualify as a J-Skip special highly skilled professional (特別高度人材): no points needed, extended benefits, HSP (ii) and PR after 1 year. Needs proof of the degree / experience and the salary."
        : "Not J-Skip on these numbers (it needs no points but has a high salary bar).",
    },
    couldAdd: missed.slice(0, 6),
    warnings,
    pendingRevision: PENDING_REVISION,
    rulesAsOf: RULES_AS_OF,
    sources: SOURCES,
  };
}

/** Whole years of age on a date (both YYYY-MM-DD). */
export function ageOn(birth: string, date: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = date.split("-").map(Number);
  let a = y - by;
  if (m < bm || (m === bm && d < bd)) a -= 1;
  return a;
}
export function validDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
export function todayJst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

export const RULES = {
  rulesAsOf: RULES_AS_OF,
  threshold: 70,
  salaryFloorYen: { academic: 0, specialized: 3_000_000, management: 3_000_000 },
  categories: CATEGORY_LABEL,
  education: {
    academic: { doctor: 30, master_or_professional_incl_mba: 20, bachelor: 10, multipleDegreesBonus: 5 },
    specialized: { doctor: 30, mba_mot: 25, master_or_professional: 20, bachelor: 10, multipleDegreesBonus: 5 },
    management: { mba_mot: 25, doctor_or_master: 20, bachelor: 10, multipleDegreesBonus: 5 },
  },
  experienceYears: {
    academic: { "7+": 15, "5+": 10, "3+": 5 },
    specialized: { "10+": 20, "7+": 15, "5+": 10, "3+": 5 },
    management: { "10+": 25, "7+": 20, "5+": 15, "3+": 10 },
  },
  salary: {
    academicAndSpecialized: { "10M+": 40, "9M+": 35, "8M+": 30, "7M+": 25, "6M+": 20, "5M+": 15, "4M+": 10 },
    ageLimits: "Brackets only count from: under 30 ¥4M; 30–34 ¥5M; 35–39 ¥6M; 40+ ¥8M",
    management: { "30M+": 50, "25M+": 40, "20M+": 30, "15M+": 20, "10M+": 10 },
    meaning: "Expected annual pay from the Japanese employer (and any foreign affiliate) for the HSP activity, not past income.",
  },
  age: { note: "academic and specialized only", "under 30": 15, "30-34": 10, "35-39": 5 },
  research: { academic: { "2+ kinds": 25, "1 kind": 20 }, specialized: { "1+ kind": 15 }, management: "not scored" },
  qualifications: { specialized: { "2+": 10, "1": 5 } },
  position: { management: { representative: 10, officer: 5 } },
  bonuses: {
    innovationSupportSme: 20,
    innovationSupport: 10,
    smeResearch3pct: 5,
    foreignQualification: 5,
    japaneseUniversityDegree: 10,
    japaneseN1: 15,
    japaneseN2: "10 (only if neither the Japanese-degree bonus nor N1 applies)",
    growthFieldProject: 10,
    designatedTopUniversity: 10,
    jicaInnovativeAsia: 5,
    personalInvestment100m: "5 (management only)",
    investmentManagement: "10 (specialized and management)",
    localGovernmentSupport: 10,
  },
  permanentResidence: { "70+": "3 years of residence with 70+ points (also 70+ as of 3 years before)", "80+": "1 year with 80+ points (also 80+ as of 1 year before)", jSkip: "1 year" },
  hsp2: "After 3 years on HSP (i) (1 year for J-Skip) + good conduct + national interest",
  jSkip: {
    academicAndSpecialized: "Master's or higher + ¥20M salary, or 10+ years' experience + ¥20M salary",
    management: "5+ years' management experience + ¥40M salary",
  },
  pendingRevision: PENDING_REVISION,
  sources: SOURCES,
  disclaimer: DISCLAIMER,
};

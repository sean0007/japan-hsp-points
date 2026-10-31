import { InputError, type Endpoint, type Input } from "./agent-api";
import { CATEGORIES, DISCLAIMER, EDUCATION, JAPANESE, POSITIONS, RuleInputError, ageOn, checkHsp, todayJst, validDate, type Category, type Education, type JapaneseLevel, type Position } from "./hsp";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-hsp-points.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?category=specialized&age=31&education=master&experienceYears=4&annualSalary=7500000&japanese=n2&qualifications=1";

function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}
function s(v: unknown): string | null {
  const f = first(v);
  return f === undefined || f === null || String(f).trim() === "" ? null : String(f).trim();
}
function b(v: unknown): boolean {
  const f = first(v);
  if (typeof f === "boolean") return f;
  return f !== undefined && f !== null && /^(1|true|yes|y|on)$/i.test(String(f).trim());
}
function n(v: unknown, name: string): number | null {
  const f = s(v);
  if (f === null) return null;
  const x = Number(f.replace(/[,_\s¥円$]/g, ""));
  if (!Number.isFinite(x)) throw new InputError(`Not a number: ${name} "${f}"`);
  return x;
}

const CATEGORY_ALIASES: Record<string, Category> = {
  a: "academic", i_a: "academic", "1a": "academic", research: "academic", researcher: "academic", professor: "academic", イ: "academic", "1号イ": "academic", 高度学術研究: "academic", 高度学術研究活動: "academic",
  b: "specialized", i_b: "specialized", "1b": "specialized", technical: "specialized", engineer: "specialized", employee: "specialized", specialist: "specialized", work: "specialized", ロ: "specialized", "1号ロ": "specialized", 高度専門技術: "specialized", "高度専門・技術活動": "specialized",
  c: "management", i_c: "management", "1c": "management", business: "management", manager: "management", executive: "management", ceo: "management", ハ: "management", "1号ハ": "management", 高度経営管理: "management", "高度経営・管理活動": "management",
};
const EDUCATION_ALIASES: Record<string, Education> = {
  phd: "doctor", doctorate: "doctor", doctoral: "doctor", dr: "doctor", 博士: "doctor",
  mot: "mba", mba_mot: "mba", 経営管理専門職学位: "mba",
  masters: "master", ms: "master", msc: "master", ma: "master", professional: "master", jd: "master", 修士: "master", 専門職: "master",
  bachelors: "bachelor", ba: "bachelor", bs: "bachelor", bsc: "bachelor", degree: "bachelor", university: "bachelor", 大卒: "bachelor", 学士: "bachelor",
  no: "none", high_school: "none", 高卒: "none",
};
const JAPANESE_ALIASES: Record<string, JapaneseLevel> = { jlpt_n1: "n1", bjt480: "n1", n1_or_major: "n1", jlpt_n2: "n2", bjt400: "n2", no: "none", n3: "none", n4: "none", n5: "none", false: "none" };
const POSITION_ALIASES: Record<string, Position> = { ceo: "representative", representative_director: "representative", 代表取締役: "representative", director: "officer", executive_officer: "officer", board: "officer", 取締役: "officer", 執行役: "officer", no: "none" };

function pick<T extends string>(raw: string | null, allowed: readonly T[], aliases: Record<string, T>, name: string, fallback: T | null): T | null {
  if (!raw) return fallback;
  const k = raw.toLowerCase().replace(/[\s-]+/g, "_");
  const v = (aliases[k] ?? aliases[raw] ?? k) as T;
  if (!(allowed as readonly string[]).includes(v)) throw new InputError(`Invalid ${name} "${raw}". Allowed: ${allowed.join(", ")}`);
  return v;
}

export function computeCheck(input: Input) {
  try {
    const category = pick(s(input.category ?? input.type ?? input.activity), CATEGORIES, CATEGORY_ALIASES, "category", null);
    if (!category) throw new InputError(`Missing category. Allowed: ${CATEGORIES.join(", ")} (HSP i-a / i-b / i-c)`);
    const education = pick(s(input.education ?? input.degree), EDUCATION, EDUCATION_ALIASES, "education", null);
    if (!education) throw new InputError(`Missing education. Allowed: ${EDUCATION.join(", ")}`);
    let age = n(input.age, "age");
    const birth = s(input.birthDate ?? input.dob);
    if (age === null && birth) {
      const on = s(input.applicationDate ?? input.today) ?? todayJst();
      if (!validDate(birth) || !validDate(on)) throw new InputError("birthDate / applicationDate must be YYYY-MM-DD");
      age = ageOn(birth, on);
    }
    let salary = n(input.annualSalary ?? input.salary ?? input.annualSalaryYen ?? input.income, "annualSalary");
    const man = n(input.annualSalaryMan ?? input.salaryMan, "annualSalaryMan");
    if (salary === null && man !== null) salary = man * 10_000;
    if (salary === null) throw new InputError("Missing annualSalary (expected yearly pay in Japan, in yen, e.g. 7500000; or annualSalaryMan=750)");
    const salaryNote = salary > 0 && salary < 100_000 ? `annualSalary ${salary} looked like 万円; read as ¥${(salary * 10_000).toLocaleString("en-US")}.` : null;
    if (salaryNote) salary = salary * 10_000;
    const exp = n(input.experienceYears ?? input.experience ?? input.years, "experienceYears");
    const r = checkHsp({
      category,
      age,
      education,
      multipleDegrees: b(input.multipleDegrees),
      experienceYears: exp ?? 0,
      annualSalaryYen: salary,
      researchItems: n(input.researchItems ?? input.research, "researchItems") ?? 0,
      qualifications: n(input.qualifications ?? input.licenses, "qualifications") ?? 0,
      position: pick(s(input.position), POSITIONS, POSITION_ALIASES, "position", "none") ?? "none",
      innovationSupport: b(input.innovationSupport ?? input.innovation),
      sme: b(input.sme),
      smeResearch3pct: b(input.smeResearch3pct),
      foreignQualification: b(input.foreignQualification),
      japaneseDegree: b(input.japaneseDegree ?? input.japanUniversity),
      japanese: pick(s(input.japanese ?? input.jlpt), JAPANESE, JAPANESE_ALIASES, "japanese", "none") ?? "none",
      growthProject: b(input.growthProject),
      topUniversity: b(input.topUniversity),
      jicaTraining: b(input.jicaTraining),
      personalInvestment100m: b(input.personalInvestment100m ?? input.investment100m),
      investmentManagement: b(input.investmentManagement),
      localGovSupport: b(input.localGovSupport),
    });
    if (salaryNote) r.warnings.unshift(salaryNote);
    return r;
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "japanHspPointsCheck",
    summary: "Japan Highly Skilled Professional (高度専門職) points: does this profile reach 70 or 80 points, and what does it mean for PR?",
    description:
      "Applies the HSP points ordinance (平成26年法務省令第37号, art. 1 and 2) to a profile for one of the three categories: academic (HSP i-a, 高度専門職1号イ), specialized (i-b, 1号ロ) or management (i-c, 1号ハ). Scores education, experience, salary (age-banded minimums for i-a / i-b: under 30 from ¥4M, 30–34 ¥5M, 35–39 ¥6M, 40+ ¥8M; i-c from ¥10M), age, research, Japanese qualifications, position and the bonus items (innovation-support employer 10/20, SME R&D 5, foreign qualification 5, Japanese degree 10, JLPT N1 15 / N2 10, growth project 10, top university 10, JICA 5, ¥100M investment 5, investment management 10, local-government support 10). Checks the ¥3M salary floor (i-b, i-c), the J-Skip (特別高度人材) criteria, the permanent-residence fast track (70 → 3 years, 80 → 1 year) and HSP (ii). Returns verdict (qualifies_80 | qualifies_70 | below_70 | below_salary_floor), total, breakdown [{item, points, basis}], pointsTo70, pointsTo80, pr, jSkip, couldAdd, warnings, pendingRevision, sources and a disclaimer.",
    params: [
      { name: "category", type: "string", required: true, enum: CATEGORIES, description: "academic (research / teaching, HSP i-a), specialized (engineer, specialist, most employees, HSP i-b), management (executive / business owner, HSP i-c). Aliases: a/b/c, イ/ロ/ハ, researcher, engineer, ceo…" },
      { name: "education", type: "string", required: true, enum: EDUCATION, description: "Highest degree: doctor, mba (MBA / MOT professional degree), master (incl. other professional degrees), bachelor, none." },
      { name: "age", type: "integer", description: "Age on the application date. Required for academic and specialized unless birthDate is given." },
      { name: "birthDate", type: "string", description: "YYYY-MM-DD; used with applicationDate (default today in Japan) when age is not given." },
      { name: "annualSalary", type: "number", required: true, description: "Expected annual pay in Japan in yen, including bonuses (e.g. 7500000). Or annualSalaryMan in 万円 (750)." },
      { name: "experienceYears", type: "number", default: 0, description: "Years of experience: in research/teaching (academic), in the work you will do (specialized), in business management (management)." },
      { name: "multipleDegrees", type: "boolean", default: false, description: "Doctor / master / professional degrees in two or more fields (+5; needs education doctor, mba or master, not bachelor)." },
      { name: "researchItems", type: "integer", default: 0, minimum: 0, maximum: 4, description: "Kinds of research achievement (patent; 3+ foreign-government grants; 3+ papers as corresponding author; other). Academic: 1 → 20, 2+ → 25. Specialized: 1+ → 15." },
      { name: "qualifications", type: "integer", default: 0, description: "Specialized only: Japanese national qualifications / ISA-listed IT exams or qualifications related to the work. 1 → 5, 2+ → 10." },
      { name: "position", type: "string", enum: POSITIONS, default: "none", description: "Management only: representative (代表取締役 etc., 10) or officer (取締役 / 執行役, 5)." },
      { name: "innovationSupport", type: "boolean", default: false, description: "Employer receives a listed innovation-support measure (10; 20 with sme=true)." },
      { name: "sme", type: "boolean", default: false, description: "Employer is a small or medium enterprise (only adds with innovationSupport)." },
      { name: "smeResearch3pct", type: "boolean", default: false, description: "SME employer whose R&D costs exceed 3% of revenue (5)." },
      { name: "foreignQualification", type: "boolean", default: false, description: "Work-related foreign qualification, certification or award (5)." },
      { name: "japaneseDegree", type: "boolean", default: false, description: "Graduated from a Japanese university or graduate course (10)." },
      { name: "japanese", type: "string", enum: JAPANESE, default: "none", description: "n1 (JLPT N1, BJT 480+ or Japanese major abroad, 15) or n2 (JLPT N2 / BJT 400+, 10, not on top of japaneseDegree)." },
      { name: "growthProject", type: "boolean", default: false, description: "Working on a ministry-certified advanced project in a growth field (10)." },
      { name: "topUniversity", type: "boolean", default: false, description: "Degree from a designated university (top-300 rankings, Top Global University, Innovative Asia partner) (10)." },
      { name: "jicaTraining", type: "boolean", default: false, description: "Completed JICA Innovative Asia training (5)." },
      { name: "personalInvestment100m", type: "boolean", default: false, description: "Management only: you invest ¥100M+ in the business (5)." },
      { name: "investmentManagement", type: "boolean", default: false, description: "Specialized / management: investment-management work (10)." },
      { name: "localGovSupport", type: "boolean", default: false, description: "Employer receives local-government support for hiring highly skilled foreigners (10)." },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "Japan HSP Points Calculator",
  nameForModel: "japan_hsp_points",
  descriptionForHuman: "Do I reach 70 or 80 Highly Skilled Professional points in Japan? Breakdown, PR fast track, J-Skip.",
  descriptionForModel:
    "Use when someone asks whether they qualify for Japan's Highly Skilled Professional visa (高度専門職 / 高度人材ポイント制), how many HSP points they have, whether they reach 70 or 80 points, how fast they can get permanent residence through the HSP route (70 → 3 years, 80 → 1 year), whether they qualify for J-Skip (特別高度人材), or which bonus points they could add (JLPT N1/N2, Japanese degree, innovation employer…). Computes from the ministerial ordinance instead of guessing; relay the breakdown, the pending FY2026 revision note and the disclaimer (educational; ISA decides; every point needs documents).",
  logo: "/icon.svg",
};

import { CATEGORIES, EDUCATION, JAPANESE, POSITIONS, checkHsp, type Category, type CheckInput, type Education, type JapaneseLevel, type Position } from "./hsp";

export const PUBLIC_URL = "https://japan-hsp-points.vercel.app";

/** Share links: /r?c=specialized&a=31&e=master&x=6&s=7500000[&j=n2][&q=1][&r=0][&p=none][&f=jd,in,sme] */
type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}
function num(p: Params, key: string, max: number): number | null {
  const v = one(p, key);
  if (v === undefined || v === "" || !/^\d+(\.\d+)?$/.test(v)) return null;
  const n = Number(v);
  return n <= max ? n : null;
}

export const FLAGS = {
  md: "multipleDegrees",
  in: "innovationSupport",
  sme: "sme",
  rd: "smeResearch3pct",
  fq: "foreignQualification",
  jd: "japaneseDegree",
  gp: "growthProject",
  tu: "topUniversity",
  ji: "jicaTraining",
  iv: "personalInvestment100m",
  im: "investmentManagement",
  lg: "localGovSupport",
} as const;
export type FlagKey = keyof typeof FLAGS;
export type FlagName = (typeof FLAGS)[FlagKey];

export type Shared = {
  category: Category;
  age: number | null;
  education: Education;
  experienceYears: number;
  annualSalaryYen: number;
  japanese: JapaneseLevel;
  qualifications: number;
  researchItems: number;
  position: Position;
  flags: FlagName[];
};

export const EXAMPLE_SHARED: Shared = { category: "specialized", age: 31, education: "master", experienceYears: 4, annualSalaryYen: 7_500_000, japanese: "n2", qualifications: 1, researchItems: 0, position: "none", flags: [] };
export const EXAMPLE_80: Shared = { category: "specialized", age: 27, education: "master", experienceYears: 3, annualSalaryYen: 5_500_000, japanese: "n1", qualifications: 0, researchItems: 0, position: "none", flags: ["japaneseDegree"] };
export const EXAMPLE_ACADEMIC: Shared = { category: "academic", age: 36, education: "doctor", experienceYears: 7, annualSalaryYen: 6_500_000, japanese: "none", qualifications: 0, researchItems: 2, position: "none", flags: [] };
export const EXAMPLE_MANAGER: Shared = { category: "management", age: 45, education: "mba", experienceYears: 10, annualSalaryYen: 15_000_000, japanese: "none", qualifications: 0, researchItems: 0, position: "representative", flags: [] };
export const EXAMPLES = [EXAMPLE_SHARED, EXAMPLE_80, EXAMPLE_ACADEMIC, EXAMPLE_MANAGER] as const;

const FLAG_ORDER = Object.keys(FLAGS) as FlagKey[];

export function parseShared(p: Params): Shared | null {
  const c = one(p, "c");
  const e = one(p, "e");
  const s = num(p, "s", 10_000_000_000);
  if (!c || !(CATEGORIES as readonly string[]).includes(c) || !e || !(EDUCATION as readonly string[]).includes(e) || s === null) return null;
  const age = num(p, "a", 100);
  if (c !== "management" && age === null) return null;
  const j = one(p, "j") ?? "none";
  const pos = one(p, "p") ?? "none";
  const f = (one(p, "f") ?? "").split(",").filter((k): k is FlagKey => (FLAG_ORDER as string[]).includes(k));
  return {
    category: c as Category,
    age,
    education: e as Education,
    experienceYears: num(p, "x", 70) ?? 0,
    annualSalaryYen: s,
    japanese: ((JAPANESE as readonly string[]).includes(j) ? j : "none") as JapaneseLevel,
    qualifications: num(p, "q", 20) ?? 0,
    researchItems: num(p, "r", 4) ?? 0,
    position: ((POSITIONS as readonly string[]).includes(pos) ? pos : "none") as Position,
    flags: FLAG_ORDER.filter((k) => f.includes(k)).map((k) => FLAGS[k]),
  };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("c", s.category);
  if (s.age !== null) q.set("a", String(s.age));
  q.set("e", s.education);
  q.set("x", String(s.experienceYears));
  q.set("s", String(s.annualSalaryYen));
  if (s.japanese !== "none") q.set("j", s.japanese);
  if (s.qualifications) q.set("q", String(s.qualifications));
  if (s.researchItems) q.set("r", String(s.researchItems));
  if (s.position !== "none") q.set("p", s.position);
  const f = FLAG_ORDER.filter((k) => s.flags.includes(FLAGS[k]));
  if (f.length) q.set("f", f.join(","));
  return q.toString();
}

export function toCheckInput(s: Shared): CheckInput {
  const flags = Object.fromEntries(s.flags.map((f) => [f, true]));
  return {
    category: s.category,
    age: s.age,
    education: s.education,
    experienceYears: s.experienceYears,
    annualSalaryYen: s.annualSalaryYen,
    japanese: s.japanese,
    qualifications: s.qualifications,
    researchItems: s.researchItems,
    position: s.position,
    ...flags,
  };
}
export function safeCheck(s: Shared) {
  try {
    return checkHsp(toCheckInput(s));
  } catch {
    return null;
  }
}
export function resultPath(s: Shared): string {
  return `/r?${sharedQuery(s)}`;
}
export function ogPath(s: Shared): string {
  return `/og?${sharedQuery(s)}`;
}
export function isIndexable(s: Shared): boolean {
  return EXAMPLES.some((e) => resultPath(e) === resultPath(s));
}

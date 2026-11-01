import assert from "node:assert/strict";
import test from "node:test";
import { ageOn, checkHsp, salaryMinForAge, salaryPoints } from "./hsp";

const base = { category: "specialized" as const, age: 31, education: "master" as const, experienceYears: 4, annualSalaryYen: 7_500_000, japanese: "n2" as const, qualifications: 1 };

test("specialized example: 20 + 5 + 25 + 10 + 10 + 5 = 75 → qualifies_70, PR in 3 years", () => {
  const r = checkHsp(base);
  assert.equal(r.total, 75);
  assert.equal(r.verdict, "qualifies_70");
  assert.equal(r.pointsTo80, 5);
  assert.equal(r.pr.route, "hsp70");
  assert.equal(r.pr.residenceNeeded, "3 years");
  assert.equal(r.statusCode, "高度専門職1号ロ");
  assert.equal(r.jSkip.eligible, false);
});

test("Japanese master's grad with N1 reaches exactly 80 → 1-year PR", () => {
  const r = checkHsp({ category: "specialized", age: 27, education: "master", experienceYears: 3, annualSalaryYen: 5_500_000, japanese: "n1", japaneseDegree: true });
  assert.equal(r.total, 80);
  assert.equal(r.verdict, "qualifies_80");
  assert.equal(r.pr.route, "hsp80");
});

test("N2 does not stack with the Japanese-degree bonus; N1 does", () => {
  const n2 = checkHsp({ ...base, japaneseDegree: true });
  assert.equal(n2.total, 75); // 10 degree replaces 10 N2
  assert.ok(n2.warnings.some((w) => w.includes("N2")));
  const n1 = checkHsp({ ...base, japanese: "n1", japaneseDegree: true });
  assert.equal(n1.total, 90);
});

test("salary age bands: 35-year-old on ¥5.5M gets 0 salary points; 29-year-old on ¥4.2M gets 10", () => {
  assert.equal(salaryMinForAge(35), 6_000_000);
  assert.equal(salaryPoints("specialized", 5_500_000, 35), 0);
  assert.equal(salaryPoints("specialized", 4_200_000, 29), 10);
  assert.equal(salaryPoints("academic", 7_999_999, 40), 0);
  assert.equal(salaryPoints("academic", 8_000_000, 40), 30);
  assert.equal(salaryPoints("specialized", 12_000_000, 45), 40);
  const r = checkHsp({ ...base, age: 35, annualSalaryYen: 5_500_000 });
  assert.ok(r.warnings.some((w) => w.includes("0 salary points")));
});

test("salary floor ¥3M for specialized and management, not academic", () => {
  const r = checkHsp({ category: "specialized", age: 25, education: "doctor", experienceYears: 10, annualSalaryYen: 2_900_000, japanese: "n1", japaneseDegree: true, researchItems: 1 });
  assert.ok(r.total >= 70);
  assert.equal(r.verdict, "below_salary_floor");
  const a = checkHsp({ category: "academic", age: 25, education: "doctor", experienceYears: 7, annualSalaryYen: 2_900_000, researchItems: 2 });
  assert.equal(a.total, 30 + 15 + 15 + 25);
  assert.equal(a.verdict, "qualifies_80");
  assert.equal(a.salaryFloor.applies, false);
});

test("academic: doctor + 7y + ¥6.5M at 36 + 2 research = 95", () => {
  const r = checkHsp({ category: "academic", age: 36, education: "doctor", experienceYears: 7, annualSalaryYen: 6_500_000, researchItems: 2 });
  assert.equal(r.total, 30 + 15 + 20 + 5 + 25);
  const one = checkHsp({ category: "academic", age: 36, education: "doctor", experienceYears: 7, annualSalaryYen: 6_500_000, researchItems: 1 });
  assert.equal(one.total, 90);
  // MBA counts as a professional degree (20) in academic
  assert.equal(checkHsp({ category: "academic", age: 45, education: "mba", experienceYears: 0, annualSalaryYen: 0 }).total, 20);
});

test("management: MBA 25 + 10y 25 + ¥15M 20 + representative 10 = 80; no age points; ¥100M investment", () => {
  const r = checkHsp({ category: "management", age: null, education: "mba", experienceYears: 10, annualSalaryYen: 15_000_000, position: "representative" });
  assert.equal(r.total, 80);
  assert.equal(r.verdict, "qualifies_80");
  assert.ok(!r.breakdown.some((i) => i.item === "Age"));
  const d = checkHsp({ category: "management", age: 50, education: "doctor", experienceYears: 3, annualSalaryYen: 9_999_999, position: "officer", personalInvestment100m: true });
  assert.equal(d.total, 20 + 10 + 0 + 5 + 5);
  const nogo = checkHsp({ category: "academic", age: 30, education: "doctor", experienceYears: 0, annualSalaryYen: 0, personalInvestment100m: true, investmentManagement: true });
  assert.equal(nogo.total, 30 + 10);
});

test("specialized qualifications and research", () => {
  assert.equal(checkHsp({ category: "specialized", age: 45, education: "none", experienceYears: 0, annualSalaryYen: 3_000_000, qualifications: 2, researchItems: 3 }).total, 10 + 15);
  assert.equal(checkHsp({ category: "specialized", age: 45, education: "doctor", experienceYears: 10, annualSalaryYen: 3_000_000 }).total, 30 + 20);
  assert.equal(checkHsp({ category: "specialized", age: 45, education: "mba", multipleDegrees: true, experienceYears: 0, annualSalaryYen: 3_000_000 }).total, 30);
});

test("bonuses: innovation 10 / SME 20, R&D 5, growth, top uni, JICA, local gov, investment mgmt", () => {
  const z = { category: "specialized" as const, age: 45, education: "none" as const, experienceYears: 0, annualSalaryYen: 3_000_000 };
  assert.equal(checkHsp({ ...z, innovationSupport: true }).total, 10);
  assert.equal(checkHsp({ ...z, innovationSupport: true, sme: true }).total, 20);
  assert.equal(checkHsp({ ...z, sme: true }).total, 0);
  assert.equal(checkHsp({ ...z, smeResearch3pct: true, foreignQualification: true, growthProject: true, topUniversity: true, jicaTraining: true, localGovSupport: true, investmentManagement: true }).total, 5 + 5 + 10 + 10 + 5 + 10 + 10);
});

test("J-Skip: master + ¥20M, 10y + ¥20M, management 5y + ¥40M", () => {
  assert.equal(checkHsp({ ...base, annualSalaryYen: 20_000_000 }).jSkip.eligible, true);
  assert.equal(checkHsp({ ...base, education: "bachelor", annualSalaryYen: 20_000_000 }).jSkip.eligible, false);
  assert.equal(checkHsp({ ...base, education: "bachelor", experienceYears: 10, annualSalaryYen: 20_000_000 }).jSkip.eligible, true);
  const m = checkHsp({ category: "management", age: null, education: "none", experienceYears: 5, annualSalaryYen: 40_000_000 });
  assert.equal(m.jSkip.eligible, true);
  assert.equal(m.pr.residenceNeeded, "1 year");
  assert.equal(checkHsp({ category: "management", age: null, education: "none", experienceYears: 4, annualSalaryYen: 40_000_000 }).jSkip.eligible, false);
});

test("below 70 shows how many points are missing and what could add", () => {
  const r = checkHsp({ category: "specialized", age: 33, education: "bachelor", experienceYears: 5, annualSalaryYen: 6_000_000 });
  assert.equal(r.total, 10 + 10 + 20 + 10);
  assert.equal(r.verdict, "below_70");
  assert.equal(r.pointsTo70, 20);
  assert.equal(r.pr.route, "none");
  assert.ok(r.couldAdd.length > 0 && r.couldAdd[0].points >= r.couldAdd[r.couldAdd.length - 1].points);
});

test("input validation and age helper", () => {
  assert.throws(() => checkHsp({ ...base, age: null }));
  assert.throws(() => checkHsp({ ...base, annualSalaryYen: -1 }));
  assert.throws(() => checkHsp({ ...base, researchItems: 9 }));
  assert.equal(ageOn("1995-10-31", "2026-10-30"), 30);
  assert.equal(ageOn("1995-10-30", "2026-10-30"), 31);
});

test("multiple-degrees bonus needs postgraduate degrees (not bachelor / none)", () => {
  const base = { category: "specialized" as const, age: 28, experienceYears: 0, annualSalaryYen: 5_000_000 };
  const bach = checkHsp({ ...base, education: "bachelor", multipleDegrees: true });
  assert.equal(bach.total, 10 + 15 + 15);
  assert.ok(!bach.breakdown.some((i) => i.itemJa === "複数分野の学位"));
  assert.ok(bach.warnings.some((w) => /not bachelor/.test(w)));
  assert.equal(checkHsp({ ...base, education: "none", multipleDegrees: true }).total, 15 + 15);
  assert.equal(checkHsp({ ...base, education: "master", multipleDegrees: true }).total, 20 + 5 + 15 + 15);
  assert.equal(checkHsp({ ...base, education: "doctor", multipleDegrees: true }).total, 30 + 5 + 15 + 15);
  assert.equal(checkHsp({ ...base, education: "mba", multipleDegrees: true }).total, 25 + 5 + 15 + 15);
});

test("J-Skip-eligible profile below 70 leads with J-Skip in the summary, not 'short of 70'", () => {
  const r = checkHsp({ category: "specialized", age: 45, education: "master", experienceYears: 0, annualSalaryYen: 20_000_000 });
  assert.equal(r.verdict, "below_70");
  assert.equal(r.jSkip.eligible, true);
  assert.equal(r.pr.route, "hsp80");
  assert.ok(r.summary.startsWith("J-Skip (特別高度人材) may apply"), r.summary);
  assert.match(r.summary, new RegExp(`${r.total} points, ${70 - r.total} short of 70`));
});

test("J-Skip-eligible profile at 70-79 leads with J-Skip; 80+ and non-J-Skip summaries unchanged", () => {
  const a = checkHsp({ category: "specialized", age: 45, education: "master", experienceYears: 5, annualSalaryYen: 20_000_000 });
  assert.equal(a.jSkip.eligible, true);
  assert.equal(a.verdict, "qualifies_70");
  assert.ok(a.summary.startsWith("J-Skip") && a.summary.includes("clears 70"), a.summary);
  const b = checkHsp(base);
  assert.equal(b.jSkip.eligible, false);
  assert.ok(b.summary.startsWith("75 points: clears 70"));
  const c = checkHsp({ category: "management", age: 50, education: "mba", experienceYears: 10, annualSalaryYen: 40_000_000, position: "representative" });
  assert.equal(c.verdict, "qualifies_80");
  assert.ok(!c.summary.startsWith("J-Skip"));
});

import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc, preflight } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL } from "./api";

const e = ENDPOINTS.check;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET} → 75 points, qualifies_70`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const body = await res.json();
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.equal(body.total, 75);
  assert.equal(body.verdict, "qualifies_70");
  assert.ok(body.sources.length);
  assert.ok(body.pendingRevision.includes("FY2026"));
});

test("POST JSON body matches GET", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}`);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(url.searchParams)) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
});

test("aliases, birthDate, 万円", async () => {
  const b = await (await handler(new Request(`${PUBLIC_URL}${e.path}?category=engineer&dob=1995-10-31&applicationDate=2026-10-30&degree=msc&experience=4&salaryMan=750&jlpt=jlpt_n2&licenses=1`))).json();
  assert.equal(b.category, "specialized");
  assert.equal(b.total, 75);
  const c = await (await handler(new Request(`${PUBLIC_URL}${e.path}?category=ceo&education=mba&experienceYears=10&annualSalary=15,000,000&position=${encodeURIComponent("代表取締役")}`))).json();
  assert.equal(c.category, "management");
  assert.equal(c.total, 80);
  const m = await (await handler(new Request(`${PUBLIC_URL}${e.path}?category=${encodeURIComponent("イ")}&age=36&education=phd&experienceYears=7&annualSalary=650&researchItems=2`))).json();
  assert.equal(m.category, "academic");
  assert.equal(m.total, 95);
  assert.ok(m.warnings[0].includes("万円"));
});

test("bad inputs → 400 with example", async () => {
  for (const q of ["education=master&age=30&annualSalary=6000000", "category=alien&education=master&age=30&annualSalary=6000000", "category=specialized&age=30&annualSalary=6000000", "category=specialized&education=master&annualSalary=6000000", "category=specialized&education=master&age=30", "category=specialized&education=master&age=30&annualSalary=lots", "category=specialized&education=master&age=30&annualSalary=6000000&japanese=fluent"]) {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}?${q}`));
    assert.equal(res.status, 400, q);
    const body = await res.json();
    assert.equal(body.disclaimer, API_DISCLAIMER);
    assert.ok(body.example);
  }
});

test("malformed JSON body → 400", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{nope" }));
  assert.equal(res.status, 400);
});

test("OPTIONS preflight is CORS open", () => {
  const res = preflight();
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("OpenAPI lists /api/check GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, [e]) as { openapi: string; paths: Record<string, { get: { parameters: { name: string }[] }; post: unknown }> };
  assert.ok(spec.openapi.startsWith("3."));
  assert.ok(spec.paths["/api/check"]?.post);
  assert.ok(spec.paths["/api/check"].get.parameters.find((p) => p.name === "annualSalary"));
});

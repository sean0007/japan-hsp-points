import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLES, EXAMPLE_SHARED, isIndexable, parseShared, resultPath, safeCheck, sharedQuery } from "./share";

test("share link round-trips", () => {
  for (const ex of EXAMPLES) {
    const back = parseShared(new URLSearchParams(sharedQuery(ex)));
    assert.deepEqual(back, ex);
    assert.ok(isIndexable(ex));
    assert.ok(safeCheck(ex));
  }
  assert.equal(resultPath(EXAMPLE_SHARED), "/r?c=specialized&a=31&e=master&x=4&s=7500000&j=n2&q=1");
  assert.equal(safeCheck(EXAMPLES[1])!.total, 80);
  assert.equal(safeCheck(EXAMPLES[3])!.total, 80);
});

test("flags parse and bad share params → null", () => {
  const s = parseShared(new URLSearchParams("c=specialized&a=30&e=master&x=3&s=6000000&f=jd,in,sme,zz"));
  assert.deepEqual(s?.flags, ["innovationSupport", "sme", "japaneseDegree"]);
  assert.equal(parseShared(new URLSearchParams("c=alien&a=30&e=master&s=6000000")), null);
  assert.equal(parseShared(new URLSearchParams("c=specialized&e=master&s=6000000")), null);
  assert.equal(parseShared(new URLSearchParams("c=specialized&a=30&e=master&s=abc")), null);
});

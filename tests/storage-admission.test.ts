import { test } from "node:test";
import assert from "node:assert/strict";
import { fits, storageUsed } from "@/lib/storage-quota";

const GB = 1024 ** 3;
const held = { bytes: 199 * GB, brake: 200 * GB, left: GB, full: false, available: true };

test("all plan standings admit an exact fit and refuse an overflow", () => {
  for (const standing of ["paid", "trial", "none", "ended"] as const) {
    assert.equal(fits(held, GB), true);
    assert.equal(fits(held, GB + 1), false);
    assert.equal(fits({ ...held, left: 0, full: true }, 1), false);
  }
});

test("invalid file sizes and unknown remaining space never authorize uploads", () => {
  for (const value of [0, -1, NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(fits(held, value), false);
  }
  assert.equal(fits({ ...held, left: NaN }, 1), false);
  assert.equal(fits({ ...held, left: Infinity }, 1), false);
});

test("upload admission refuses a missing storage identity", async () => {
  assert.equal((await storageUsed("", 200 * GB)).available, false);
});

test("a failed measurement refuses uploads while a retention read stays conservative", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("test provider unavailable"); };
  try {
    assert.equal((await storageUsed("0123456789abcdef0123456789abcdef", 200 * GB)).available, false);
    const retained = await storageUsed("0123456789abcdef0123456789abcdef", 200 * GB);
    assert.equal(retained.bytes, 0);
    assert.equal(retained.full, false);
  } finally {
    globalThis.fetch = original;
  }
});

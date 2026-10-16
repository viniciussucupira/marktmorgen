/**
 * The brake on storage, and the two things it must never do.
 *
 * Storage was the one cost with no measurement of any kind. Nothing bounded
 * what a store could hold except 2,000 products times a 5 GB file — ten
 * terabytes, about $230 a month, for ever, from a creator paying $29,
 * whether or not they ever sold anything.
 *
 * What it must never do is show up as a plan limit. Stan publishes no
 * storage limit, no file-count limit and no bandwidth limit; their only
 * published figure is 5 GB a file, which is also ours. A quota on our
 * pricing page would lose us a line to them to guard against a number no
 * honest creator reaches. So it is one high figure, the same on every plan,
 * and it lives nowhere a plan is chosen.
 *
 * And it must never reach a buyer. It is checked when a creator uploads,
 * which is the one moment where saying no costs nobody anything.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { STORAGE_BRAKE_BYTES, storageWords } from "@/lib/storage-quota";

const GB = 1024 * 1024 * 1024;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

test("the brake is set where a year of sitting on it is still profitable", () => {
  const monthlyCost = (STORAGE_BRAKE_BYTES / GB) * 0.023;
  // What a $29 subscription leaves after the card fee, per lib/delivery.ts.
  assert.ok(
    monthlyCost < 27.86 / 4,
    `a store parked on the brake costs $${monthlyCost.toFixed(2)} a month. Storage is one of four ` +
      "costs a single store can run up at once, so on its own it has to stay well under a quarter " +
      "of what the cheapest plan brings in — otherwise the four together put the plan into a loss.",
  );
});

test("it is far above anything a store selling its own work would hold", () => {
  assert.ok(
    STORAGE_BRAKE_BYTES >= 100 * GB,
    "set this low enough to touch a real creator and it stops being a brake and becomes a plan limit",
  );
});

test("it is the same on every plan, so it cannot drift into being a plan feature", () => {
  const src = readFileSync(join(process.cwd(), "lib/storage-quota.ts"), "utf8");
  assert.doesNotMatch(
    src,
    /Record<\s*Tier/,
    "a brake that differs by plan is a plan limit in disguise, and ends up on the pricing page",
  );
});

test("it appears nowhere a creator is choosing or comparing a plan", () => {
  const selling = [
    "components/home-parts.tsx",
    "app/page.tsx",
    "lib/site-pages.ts",
    "lib/feature-pages.ts",
  ];
  for (const file of selling) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    assert.doesNotMatch(
      src,
      /STORAGE_BRAKE_BYTES|storageUsed/,
      `${file} is where a plan is sold. Stan publishes no storage limit; ours must not appear here.`,
    );
  }
});

test("only an upload is ever refused by it, never a download", () => {
  const callers = walk(join(process.cwd(), "app"))
    .concat(walk(join(process.cwd(), "lib")))
    .map((file) => relative(process.cwd(), file).replaceAll("\\", "/"))
    .filter((f) => !f.endsWith("lib/storage-quota.ts"))
    .filter((f) => /storageUsed/.test(readFileSync(f, "utf8")));

  assert.deepEqual(
    callers.map((f) => f.replace(process.cwd() + "/", "")),
    // The three doors an upload goes through: into the host's file store,
    // to the video service for a lesson's video (lib/stream.ts), and into
    // the file store that charges nothing for a download (lib/vault.ts).
    // And the two places a store whose plan has ended is measured against
    // the room of a store with no plan: the daily job that gives what it
    // keeps a date (lib/plan-closing.ts), and the studio, which shows its
    // owner that date. Neither is a door a buyer comes through.
    ["app/api/store/file/route.ts", "app/api/store/stream/route.ts", "app/studio/page.tsx", "lib/plan-closing.ts", "lib/vault-storage.ts"],
    "what a store keeps is measured where an upload is let in, and for a store whose plan has ended. No download is ever refused by it.",
  );
  const door = readFileSync(join(process.cwd(), "app/api/store/vault/route.ts"), "utf8");
  assert.match(door, /openReservedVault/);
  assert.doesNotMatch(door, /await openVaultUpload/);
});

test("the figures read as figures", () => {
  assert.equal(storageWords(STORAGE_BRAKE_BYTES), "200 GB");
  assert.equal(storageWords(1.5 * 1024 * GB), "1.5 TB");
  assert.equal(storageWords(2.5 * GB), "2.5 GB");
  assert.equal(storageWords(40 * GB), "40 GB");
  assert.equal(storageWords(900 * 1024 * 1024), "900 MB");
});

test("the creator is told what to do about it, in the studio", () => {
  for (const file of ["components/product-editor.tsx", "components/course-editor.tsx"]) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    assert.match(src, /storage_full:/, `${file} should say what a full store means and what to do`);
    assert.match(
      src,
      /storage_full:[^\n]*nothing already bought is affected/,
      "and should say plainly that nobody's purchase is touched",
    );
  }
});

test("every brake that acts on its own is shown before it acts", () => {
  // Section 5 of the Terms promises each limit is one you can see while you
  // use the Services, and that none is discovered by being enforced against
  // you. Both brakes were built and drawn nowhere, which made that sentence
  // untrue the day it was written. It is a promise about the studio, so the
  // studio is where it is checked.
  const studio = readFileSync(join(process.cwd(), "app/studio/page.tsx"), "utf8");
  assert.match(
    studio,
    /STORAGE_BRAKE_BYTES/,
    "the storage brake must be visible in the studio: the Terms say no limit is found by hitting it",
  );
  assert.match(
    studio,
    /FREE_PAUSE_ABOVE_BYTES/,
    "and so must the point where free downloads pause",
  );

  const terms = readFileSync(join(process.cwd(), "app/terms/page.tsx"), "utf8");
  assert.match(
    terms,
    /None of them is hidden in this document and then discovered by being\s*\n?\s*enforced against you/,
    "and the clause that makes this a promise has to still be there",
  );
});

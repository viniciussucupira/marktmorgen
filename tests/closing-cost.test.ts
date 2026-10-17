/**
 * What a store's closing costs, and what is left of it costs, with nobody
 * paying any more (added 18 October 2026; docs/funded-exposure-review.md,
 * "After the closing day").
 *
 * Up to its closing day a store's files and records are priced once per
 * payment (tests/plan-cost-registry.ts, PER_PAYMENT_LINES: retained-files,
 * retained-data). From that day nothing of it is in the database but what
 * goes by itself, and its tax records are in the file store for their
 * years. This prices each closure at its worst, for the company's
 * post-cancellation exposure, from the ceilings the code holds to by itself:
 *
 *   - its tax records: at most ARCHIVE_LINES_PER_MONTH lines of LINE_BYTES a
 *     month (counted before compression), each year's kept to January 1 of
 *     its eighth year (lib/closing-archive.ts), at R2's storage and operation
 *     rates;
 *   - what is left in the database by itself after the closing days already
 *     priced: each part of a family CLOSING says expires, kept to its end;
 *   - its whole export, ENDED_STORE_EXPORTS times after its plan ended, at
 *     the most its room and its records outside it can make it;
 *   - the deletion of its own records: a command for every 200 of its keys,
 *     one for every thousand entries its followers read, two for each of its
 *     contacts (their library across stores), and every byte read once.
 *
 * And it holds the export a paying store takes from its studio figure to
 * what the export costs, so the export never spends more than the figure.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { TIERS, type Tier } from "@/lib/plan";
import { CLOSING } from "@/lib/data-families";
import { ARCHIVE_LINES_PER_MONTH, ARCHIVE_MONTHS, LINE_BYTES, archiveByteMonths, archiveMaxBytes, pagesPerMonth } from "@/lib/closing-archive";
import { CLOSING_DAYS, ENDED_STORE_EXPORTS, WARN_WEEK_DAYS, CLOSURE_CEILING_USD } from "@/lib/plan-closing-rules";
import { DATA_ROOM_BYTES, NON_PAYING_DATA_ROOM_BYTES } from "@/lib/store-data-rules";
import { EXPORT_COMMANDS, type ExportShape, exportUnits } from "@/lib/store-export";
import { MAX_PRODUCTS } from "@/lib/catalog-rules";
import { MAX_LESSONS } from "@/lib/course";
import { MAX_POSTS } from "@/lib/store-blog";
import { MAX_FORMS } from "@/lib/forms";
import { R2_CLASS_A_MICRO_USD_PER_MILLION, R2_CLASS_B_MICRO_USD_PER_MILLION, R2_STORAGE_MICRO_USD_PER_GB_MONTH } from "@/lib/spend-cost-table";
import { WALK_COUNT } from "@/lib/closed-store-data";
import { COMMAND, DB_BYTE, DB_BYTE_MONTH, UNIT_COST, request } from "./plan-cost-registry";
import { FAMILIES, partPeak, reservePeakBytes } from "./store-data-registry";

const micro = (n: number) => n / 1_000_000;
/** The days of a closing already priced per payment (retained-data). */
const PRICED_DAYS = CLOSING_DAYS + WARN_WEEK_DAYS;
/** The least a key the room counts weighs: its name and ORDER_KEY_BYTES (lib/order-data.ts), at the very least 96 bytes. */
const KEY_FLOOR = 96;
/** The least a contact weighs on the list: an address, its record and its entry. */
const CONTACT_FLOOR = 100;

/** What a store of this tier can keep at its fullest, in the room and outside it. */
const fullest = (tier: Tier) => DATA_ROOM_BYTES[tier] + reservePeakBytes(tier);

/** A whole export at its fullest: the room and what is outside it, every product, lesson, post and form there can be, every contact the room can hold. */
function worstShape(bytes: number): ExportShape {
  const lessons = Math.min(MAX_PRODUCTS * MAX_LESSONS, Math.ceil(bytes / KEY_FLOOR));
  return {
    bytes,
    commands: Math.ceil(EXPORT_COMMANDS.fixed + EXPORT_COMMANDS.product * MAX_PRODUCTS + Math.ceil(lessons / 100) + MAX_PRODUCTS + EXPORT_COMMANDS.post * MAX_POSTS + EXPORT_COMMANDS.form * MAX_FORMS + Math.ceil(bytes / CONTACT_FLOOR / 1000)),
  };
}

/** What one export of this shape costs: its commands and bytes, and its time at 2 GB, a step's ten seconds for every 20 MB. */
export function exportCost(shape: ExportShape): number {
  return request("heavy", shape.commands, shape.bytes) + Math.ceil(shape.bytes / 20_000_000) * request("step", 0);
}

/** A closure's tax records for their whole life. */
function archiveCost(tier: Tier): number {
  const storage = (archiveByteMonths(tier) / 1e9) * micro(R2_STORAGE_MICRO_USD_PER_GB_MONTH);
  const writes = (2 * (ARCHIVE_MONTHS + 1) + (ARCHIVE_MONTHS + 1)) * (micro(R2_CLASS_A_MICRO_USD_PER_MILLION) / 1_000_000);
  const reads = 15 * (micro(R2_CLASS_B_MICRO_USD_PER_MILLION) / 1_000_000);
  return storage + writes + reads;
}

/** What is left by itself past the priced days, each part to its end. */
function remnantCost(tier: Tier): number {
  let byteDays = 0;
  for (const [name, family] of Object.entries(FAMILIES)) {
    const rule = CLOSING[name.slice(0, name.lastIndexOf("@"))];
    const days = rule.how === "expires" ? rule.days : "rest" in rule ? rule.rest ?? 0 : 0;
    if (!days) continue;
    for (const part of family.parts ?? []) if ("per" in part) byteDays += partPeak(part, tier) * Math.max(0, Math.min(days, part.days) - PRICED_DAYS);
  }
  return (byteDays / 30) * DB_BYTE_MONTH;
}

/** The deletion of a closure's own records: its keys, in and outside its room, and its contacts, who are in its room. */
function eraseCost(bytes: number, room: number): number {
  const keys = bytes / KEY_FLOOR;
  const contacts = room / CONTACT_FLOOR;
  return (keys / 200 + keys / 1000 + contacts * 2) * COMMAND + bytes * DB_BYTE;
}

export function closureCost(tier: Tier): { archive: number; remnants: number; exports: number; erase: number; total: number } {
  const bytes = fullest(tier);
  const out = { archive: archiveCost(tier), remnants: remnantCost(tier), exports: ENDED_STORE_EXPORTS * exportCost(worstShape(bytes)), erase: eraseCost(bytes, DATA_ROOM_BYTES[tier]), total: 0 };
  out.total = out.archive + out.remnants + out.exports + out.erase;
  return out;
}

test("a closure's worst cost, every part of it, is under the ceiling the code holds it to", () => {
  for (const tier of TIERS) {
    const c = closureCost(tier);
    console.log(`${tier}: at its fullest ${(fullest(tier) / 1e6).toFixed(1)} MB, its room ${(DATA_ROOM_BYTES[tier] / 1e6).toFixed(0)} MB`);
    console.log(`${tier}: tax records $${c.archive.toFixed(4)} (at most ${(archiveMaxBytes(tier) / 1e6).toFixed(1)} MB before compression), left by itself $${c.remnants.toFixed(4)}, ${ENDED_STORE_EXPORTS} exports $${c.exports.toFixed(4)}, its deletion $${c.erase.toFixed(4)}: $${c.total.toFixed(4)} of $${CLOSURE_CEILING_USD[tier].toFixed(2)}`);
    for (const value of Object.values(c)) assert.ok(Number.isFinite(value) && value >= 0, tier);
    assert.ok(c.total <= CLOSURE_CEILING_USD[tier], `${tier}: a closure costs up to $${c.total.toFixed(4)}`);
  }
  // A free trial's store closes too, at its smaller room, and its records are its sales of the trial.
  const trial = ENDED_STORE_EXPORTS * exportCost(worstShape(NON_PAYING_DATA_ROOM_BYTES.trial)) + eraseCost(NON_PAYING_DATA_ROOM_BYTES.trial, NON_PAYING_DATA_ROOM_BYTES.trial) + archiveCost("creator");
  console.log(`a trial's store: up to $${trial.toFixed(4)}`);
  assert.ok(trial <= CLOSURE_CEILING_USD.creator);
});

test("the records' figures are what the code reads by", () => {
  for (const tier of TIERS) {
    assert.ok(ARCHIVE_LINES_PER_MONTH[tier] >= 2, tier);
    assert.equal(pagesPerMonth(tier), Math.ceil(ARCHIVE_LINES_PER_MONTH[tier] / 100) + 1);
    assert.ok(archiveMaxBytes(tier) >= ARCHIVE_MONTHS * ARCHIVE_LINES_PER_MONTH[tier] * LINE_BYTES);
  }
  assert.equal(ARCHIVE_MONTHS, 96, "the kept years and the year a store closed");
});

test("an export a paying store takes from its studio figure costs no more than the units it takes", () => {
  for (const tier of TIERS) {
    for (const bytes of [0, 1_000, 1_000_000, DATA_ROOM_BYTES[tier], fullest(tier)]) {
      const shape = worstShape(bytes);
      const units = exportUnits(shape);
      assert.ok(units * UNIT_COST.studio >= exportCost(shape), `${tier}, ${bytes} bytes: ${units} units at $${UNIT_COST.studio} for $${exportCost(shape)}`);
    }
  }
});

test("the walk, the company's: what it costs a walk for every million keys the database holds", () => {
  const perWalk = (1_000_000 / WALK_COUNT) * COMMAND + 1_000_000 * 80 * DB_BYTE;
  console.log(`a walk reads a million keys for $${perWalk.toFixed(4)}; at one a day, $${(31 * perWalk).toFixed(3)} a month for every million keys`);
  assert.ok(perWalk < 0.01);
});

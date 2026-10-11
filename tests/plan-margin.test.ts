/**
 * No plan may lose money in its own worst case.
 *
 * Every brake in this system was set on its own, against the question "would
 * a real creator ever reach this?" — and every one of them passed that
 * question. Then the worst cases were added up for the first time and both
 * plans lost money: the $29 one by $31 and the $99 one by $15. A brake is
 * not a brake if the sum of all of them sits above the revenue they protect,
 * and no individual check would ever have noticed, because each number was
 * defensible alone.
 *
 * So the sum is the thing that is checked. These are the real published
 * rates, and they move only when the vendors' do:
 *
 *   Cloudflare R2 storage      $0.015 / GB / month   (files that are sold,
 *   Cloudflare R2 delivery     $0                     lib/vault.ts: sending a
 *                                                     file costs nothing; a
 *                                                     million downloads are
 *                                                     $0.36 in requests)
 *   Bunny Stream storage       $0.02  / GB / month   (lesson videos,
 *   Bunny Stream delivery      $0.005 / GB            lib/stream.ts: $0.01 in
 *                                                     each of the two regions
 *                                                     the library keeps its
 *                                                     files in, and the
 *                                                     volume network it sends
 *                                                     them over; read from
 *                                                     the library's own pages
 *                                                     on October 6, 2026)
 *   Vercel Blob storage        $0.023 / GB / month   (the host's own store,
 *   Vercel Blob data transfer  $0.05 to $0.11 / GB    where sold files were
 *                                                     kept until October 7,
 *                                                     2026)
 *   Resend                     $0.0009 / email
 *   Stripe                     2.9% + $0.30 on each subscription charge
 *
 * What changed on October 7, 2026, and what these figures now count on.
 *
 * A download used to cost five to eleven cents a gigabyte, and the brake on
 * free copies was the dearest line a $29 store had. A sold file now goes to
 * the store that charges nothing to send it, and the door to the dearer one
 * is shut wherever that store is set up and on the paid site always
 * (app/api/store/file), so a missing setting stops an upload instead of
 * bringing the cost back. No plan had been sold before that day, so no
 * paying store has a file in the dearer one. Keeping a file is still worked
 * out at the dearest of the three rates.
 *
 * Which left two things that cost by use. One is visits: every page of a
 * store that is opened is charged for by the host, by the file, by the
 * call and by the command sent to the database, and that was in none of
 * these sums until October 7, 2026, when a hundred thousand visits in a
 * month were found to cost more than the smallest plan had left. A visit is
 * now counted, covered up to a figure by each plan and priced past it
 * (lib/traffic-rules.ts), and what one costs is worked out in
 * tests/traffic-cost.ts from what the live site was measured to do. It
 * counts on one setting nothing here can see: Flat Rate CDN, in the host's
 * billing, which puts the bytes sent inside a fixed tier. It was on when
 * this was written.
 *
 * The other is lesson video, and it is
 * covered and priced by the hour watched (lib/watch-rules.ts). Its worst
 * case is here twice: the hours a plan covers have to fit inside the plan
 * with every other brake at its limit, and an hour past them has to bring in
 * well over what it costs. An hour is costed at the largest size kept, with
 * a quarter added for what a player fetches ahead of what is watched: 6.9
 * megabits for every second counted.
 *
 * Against that, the one clean measure there is. On the live library, on
 * October 7, 2026, a 1080p lesson played once through was counted as 24
 * seconds and took 12.3 megabytes from the video service: a little over 4
 * megabits a second, so the figure above has more than half again over it.
 * The player was also seen to count less than it sent, in a sitting that
 * replayed a video after it had ended (lib/watch.ts); that headroom is what
 * has to carry
 * such sittings, and an hour past the plan goes on paying for itself up to
 * 13.9 megabits for every second counted. These are the two numbers to
 * hold against the video service's own bill once real stores are watching.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PLAN_PRICES, PRO_MONTHLY_EMAILS, SCALE_MONTHLY_EMAILS, TIERS, monthlyEmails, type Cycle, type Tier } from "@/lib/plan";
import { FREE_PAUSE_ABOVE_BYTES } from "@/lib/delivery";
import { STORAGE_BRAKE_BYTES } from "@/lib/storage-quota";
import { AI_MONTHLY } from "@/lib/ai-rules";
import { DELIVERY_ALLOWANCE_BYTES } from "@/lib/delivery";
import { TOP_HEIGHT, viewingBytes } from "@/lib/stream-rules";
import { VIDEO_CENTS_PER_HOUR_OVER, VIDEO_HOURS_INCLUDED } from "@/lib/watch-rules";
import { SETUP_STORAGE_BYTES, SETUP_VIDEO_HOURS, TRIAL_STORAGE_BYTES } from "@/lib/plan-standing";
import { CLOSING_DAYS, WARN_WEEK_DAYS } from "@/lib/plan-closing-rules";
import { LONGEST_PAUSE_MONTHS, PAID_MONTHS_BEFORE_PAUSE } from "@/lib/plan-pause-rules";
import { SETUP_VISITS, TRIAL_VISITS, VISITS_INCLUDED, VISIT_CENTS_PER_THOUSAND_OVER } from "@/lib/traffic-rules";
import { visitCost } from "./traffic-cost";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GB = 1024 * 1024 * 1024;

/** Keeping a file, at the dearest of the three stores one may be in. */
const STORAGE_PER_GB = 0.023;
/** Sending a file that is sold: nothing, from the store they are kept in. */
const FILE_DELIVERY_PER_GB = 0;
/** What the video service charges to keep a gigabyte, and to send one. */
const STREAM_STORAGE_PER_GB = 0.02;
const STREAM_DELIVERY_PER_GB = 0.005;
/** What a player fetches beyond what is watched: the next seconds, and a size it then leaves. */
const FETCHED_AHEAD = 1.25;
const PER_EMAIL = 0.0009;
/** A rough, deliberately high figure for one AI draft. */
const PER_DRAFT = 0.015;
/** Receipts, file delivery and login links, which nothing caps. Set high. */
const TRANSACTIONAL: Record<Tier, number> = { creator: 2_000, pro: 5_000, scale: 10_000 };

/**
 * What reaches us for one month of a plan, after Stripe takes its cut: one
 * monthly charge, or a twelfth of the yearly one.
 */
function netOf(tier: Tier, cycle: Cycle = "month"): number {
  const gross = PLAN_PRICES[tier][cycle] / 100;
  const kept = gross - (gross * 0.029 + 0.3);
  return cycle === "year" ? kept / 12 : kept;
}

/** What an hour of video watched costs us at most: the largest size kept, and what is fetched ahead of it. */
function hourCost(): number {
  const gigabytes = (viewingBytes(3600, TOP_HEIGHT, Number.POSITIVE_INFINITY) / GB) * FETCHED_AHEAD;
  return gigabytes * STREAM_DELIVERY_PER_GB;
}

/** The hours of video a plan covers, all of them watched. */
function videoCost(): number {
  return VIDEO_HOURS_INCLUDED * hourCost();
}

/** The visits a plan covers, all of them made, each by the heavy visitor a visit is costed as. */
function visitsCost(tier: Tier): number {
  return VISITS_INCLUDED[tier] * visitCost();
}

/** Everything one store on this plan can run up in a month, at every limit at once. */
function worstCost(tier: Tier): number {
  const storage = (STORAGE_BRAKE_BYTES / GB) * STORAGE_PER_GB;
  const free = (FREE_PAUSE_ABOVE_BYTES / GB) * FILE_DELIVERY_PER_GB;
  const video = videoCost();
  const email = monthlyEmails(tier) * PER_EMAIL;
  const drafts = AI_MONTHLY[tier] * PER_DRAFT;
  const receipts = TRANSACTIONAL[tier] * PER_EMAIL;
  return storage + free + video + visitsCost(tier) + email + drafts + receipts;
}

test("the email each plan may send is the number that is published", () => {
  assert.deepEqual(TIERS.map(monthlyEmails), [0, PRO_MONTHLY_EMAILS, SCALE_MONTHLY_EMAILS]);
});

for (const tier of TIERS) {
  test(`${tier}: every brake at its limit at once still turns a profit`, () => {
    const cost = worstCost(tier);
    const net = netOf(tier);
    assert.ok(
      cost < net,
      `${tier} costs $${cost.toFixed(2)} at its worst and brings in $${net.toFixed(2)}. ` +
        "A plan that loses money in its own worst case has no brakes, only decoration.",
    );
  });

  test(`${tier}: the margin left in that worst case is a real one`, () => {
    const cost = worstCost(tier);
    const net = netOf(tier);
    const margin = (net - cost) / net;
    assert.ok(
      margin >= 0.45,
      `${tier} keeps ${(margin * 100).toFixed(0)}% in its worst case. Scraping past zero is not ` +
        "the goal: the brakes exist so the floor is comfortable, not survivable.",
    );
  });

  test(`${tier}: no single brake is big enough to swallow the plan by itself`, () => {
    const net = netOf(tier);
    const lines: [string, number][] = [
      ["storage", (STORAGE_BRAKE_BYTES / GB) * STORAGE_PER_GB],
      ["free downloads", (FREE_PAUSE_ABOVE_BYTES / GB) * FILE_DELIVERY_PER_GB],
      ["video", videoCost()],
      ["visits", visitsCost(tier)],
      ["email", monthlyEmails(tier) * PER_EMAIL],
      ["AI drafts", AI_MONTHLY[tier] * PER_DRAFT],
    ];
    for (const [name, cost] of lines) {
      assert.ok(
        cost <= net / 2,
        `${tier}: ${name} alone is $${cost.toFixed(2)} of $${net.toFixed(2)}. One line taking half ` +
          "the plan leaves nothing for the others.",
      );
    }
  });
}

for (const tier of TIERS) {
  test(`${tier}: paid by the year, the worst month still leaves a real margin`, () => {
    // A year paid at once is a discount, so each of its months brings in
    // less, against the same worst case. The floor is lower than the monthly
    // one and still far from scraping by; the plans that were on sale before
    // this was first added up sit at 44%, and none may go under 40%.
    const cost = worstCost(tier);
    const net = netOf(tier, "year");
    const margin = (net - cost) / net;
    assert.ok(
      margin >= 0.4,
      `${tier}, yearly: costs $${cost.toFixed(2)} in its worst month against $${net.toFixed(2)} a month, ` +
        `which keeps ${(margin * 100).toFixed(0)}%.`,
    );
  });
}

test("Scale keeps more than Pro does in its own worst month, monthly and yearly", () => {
  // The dearest plan is the one a heavy sender is on, so it is the last one
  // that may be allowed to be the thinnest.
  for (const cycle of ["month", "year"] as const) {
    const kept = (tier: Tier) => (netOf(tier, cycle) - worstCost(tier)) / netOf(tier, cycle);
    assert.ok(kept("scale") >= kept("pro"), `${cycle}: Scale keeps ${(kept("scale") * 100).toFixed(1)}% and Pro ${(kept("pro") * 100).toFixed(1)}%`);
  }
});

test("a lesson video kept by the video service never costs more to keep than the storage brake allows for", () => {
  // The storage brake counts a video at the service byte for byte with a
  // file in the file store (lib/storage-quota.ts), and the worst case above
  // is worked out at the dearest rate a file is kept at.
  assert.ok(STREAM_STORAGE_PER_GB <= STORAGE_PER_GB, "keeping a video at the service must not cost more than the rate storage is worked out at");
});

test("an hour of video past what a plan covers brings in well over what it costs", () => {
  // The one thing charged by use. What reaches us for an hour is the price
  // less the card fee's percentage (its thirty cents is on the invoice the
  // hour is added to, and is paid with the plan either way).
  const kept = (VIDEO_CENTS_PER_HOUR_OVER / 100) * (1 - 0.029);
  const cost = hourCost();
  const margin = (kept - cost) / kept;
  assert.ok(
    margin >= 0.45,
    `an hour past the plan brings in $${kept.toFixed(4)} and costs $${cost.toFixed(4)}, which keeps ${(margin * 100).toFixed(0)}%. ` +
      "A price near what the hour costs is a slower loss.",
  );
});

test("a thousand visits past what a plan covers bring in well over what they cost", () => {
  // The other thing charged by use, held to the same floor as an hour of
  // video: what reaches us for a thousand visits, against a thousand of the
  // heavy visitor a visit is costed as.
  const kept = (VISIT_CENTS_PER_THOUSAND_OVER / 100) * (1 - 0.029);
  const cost = 1000 * visitCost();
  const margin = (kept - cost) / kept;
  assert.ok(
    margin >= 0.45,
    `a thousand visits past the plan bring in $${kept.toFixed(4)} and cost $${cost.toFixed(4)}, which keeps ${(margin * 100).toFixed(0)}%. ` +
      "A price near what the visits cost is a slower loss.",
  );
});

test("a store nobody can charge cannot be visited past the visits it has", () => {
  // A visit past the plan is paid for by a line on an invoice. A store in
  // its free trial has no invoice yet, and one with no plan has none at
  // all, so the visits themselves are the limit there: its pages rest at
  // them (lib/traffic.ts; tests/traffic.test.ts holds where and for whom).
  for (const page of ["app/[handle]/page.tsx", "app/[handle]/p/[product]/page.tsx"]) {
    assert.match(readFileSync(join(process.cwd(), page), "utf8"), /if \(await isResting\(store\)\) return <StoreResting store=\{store\} \/>;/, `${page} must rest with its store`);
  }
  assert.equal(TRIAL_VISITS, VISITS_INCLUDED.creator, "a trial of any plan has the smallest plan's visits: it has paid for none");
});

test("a store nobody can charge cannot watch past the hours it has", () => {
  // An hour past the plan is paid for by a line on an invoice. A store in
  // its free trial has no invoice yet, and one with no plan has none at all,
  // so the hours themselves are the limit there: its video is paused at
  // them (lib/plan-standing.ts has the figures, tests/plan-standing.test.ts
  // holds them).
  const learn = readFileSync(join(process.cwd(), "lib/learn.ts"), "utf8");
  assert.match(learn, /limit !== null && folder && \(await watchedIn\(folder\)\) >= limit/, "the pause for a store with no plan to charge must stay");
  const page = readFileSync(join(process.cwd(), "app/[handle]/course/[product]/[lesson]/page.tsx"), "utf8");
  assert.match(page, /lessonVideo\(lesson\.video, videoLimitFor\(store\)\)/, "and the lesson page must be the one that asks what the store's hours are");
});

test("a store that pays nothing can cost next to nothing", () => {
  // Not a plan, so not in the sums above; set against zero instead. What a
  // store with no plan may keep, at the dearest rate a file is kept at, and
  // the hours its video may be watched, at the most an hour can cost.
  const kept = (SETUP_STORAGE_BYTES / GB) * STORAGE_PER_GB;
  const watched = SETUP_VIDEO_HOURS * hourCost();
  // And the visits its pages are shown for before they rest.
  const visited = SETUP_VISITS * visitCost();
  assert.ok(kept + watched + visited < 0.4, `a store with no plan can cost $${(kept + watched + visited).toFixed(2)} a month`);
  // A free trial lasts two weeks with a card on file. All it may keep,
  // every hour it may play and every visit it may have, in one month:
  const trial = (TRIAL_STORAGE_BYTES / GB) * STORAGE_PER_GB + videoCost() + TRIAL_VISITS * visitCost();
  assert.ok(trial < 8, `a trial at every limit costs $${trial.toFixed(2)} in a month`);
});

test("a store whose plan ended stops costing more than a store with no plan, on a day that is set", () => {
  // What a store keeps goes on costing after its plan ends, and until
  // lib/plan-closing.ts that had no end. Now what it keeps past the room of
  // a store with no plan is removed CLOSING_DAYS after the plan ended, and
  // never later than a week past that for a last notice that went out late
  // (tests/plan-closing.test.ts holds the days and what is done on them).
  const months = (CLOSING_DAYS + WARN_WEEK_DAYS) / 30;
  // The dearest store there can be: it pays for one month, runs every limit
  // of its plan in it, cancels, and leaves all a paid plan may keep here
  // until its day. That one month has to have paid for all of it.
  const kept = (STORAGE_BRAKE_BYTES / GB) * STORAGE_PER_GB * months;
  for (const tier of TIERS) {
    const cost = worstCost(tier) + kept;
    const net = netOf(tier);
    assert.ok(
      cost < net,
      `${tier}: one month at every limit, and then everything kept to its day, costs $${cost.toFixed(2)} against the $${net.toFixed(2)} that month brought in. ` +
        "The days a store has after its plan ends are paid for by its last month, or by nobody.",
    );
  }
  // A free trial that filled all a trial may keep, and never paid: a card
  // was on file, and this is the whole of what it can leave behind.
  const trial = (TRIAL_STORAGE_BYTES / GB) * STORAGE_PER_GB * months;
  assert.ok(trial < 3, `keeping an unpaid trial's files to its day costs $${trial.toFixed(2)} once`);
  // After the day, either is a store with no plan: the test above.
  const closing = readFileSync(join(process.cwd(), "lib/plan-closing.ts"), "utf8");
  assert.match(closing, /if \(held <= SETUP_STORAGE_BYTES\)/, "the room a closing store is held to must be the room of a store with no plan");
  const job = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as { crons: { path: string }[] };
  assert.ok(job.crons.some((cron) => cron.path === "/api/cron/closing"), "and the job that does it must be scheduled, or the day never comes");
});

test("the video a plan covers is said in hours a creator can check", () => {
  // Published in the studio, the Terms and the price list (tests/watch.test.ts
  // holds the pages to these two numbers). Stated here so the figure cannot
  // be raised without this file's sums being run against it.
  assert.equal(VIDEO_HOURS_INCLUDED, 400);
  assert.equal(VIDEO_CENTS_PER_HOUR_OVER, 3);
});

test("the free-download brake is smaller than the allowance that is published", () => {
  // The published figure covers paid and free together. Free copies — which
  // nobody paid for — cannot be allowed to eat the whole of it.
  assert.ok(
    FREE_PAUSE_ABOVE_BYTES < DELIVERY_ALLOWANCE_BYTES,
    "giving things away must not be able to consume the whole month's delivery on its own",
  );
});

test("a buyer's download is bounded by nothing, and that is on purpose", () => {
  // Stated here so that nobody ever "fixes" it. Somebody paid the creator for
  // that file. It is also why a sold file is kept where sending it costs
  // nothing: the one delivery that may never be refused is the one that must
  // not be able to run up a bill.
  const delivery = readFileSync(join(process.cwd(), "lib/delivery.ts"), "utf8");
  assert.match(
    delivery,
    /What it deliberately does NOT do is stop a delivery/,
    "the reasoning for never blocking a paid download must stay written down",
  );
});

test("a break from the plan is paid for by the months before it, at its longest", () => {
  // The dearest store a break can leave behind: it pays for the months a
  // break needs before it (lib/plan-pause-rules.ts), runs every limit of its
  // plan in each, takes the longest break with everything a paid plan may
  // keep still kept, and then does not come back, so what it keeps runs on
  // past the break until its last two notices are out (lib/plan-pause.ts
  // holds the closing back while the break runs, and lets it go on after).
  // What those months paid has to cover all of it, with a quarter to spare.
  const months = PAID_MONTHS_BEFORE_PAUSE;
  const afterMonths = (WARN_WEEK_DAYS * 2) / 30;
  const kept = (STORAGE_BRAKE_BYTES / GB) * STORAGE_PER_GB * (LONGEST_PAUSE_MONTHS + afterMonths);
  for (const tier of TIERS) {
    const cost = months * worstCost(tier) + kept;
    const net = months * netOf(tier);
    const margin = (net - cost) / net;
    assert.ok(
      margin >= 0.25,
      `${tier}: ${months} months at every limit, a ${LONGEST_PAUSE_MONTHS}-month break and the days after it cost $${cost.toFixed(2)} against the $${net.toFixed(2)} those months brought in, keeping ${(margin * 100).toFixed(0)}%.`,
    );
  }
});

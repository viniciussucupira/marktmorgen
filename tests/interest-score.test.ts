/**
 * A contact's interest, scored from what they did with the store (268 [KT2],
 * unit 1; lib/interest-score.ts; added 1 November 2026). Checked: each rule
 * gives its points and stops at its cap; every point comes with its reason;
 * recency windows hold at their edges; nothing for opens exists; the words
 * say counts, not predictions.
 */
import { readFileSync } from "node:fs";
import { INTEREST_MOST, INTEREST_RULES, interestScore, type InterestSignals } from "@/lib/interest-score";
import { done, is, part } from "./check";

const NOW = Date.UTC(2026, 10, 1);
const DAY = 86_400_000;
const none: InterestSignals = { orders: 0, lastBought: 0, signedUpFree: false, clicks90: 0, lastSeenInCommunity: 0 };

function main(): void {
  part("Each rule, its points, its cap");
  is("nothing done: 0, no reasons", interestScore(none, NOW), { score: 0, reasons: [] });
  is("each purchase 3, up to 5", [1, 5, 9].map((orders) => interestScore({ ...none, orders }, NOW).score), [3, 15, 15]);
  is("bought in the last 90 days: 2 more, at its edge", [interestScore({ ...none, orders: 1, lastBought: NOW - 90 * DAY }, NOW).score, interestScore({ ...none, orders: 1, lastBought: NOW - 91 * DAY }, NOW).score], [5, 3]);
  is("signed up free: 2", interestScore({ ...none, signedUpFree: true }, NOW).score, 2);
  is("each link used, 1, up to 5", [1, 5, 40].map((clicks90) => interestScore({ ...none, clicks90 }, NOW).score), [1, 5, 5]);
  is("in the community in 30 days: 2, at its edge", [interestScore({ ...none, lastSeenInCommunity: NOW - 30 * DAY }, NOW).score, interestScore({ ...none, lastSeenInCommunity: NOW - 31 * DAY }, NOW).score], [2, 0]);
  is("the most anybody can have", [INTEREST_MOST, interestScore({ orders: 9, lastBought: NOW, signedUpFree: true, clicks90: 9, lastSeenInCommunity: NOW }, NOW).score], [26, 26]);

  part("Every point with its reason");
  const all = interestScore({ orders: 7, lastBought: NOW - DAY, signedUpFree: true, clicks90: 2, lastSeenInCommunity: NOW - DAY }, NOW);
  is("the reasons add up to the score", all.reasons.reduce((n, r) => n + r.points, 0), all.score);
  is("said as what happened", all.reasons.map((r) => r.words), ["Bought 5 times or more", "Bought in the last 90 days", "Signed up for something free", "Used 2 links in your emails in the last 90 days", "In your community in the last 30 days"]);
  is("bad input never adds", interestScore({ orders: -3, lastBought: -1, signedUpFree: false, clicks90: Number.NaN, lastSeenInCommunity: 0 }, NOW).score, 0);

  part("What it never uses or says");
  const source = readFileSync("lib/interest-score.ts", "utf8");
  const signalsType = /export type InterestSignals = \{[\s\S]*?\n\};/.exec(source)?.[0] ?? "";
  is("no signal for an email opened among the inputs", [signalsType.length > 50, /open/i.test(signalsType)], [true, false]);
  is("no prediction in any rule or reason", /will|likely|predict|expect|future|risk|hot lead|cold/i.test(JSON.stringify(INTEREST_RULES) + JSON.stringify(all)), false);
}

main();
done();

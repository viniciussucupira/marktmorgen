/**
 * "Something's not working" (491 [PP2], unit 1, lib/checkup-rules.ts; added
 * 1 November 2026). Checked:
 *
 *   - every check says "not checked" when its reader could not answer, and
 *     never "ok" then;
 *   - a problem always has what was found, what happens if it is left, and a
 *     fix: a studio page, or the exact place outside it;
 *   - a part the store does not use is left out, not called fine;
 *   - the parts with no reader yet are always "not checked";
 *   - problems come first, then what was not checked, then what is fine;
 *   - the line at the top never says all is well while anything was not
 *     checked;
 *   - no model is asked and nothing is fetched.
 */
import { readFileSync } from "node:fs";
import { checkoutCheck, checkupSummary, domainCheck, emailCheck, notCheckedYet, orderChecks, stripeCheck, type Check } from "@/lib/checkup-rules";
import { pauseForSending } from "@/lib/mail-health";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const NOW = Date.UTC(2026, 10, 1, 12);
const SECONDS = Math.floor(NOW / 1000);

async function main(): Promise<void> {
  part("Payments");
  is("not connected: a problem, with the way to connect", [stripeCheck(false, null).state, stripeCheck(false, null).fix], ["problem", { kind: "studio", href: "/studio#stripe", label: "Open your Stripe connection" }]);
  is("Stripe could not be asked: not checked, never fine", stripeCheck(true, null).state, "not-checked");
  is("details past due: a problem fixed in the creator's own Stripe dashboard", [stripeCheck(true, { chargesEnabled: true, detailsSubmitted: false }).state, stripeCheck(true, { chargesEnabled: true, detailsSubmitted: false }).fix?.kind], ["problem", "outside"]);
  is("card payments off: a problem", stripeCheck(true, { chargesEnabled: false, detailsSubmitted: true }).state, "problem");
  is("both: payments already off is said, not only that they may stop", stripeCheck(true, { chargesEnabled: false, detailsSubmitted: false }).found.startsWith("Stripe has turned off card payments"), true);
  is("on: fine, saying what Stripe said", [stripeCheck(true, { chargesEnabled: true, detailsSubmitted: true }).state, stripeCheck(true, { chargesEnabled: true, detailsSubmitted: true }).found], ["ok", "Stripe says your account can take card payments."]);

  part("Your domain");
  is("no domain of its own: left out, not called fine", domainCheck(null, null), null);
  is("Vercel could not be asked: not checked", domainCheck("harborkitchen.com", null)?.state, "not-checked");
  is("not live: a problem, and the marktmorgen.com address still works", [domainCheck("harborkitchen.com", { live: false, records: [] })?.state, domainCheck("harborkitchen.com", { live: false, records: [] })?.ifLeft?.includes("marktmorgen.com address still works")], ["problem", true]);
  is("live: fine", domainCheck("harborkitchen.com", { live: true, records: [] })?.state, "ok");
  const gone = domainCheck("harborkitchen.com", "gone");
  is("no longer on the project: a problem, with the way to connect it again (unit 2)", [gone?.state, gone?.fix?.kind === "studio" && gone.fix.href, gone?.ifLeft?.includes("marktmorgen.com address still works")], ["problem", "/studio#domain", true]);

  part("Email to your list");
  is("the pause could not be read: not checked", emailCheck(undefined, NOW).state, "not-checked");
  is("no pause, or one already over (its end in seconds, as lib/mail-health.ts keeps it): fine", [emailCheck(null, NOW).state, emailCheck({ reason: "bounces", until: SECONDS - 1 }, NOW).state], ["ok", "ok"]);
  const paused = emailCheck({ reason: "complaints", until: Date.UTC(2026, 10, 8) / 1000 }, NOW);
  is("paused: a problem, saying why and until when, and that receipts still go", [paused.state, paused.found.includes("marked your emails as spam"), paused.ifLeft?.includes("November 8 (UTC)"), paused.ifLeft?.includes("Sign-in links and receipts still go out")], ["problem", true, true, true]);

  // Read as the screen will read it: a real pause, kept by lib/mail-health.ts in seconds, through pauseForSending.
  redis.clear();
  await redis.pipeline([["SET", "nl:mail:paused:list01", JSON.stringify({ reason: "bounces", until: SECONDS + 7 * 86_400, sent: 400, count: 30 })]]);
  const real = emailCheck(await pauseForSending("list01", NOW), NOW);
  is("a pause read by pauseForSending is a problem, ending on the right day", [real.state, real.ifLeft?.includes("November 8 (UTC)")], ["problem", true]);
  is("no pause kept: fine", emailCheck(await pauseForSending("list02", NOW), NOW).state, "ok");

  part("Checkout");
  is("the refusals could not be read: not checked", checkoutCheck(null).state, "not-checked");
  is("none in 7 days: fine", checkoutCheck({ week: 0, last: null }).state, "ok");
  const refused = checkoutCheck({ week: 3, last: { message: "Your account cannot currently make live charges." } });
  is("refused: a problem, with Stripe's own words", [refused.state, refused.found], ["problem", 'Stripe would not open a checkout 3 times in the last 7 days. The last time it said: "Your account cannot currently make live charges."']);
  is("once is said as once", checkoutCheck({ week: 1, last: null }).found, "Stripe would not open a checkout once in the last 7 days.");

  part("Parts with no reader yet");
  is("the plan's limits and disputes: always not checked", [notCheckedYet("limits").state, notCheckedYet("disputes").state], ["not-checked", "not-checked"]);
  is("disputes points to no studio page that does not list them (unit 2)", [notCheckedYet("disputes").fix, notCheckedYet("disputes").found.includes("Stripe dashboard")], [undefined, true]);

  part("Every problem says what happens and how to fix it");
  const all: Check[] = [
    stripeCheck(false, null),
    stripeCheck(true, { chargesEnabled: true, detailsSubmitted: false }),
    stripeCheck(true, { chargesEnabled: false, detailsSubmitted: true }),
    domainCheck("harborkitchen.com", { live: false, records: [] })!,
    emailCheck({ reason: "bounces", until: SECONDS + 86_400 }, NOW),
    checkoutCheck({ week: 2, last: null }),
  ];
  is("each has a cause, a consequence and a fix", all.every((c) => c.state === "problem" && c.found.length > 10 && (c.ifLeft?.length ?? 0) > 10 && c.fix !== undefined), true);
  is("each fix in the studio is a studio path", all.flatMap((c) => (c.fix?.kind === "studio" ? [c.fix.href] : [])).every((href) => href.startsWith("/studio")), true);
  is("no check is fine with a fix or a consequence attached", [stripeCheck(true, { chargesEnabled: true, detailsSubmitted: true }), emailCheck(null), checkoutCheck({ week: 0, last: null })].every((c) => !c.fix && !c.ifLeft), true);

  part("The order and the line at the top");
  const shown = orderChecks([emailCheck(null), notCheckedYet("limits"), domainCheck(null, null), checkoutCheck({ week: 1, last: null }), stripeCheck(true, null)]);
  is("problems first, then not checked, then fine; a part not used is gone", shown.map((c) => `${c.id}:${c.state}`), ["checkout:problem", "stripe:not-checked", "limits:not-checked", "email:ok"]);
  is("problems and unchecked are both counted", checkupSummary(shown), "1 problem found, 2 not checked.");
  is("never all well while something was not checked", checkupSummary(orderChecks([emailCheck(null), notCheckedYet("disputes")])), "No problem found in what we checked; 1 not checked.");
  is("nothing at all is not \"no problem\"", checkupSummary([]), "Nothing was checked.");
  is("all checked and fine: said only then", checkupSummary([emailCheck(null), checkoutCheck({ week: 0, last: null })]), "We checked everything listed here and found no problem.");

  part("No model, no request");
  const source = readFileSync("lib/checkup-rules.ts", "utf8");
  is("it reaches for nothing that could send or ask a model", /\bfetch\(|import\(|from "@\/lib\/(ai|redis|stripe)/.test(source), false);
  done();
}

void main();

/**
 * The tax gate and the deemed-supplier gate (18 October 2026).
 *
 * Since 18 October 2026 the owner uses no accountant: a tax doubt is closed
 * by an official text or by a consultation answer recorded with its date and
 * source (docs/tax-consultations.md, lib/tax-gate.ts CONSULTATION_ANSWERS),
 * or it stays at the reading with more tax (rule 19). And EU VAT's art. 9a
 * (Implementing Regulation 282/2011) makes Marktmorgen the supplier of what a
 * store sells electronically to an EU consumer (docs/eu-vat-article-9a.md).
 * What is checked:
 *
 *   - no flag an accountant's word could turn exists anywhere, and no page,
 *     comment or rule says an accountant confirms anything;
 *   - the gate reading is the one with every tax stacked while EU hosting is
 *     not live, and the after-design reading is refused until it is;
 *   - a recorded consultation answer carries its question, authority, date,
 *     source and reading;
 *   - nothing is on sale while a published plan misses 60% under the gate
 *     reading with nothing used;
 *   - art. 9a is one more reason nothing is on sale: no plan can start and no
 *     store's checkout can open while the EU, UK, US and other records are
 *     missing, and the reasons name art. 9a;
 *   - the tax documents say what the code does and count what they list.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import * as Gate from "@/lib/tax-gate";
import {
  CONSULTATION_ANSWERS, EU_HOSTING_CONFIRMED, GATE_READING_ID, TAX_QUESTIONS,
  consultationProblems, gateProblems, gateReading, taxGateValid, type ConsultationAnswer,
} from "@/lib/tax-gate";
import {
  DEEMED_SUPPLIER_JURISDICTIONS, DEEMED_SUPPLIER_RECORDS, deemedSupplierProblems, deemedSupplierReady, type DeemedSupplierRecord,
} from "@/lib/deemed-supplier";
import { EU_HOSTING_READING, MOST_TAX_READING, unitUnder } from "@/lib/receiving-costs";
import { PUBLISHED_PLAN_PRICES, TIERS } from "@/lib/plan";
import { ASSISTANT_ON_SALE, PLANS_ON_SALE } from "@/lib/opening";
import { canSell } from "@/lib/store-checkout";
import type { Store } from "@/lib/store";
import { done, is, part } from "./check";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(join(root, dir))) {
    const path = `${dir}/${name}`;
    if (statSync(join(root, path)).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|md|mjs)$/.test(name)) out.push(path);
  }
  return out;
}

part("No accountant (owner, 18 October 2026)");
const OLD_FLAG = ["ACCOUNTANT", "CONFIRMATION"].join("_");
is("the gate module has no accountant flag", OLD_FLAG in Gate, false);
const sources = [...walk("lib"), ...walk("app"), ...walk("scripts").filter((f) => !f.endsWith(".py")), ...walk("tests").filter((f) => !f.endsWith("tax-gate.test.ts"))];
is("no source file declares the old flag", sources.filter((f) => read(f).includes(OLD_FLAG)), []);
// "accountant" may be written only to say there is none.
const allowed = /\b(no|not to use an|uses no|without an?)\s+accountant\b/i;
const pages = ["AGENTS.md", "CLAUDE.md", ...walk("docs"), ...walk("lib"), ...walk("app")];
const said = pages.flatMap((file) =>
  read(file)
    .split("\n")
    .map((line, i) => ({ file, line: i + 1, text: line }))
    .filter(({ text }) => /accountant/i.test(text) && text.replace(new RegExp(allowed.source, "gi"), "").match(/accountant/i)),
);
is("no rule, page or comment leaves a doubt for an accountant to close", said.map(({ file, line }) => `${file}:${line}`), []);

part("The gate reading");
is("while EU hosting is not live the gate is the reading with every tax stacked", [EU_HOSTING_CONFIRMED, GATE_READING_ID, gateReading() === MOST_TAX_READING], [false, "most-tax", true]);
is("and the flag stays false in this change", read("lib/tax-gate.ts").includes("export const EU_HOSTING_CONFIRMED = false;"), true);
is("the gate setting in force is accepted", gateProblems(GATE_READING_ID, EU_HOSTING_CONFIRMED), []);
is("the after-design reading is refused while EU hosting is not live", gateProblems("most-tax-after-design", false).length > 0, true);
is("and accepted once it is", gateProblems("most-tax-after-design", true), []);
is("an unknown reading is refused", gateProblems("lenient" as never, true).length > 0, true);
is("the after-design reading is the receiving model's EU hosting one", [EU_HOSTING_READING.profitTaxBps, EU_HOSTING_READING.revenueTaxBps, EU_HOSTING_READING.salesTaxInsideBps], [2_868, 500, 0]);
is("the most-tax reading stacks every tax", [MOST_TAX_READING.profitTaxBps, MOST_TAX_READING.revenueTaxBps, MOST_TAX_READING.salesTaxInsideBps], [7_818, 500, 2_700]);

part("A consultation answer is recorded whole");
is("every recorded answer is complete", consultationProblems(), []);
is("none is recorded yet", CONSULTATION_ANSWERS.length, 0);
const good: ConsultationAnswer = { question: 10, authority: "Prefeitura de Fortaleza", date: "2027-02-01", source: "SEFIN, processo nº 0000/2027", reading: "ISS not due" };
is("a complete answer passes", consultationProblems([good]), []);
is("an answer without its source, with an unknown authority, a bad date or no such question does not", consultationProblems([
  { ...good, source: " " },
  { ...good, authority: "an accountant" as never },
  { ...good, date: "1 Feb 2027" },
  { ...good, question: TAX_QUESTIONS + 1 },
]).length, 4);
is("so the gate's setting is valid today", taxGateValid(), true);

part("Nothing is on sale while a published plan misses 60% under the gate reading");
const gated = TIERS.flatMap((tier) => (["month", "year"] as const).map((cycle) => ({ id: `${tier}-${cycle}`, unit: unitUnder(PUBLISHED_PLAN_PRICES[tier][cycle], 0, gateReading()) })));
const missing = gated.filter(({ unit }) => !unit.meetsFloor).map(({ id }) => id);
console.log(`  under the gate reading, nothing used: ${gated.map(({ id, unit }) => `${id} ${(unit.netBps / 100).toFixed(2)}%`).join(", ")}`);
is("today every published plan misses, even with nothing used", missing.length, gated.length);
if (missing.length) is("so no plan and no add-on is on sale", [PLANS_ON_SALE, ASSISTANT_ON_SALE], [false, false]);

part("Art. 9a: one more reason nothing is on sale");
const problems = deemedSupplierProblems();
is("no treatment is recorded", DEEMED_SUPPLIER_RECORDS.length, 0);
is("so the deemed-supplier gate is shut", deemedSupplierReady(), false);
is("and its reasons name art. 9a for the EU, and the UK, US states and other countries", [
  problems.some((p) => p.startsWith("EU:") && p.includes("art. 9a") && p.includes("282/2011")),
  problems.some((p) => p.startsWith("UK:")),
  problems.some((p) => p.startsWith("US:")),
  problems.some((p) => p.startsWith("other:")),
], [true, true, true, true]);
if (!deemedSupplierReady()) is("while it is shut no plan can start, whatever the margin review says", PLANS_ON_SALE, false);
is("the release gate reads it", /PLANS_ON_SALE: boolean = [^;]*deemedSupplierReady\(\)/.test(read("lib/opening.ts")), true);
const shop = { stripeAccountId: "acct_1TestOnlyConnected", stripeChargesEnabled: true, subscriptionActive: false, suspended: false } as unknown as Store;
const savedKey = process.env.STRIPE_SECRET_KEY;
process.env.STRIPE_SECRET_KEY = "sk_test_notARealKeyOnlyForTheseChecks";
is("a store with Stripe connected and no plan cannot sell, so no EU consumer can buy from one", canSell(shop), false);
if (savedKey === undefined) delete process.env.STRIPE_SECRET_KEY;
else process.env.STRIPE_SECRET_KEY = savedKey;
const complete: DeemedSupplierRecord[] = DEEMED_SUPPLIER_JURISDICTIONS.map((jurisdiction) => ({
  jurisdiction, treatment: "refuse-consumers", implementedIn: "lib/example.ts", recordedOn: "2027-01-01", registration: "", evidence: "tests/example.test.ts",
}));
is("a complete set of records opens this gate (and only this one)", deemedSupplierReady(complete), true);
is("a tax collected without its registration does not", deemedSupplierProblems(complete.map((r) => (r.jurisdiction === "EU" ? { ...r, treatment: "collect" as const } : r))), ["EU: a tax collected needs its registration"]);
is("nor a jurisdiction recorded twice, or missing", [
  deemedSupplierReady([...complete, complete[0]]),
  deemedSupplierReady(complete.filter((r) => r.jurisdiction !== "UK")),
], [false, false]);

part("The documents say what the code does");
const nine = read("docs/eu-vat-article-9a.md");
is("the art. 9a reading cites the official texts and their day", [
  nine.includes("https://eur-lex.europa.eu/eli/reg_impl/2011/282/2025-04-14/eng"),
  nine.includes("explanatory_notes_2015_en.pdf"),
  nine.includes("OSS_guidelines_en.pdf"),
  nine.includes("read 18 Oct 2026"),
], [true, true, true, true]);
is("and reads every checkout path", ["Digital products", "Courses", "Private podcasts", "Memberships", "Calls", "Tips", "Payment requests", "Physical goods", "own plans"].filter((path) => !nine.includes(path)), []);
is("and what follows: VAT on the full price, the non-Union OSS from the first sale, art. 63c records, two pieces of evidence", ["full sale price", "Non-Union OSS from the first sale", "art. 63c", "two items of non-contradictory evidence", "never from Marktmorgen's commission"].filter((words) => !nine.includes(words)), []);
const doubts = read("docs/tax-uncertainty.md");
const statuses = { "CLOSED-TEXT": 0, "CLOSED-DESIGN": 0, "CLOSABLE-CONSULTA": 0, OPEN: 0 } as Record<string, number>;
const listed = doubts.slice(doubts.indexOf("## The 27 questions"), doubts.indexOf("**Links.**"));
const numbered = listed.split("\n").filter((line) => /^\d+\. \*\*/.test(line));
for (const line of numbered) for (const status of Object.keys(statuses)) statuses[status] += (line.split("**")[2] ?? "").match(new RegExp(`\\b${status}\\b`, "g"))?.length ?? 0;
is("the questions are numbered 1 to the gate's last", numbered.map((line) => Number(line.split(".")[0])), Array.from({ length: TAX_QUESTIONS }, (_, i) => i + 1));
is("and the counts are what they list", doubts.includes(`CLOSED-TEXT ${statuses["CLOSED-TEXT"]}, CLOSED-DESIGN ${statuses["CLOSED-DESIGN"]}, CLOSABLE-CONSULTA ${statuses["CLOSABLE-CONSULTA"]}, OPEN ${statuses.OPEN}`), true);
console.log(`  statuses: ${JSON.stringify(statuses)}`);
const consultations = read("docs/tax-consultations.md");
is("the consultations point at the shared drafts and the code's list", ["tax-consultations-receita-drafts.md", "tax-consultations-fortaleza-draft.md", "CONSULTATION_ANSWERS", "IN RFB 2.058/2021"].filter((words) => !consultations.includes(words)), []);

done();

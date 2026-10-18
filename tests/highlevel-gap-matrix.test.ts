/**
 * The HighLevel gap matrix (docs/highlevel-gap-matrix.json and .md, added
 * 18 October 2026) stays honest: every HighLevel row cites a source read on
 * a stated date, every Marktmorgen "built" or "partial" row cites files that
 * exist, gaps are ranked by sales over effort, the two files agree, and
 * nothing claims to be better than HighLevel.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { done, is, part } from "./check";

type Source = { id: string; title: string; url: string; accessed: string; shows: string };
type Row = { id: string; area: string; feature: string; sources: string[]; marktmorgen: string; evidence: string[]; note: string; sales?: number; effort?: number; score?: number };
type Matrix = { reviewedAt: string; sources: Source[]; features: Row[]; ranking: { rank: number; id: string; score: number; sales: number; effort: number; marktmorgen: string }[]; counts: Record<string, number>; builtFromThis: { id: string; pr: string; note: string }[] };

const root = process.cwd();
const matrix = JSON.parse(readFileSync(join(root, "docs/highlevel-gap-matrix.json"), "utf8")) as Matrix;
const md = readFileSync(join(root, "docs/highlevel-gap-matrix.md"), "utf8");

part("Sources");
is("every source is a HighLevel page with its access date", matrix.sources.every((s) => /^https:\/\/(www\.|help\.)?gohighlevel\.com\//.test(s.url) && /^\d{4}-\d{2}-\d{2} UTC$/.test(s.accessed) && s.shows.length > 20), true);
const ids = new Set(matrix.sources.map((s) => s.id));
is("every row cites at least one source that is listed", matrix.features.every((r) => r.sources.length > 0 && r.sources.every((s) => ids.has(s))), true);
is("every source is cited by some row", [...ids].every((id) => matrix.features.some((r) => r.sources.includes(id))), true);

part("Marktmorgen evidence");
const statuses = new Set(["built", "partial", "gap", "not_planned"]);
is("every row has a known status", matrix.features.every((r) => statuses.has(r.marktmorgen)), true);
const missing = matrix.features.flatMap((r) => r.evidence.filter((p) => !existsSync(join(root, p))).map((p) => `${r.id}: ${p}`));
is("every cited file exists", missing, []);
is("built and partial rows cite files; gaps cite none", matrix.features.every((r) => (r.marktmorgen === "built" || r.marktmorgen === "partial" ? r.evidence.length > 0 : r.evidence.length === 0)), true);
is("ids are unique", new Set(matrix.features.map((r) => r.id)).size, matrix.features.length);
const counts: Record<string, number> = {};
for (const r of matrix.features) counts[r.marktmorgen] = (counts[r.marktmorgen] ?? 0) + 1;
is("the counts are the rows'", counts, matrix.counts);

part("Ranking");
const ranked = matrix.features.filter((r) => r.marktmorgen === "gap" || r.marktmorgen === "partial");
is("every gap and partial row is ranked, once", matrix.ranking.map((r) => r.id).sort(), ranked.map((r) => r.id).sort());
is("scores are sales over effort, each 1 to 5", ranked.every((r) => r.sales! >= 1 && r.sales! <= 5 && r.effort! >= 1 && r.effort! <= 5 && Math.abs(r.score! - Math.round((r.sales! / r.effort!) * 100) / 100) < 1e-9), true);
is("ranked highest score first", matrix.ranking.every((r, i) => i === 0 || matrix.ranking[i - 1].score >= r.score), true);
is("ranks are 1, 2, 3 …", matrix.ranking.map((r) => r.rank), matrix.ranking.map((_, i) => i + 1));

part("The two files agree, and say nothing they cannot");
is("every row and every source is in the page", matrix.features.every((r) => md.includes(`| ${r.id} |`)) && matrix.sources.every((s) => md.includes(s.url)), true);
is("every ranked row is in the page's ranking", matrix.ranking.every((r) => md.includes(`| ${r.rank} | ${r.id} |`)), true);
const said = md.replace("No row claims Marktmorgen is better than HighLevel.", "").replace("It makes no claim that Marktmorgen is better than, cheaper than or equal to HighLevel.", "");
is("no superiority claim", /\b(better than|best|beats|outperform\w*|superior|cheaper than)\b/i.test(said), false);
is("built-from rows name a ranked or built row and its pull request", matrix.builtFromThis.every((b) => matrix.features.some((r) => r.id === b.id) && /^#\d+$/.test(b.pr)), true);

done();

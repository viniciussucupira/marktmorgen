/**
 * What a saved funnel's counts point to (lib/funnel-diagnosis.ts, added
 * 18 October 2026, ClickFunnels audit row F54). Pure checks:
 *
 *   - nothing is judged until a step has been opened SAMPLE_VIEWS times;
 *   - a step nobody reached after a well-visited one, a product step nobody
 *     paid at, and the largest fall under half, each pointing at the step to
 *     open in the editor;
 *   - an unavailable count is named and never read as zero; a closed step is
 *     left to the launch review;
 *   - no finding claims a cause, and the studio draws them with their link.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DIAGNOSIS_NOTE, FALL_SHARE, SAMPLE_VIEWS, funnelFindings, type DiagnosisStep } from "@/lib/funnel-diagnosis";
import { done, is, part } from "./check";

const page = (title: string, seen: number | null, open = true): DiagnosisStep => ({ title, open, product: false, free: false, seen, done: null });
const product = (title: string, seen: number | null, paid: number | null, free = false): DiagnosisStep => ({ title, open: true, product: true, free, seen, done: paid });
const codes = (steps: DiagnosisStep[]) => funnelFindings(steps).map((f) => [f.code, f.stepIndex ?? null]);

part("Too few visits");
is("the threshold is the AI draft's own sample", SAMPLE_VIEWS, 30);
is("no step at 30: one line, nothing judged", codes([page("Guide", 29), page("Video", 0), product("Course", 2, 0)]), [["too_few", null]]);
is("and it names the most-opened step", funnelFindings([page("Guide", 29), page("Video", 3)])[0].detail.includes("step 1 (“Guide”), opened 29 times"), true);
is("a funnel with no counts at all says nothing", funnelFindings([]), []);

part("Nobody reached a step");
const broken = funnelFindings([page("Guide", 120), page("Video", 0), product("Course", 0, 0)]);
is("the step after a visited one, pointing at the step whose button leads there", broken.map((f) => [f.code, f.stepIndex]), [["unreached", 0]]);
is("it says what to check", broken[0].detail, "Step 2 (“Video”) was opened by nobody, while step 1 (“Guide”) was opened 120 times. Check that the button or link on step 1 leads to step 2.");
is("a step after one under the sample is not called unreached", codes([page("Guide", 300), page("Video", 12), page("Sales", 0)]), [["largest_fall", 0], ["too_few", null]]);

part("Nobody paid");
const unpaid = funnelFindings([page("Guide", 200), product("Course", 150, 0)]);
is("a paid step opened 150 times and paid at by nobody", unpaid.map((f) => [f.code, f.stepIndex]), [["none_completed", 1]]);
is("read as a buyer would", unpaid[0].title + " | " + unpaid[0].detail, "Nobody paid at step 2 | 150 people opened step 2 (“Course”) and nobody paid. Read its price, its page and its checkout as a buyer would.");
is("a free step says signed up", funnelFindings([product("Guide", 40, 0, true)])[0].title, "Nobody signed up at step 1");
is("under the sample, a step with no buyer is not judged", codes([page("Guide", 200), product("Course", 20, 0)]), [["largest_fall", 0], ["too_few", null]]);
is("a step with buyers is not flagged", codes([page("Guide", 200), product("Course", 150, 3)]), []);
is("an unread completion count is not taken for none", codes([page("Guide", 200), product("Course", 150, null)]), [["unavailable", null]]);

is("negative completion is unavailable, not a successful reading",codes([product("Course",150,-1)]),[["unavailable",null]]);
is("page-only counts do not require a completion metric",codes([page("Guide",150)]),[]);

part("The largest fall");
const fall = funnelFindings([page("Guide", 1000), page("Video", 400), page("Sales", 40)]);
is("only the smallest share, pointing at the step before it", fall.map((f) => [f.code, f.stepIndex]), [["largest_fall", 1]]);
is("counts, not the same people", fall[0].detail, "Step 3 (“Sales”) was opened by 40 people, 10% of the 400 who opened step 2 (“Video”): the largest fall between two steps here. Read step 2 as a visitor would: what it asks of them, and where its button goes. Visitors may enter at different steps, so this compares counts, not the same people.");
is("half or more is not a fall worth pointing at", FALL_SHARE, 0.5);
is("so 500 of 1,000 says nothing", codes([page("Guide", 1000), page("Video", 500)]), []);
is("a tiny share still says at least 1%", funnelFindings([page("Guide", 10_000), page("Video", 1)])[0].detail.includes(", 1% of the 10,000"), true);

part("Counts that could not be read, and steps that are closed");
const unread = funnelFindings([page("Guide", 200), page("Video", null), page("Sales", 0)]);
is("an unread step is named, and its neighbor is not called unreached", unread.map((f) => [f.code, f.stepIndex ?? null]), [["unavailable", null]]);
is("and it is never read as zero", unread[0].detail, "Step 2: the counts could not be read just now, so it is left out. Reload to try again.");
is("a step visitors cannot open is left to the launch review", codes([page("Guide", 200), page("Video", 0, false), page("Sales", 150)]), []);

const crowded=funnelFindings([...Array.from({length:9},(_,i)=>product("Offer "+i,100,0)),product("Unread orders",100,null)]);
is("availability warning survives the eight-finding display cap",crowded[0].code,"unavailable");
is("the bounded diagnosis stays at eight findings",crowded.length,8);

part("Honest words");
const all = [broken, unpaid, fall, unread, funnelFindings([page("Guide", 3)])].flat().map((f) => `${f.title} ${f.detail}`).join(" ") + " " + DIAGNOSIS_NOTE;
is("no finding claims a cause", /\bbecause\b|\bcaused\b|\bwill (sell|convert|increase)\b|guarantee/i.test(all), false);
is("the note says they do not explain", DIAGNOSIS_NOTE.includes("they do not say why"), true);

part("Drawn in the studio");
const editor = readFileSync(join(process.cwd(), "components/page-funnel-editor.tsx"), "utf8");
is("each saved funnel's steps are read", editor.includes("funnelFindings(steps)"), true);
is("each finding links to its step's own editor, with no prefetch", /steps\[finding\.stepIndex\]\?\.editor[\s\S]{0,600}prefetch=\{false\}/.test(editor), true);
is("with the note under them", editor.includes("{DIAGNOSIS_NOTE}"), true);

done();

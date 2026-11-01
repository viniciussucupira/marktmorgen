/**
 * Undo in place of "Are you sure?" when another email is opened over
 * unsaved changes (485 [IT2], unit 1, components/email-studio.tsx; added
 * 1 November 2026). Checked in the source, as the composer is a client
 * component with no server to render against:
 *
 *   - the browser's "Discard them and open another email?" is gone;
 *   - opening another email over unsaved changes sets them aside, with the
 *     email they belonged to, and one press brings them back, setting aside
 *     in turn what is unsaved then;
 *   - everything the composer counts as unsaved is in what is set aside;
 *   - the line is in a polite live region always on the page, with a real
 *     button;
 *   - leaving the page with something set aside asks, as with changes on
 *     screen; nothing set aside is sent or saved anywhere.
 */
import { readFileSync } from "node:fs";
import { done, is, part } from "./check";

const studio = readFileSync("components/email-studio.tsx", "utf8");

part("No browser confirmation for a routine switch");
is("the question is gone", studio.includes("Discard them and open another email?"), false);
is("and opening another email goes through the set-aside switch", /const openDraft = \(draft: DraftRow \| null\) => \{[\s\S]{0,400}switchTo\(draft\);/.test(studio), true);
is("an email still being sent or saved is not switched away from", /if \(composerState\.current\?\.busy\) \{\s*toast\("Wait for the current email operation to finish before opening another email\."\);/.test(studio), true);

part("Set aside, and brought back");
is("unsaved changes are set aside with the email they belonged to", studio.includes("setSetAside(current?.dirty ? { snapshot: current.snapshot(), from: open } : null);"), true);
is("bringing them back sets aside, in turn, what is unsaved then", /const bringBack = \(\) => \{[\s\S]{0,200}switchTo\(setAside\.from, setAside\.snapshot\);/.test(studio), true);
const content = /const content = JSON\.stringify\(\[([^\]]+)\]\);/.exec(studio)?.[1].split(",").map((s) => s.trim()) ?? [];
const kept = /const snapshot = \(\): ComposerSnapshot => \(\{ ([^}]+) \}\);/.exec(studio)?.[1].split(",").map((s) => s.trim()) ?? [];
const counted = [...content.filter((x) => x !== "draftSubjectTest"), "testing", "subjectB", "share", "hours", "by", "later", "at", "draftId", "draftSavedAt", "savedContent"];
is("everything the composer counts as unsaved is kept", counted.filter((x) => !kept.includes(x)), []);
is("and the composer starts from it when brought back", ["subject", "body", "productId", "notProductId", "who", "draftId", "draftSavedAt", "spentText", "channel", "quietDays", "more", "savedContent", "testing", "subjectB", "share", "hours", "by"].every((x) => studio.includes(`props.restore ? props.restore.${x} :`)) && studio.includes("useState(props.restore?.later ?? false)") && studio.includes('useState(props.restore?.at ?? "")'), true);

part("Said, and safe");
is("in a polite live region always on the page, with a real button", studio.includes('<div aria-live="polite" className="mb-4">') && studio.includes('<button type="button" className="btn btn-secondary btn-sm ml-1" onClick={bringBack}>Bring them back</button>'), true);
is("the line says what happened in plain words", studio.includes("Your unsaved changes to the other email were set aside."), true);
is("brought back, the focus goes to the email's subject, as the button is gone", studio.includes("if (restored) subjectBox.current?.focus();") && studio.includes("<input ref={subjectBox}"), true);
is("leaving the page with something set aside asks first", studio.includes("useLeaveGuard(setAside !== null);"), true);
is("what is set aside stays in the page: not stored in the browser or sent", /localStorage|sessionStorage/.test(studio), false);
done();

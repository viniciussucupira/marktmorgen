/**
 * Before an email goes to people, a summary with "Change" on each item
 * (487 [IT4], pattern 8, GOV.UK "Check answers"; added 1 November 2026;
 * components/email-studio.tsx). Checked:
 *
 *   - the review is a summary list: the subject, who gets it and when, each
 *     as a term and its answer, never one sentence to parse;
 *   - each row has a "Change" button whose name says what it changes, and it
 *     closes the review and puts the focus on that field;
 *   - the fields it leads to have the ids it names;
 *   - the review still says the audience is checked again when sending starts,
 *     and the send button still names how many people.
 */
import { readFileSync } from "node:fs";
import { done, is } from "./check";

const studio = readFileSync("components/email-studio.tsx", "utf8");
const review = studio.slice(studio.indexOf('id="mail-send-review"'), studio.indexOf("Eligibility is checked again when sending starts."));
is("the review is a summary list of terms and answers", review.includes("<dl") && (review.match(/<dt/g) ?? []).length >= 3, true);
is("subject, who gets it and when are each a row", ["Subject", "Who gets it", "When"].every((term) => review.includes(`>${term}</dt>`)), true);
for (const [what, id] of [["subject", "mail-subject"], ["who gets it", "mail-send-to"], ["when", "mail-when"]] as const) {
  is(`"Change" for ${what} leads to its field`, review.includes(`changeAnswer("${id}")`) && review.includes(`<span className="sr-only"> ${what}</span>`), true);
}
is("each field it leads to has that id", studio.includes('id="mail-subject"') && studio.includes('id="mail-send-to"') && studio.includes('id="mail-when"'), true);
is("Change closes the review and moves the focus to the field", /function changeAnswer\(id: string\) \{\s*setConfirming\(false\);\s*requestAnimationFrame\(\(\) => document\.getElementById\(id\)\?\.focus\(\)\);/.test(studio), true);
is("the audience is still checked again when sending starts, and the button still names how many", studio.includes("Eligibility is checked again when sending starts.") && studio.includes("`Yes, send it to ${n(reach)}`"), true);
done();

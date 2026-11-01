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
is("the review is no live region (it would repeat at every key); its heading takes the focus when it opens", !studio.includes('id="mail-send-review" role="status"') && studio.includes('<h3 id="mail-send-review-title" tabIndex={-1}') && studio.includes('requestAnimationFrame(() => document.getElementById("mail-send-review-title")?.focus());'), true);
is("the send button is described by one short sentence, not the whole list", studio.includes('aria-describedby="mail-send-note"') && studio.includes('<p id="mail-send-note"'), true);
is("on a phone each answer takes its own line under its term", (review.match(/basis-full break-words sm:basis-0 sm:flex-1/g) ?? []).length, 3);
is("the audience is still checked again when sending starts, and the button still names how many", studio.includes("Eligibility is checked again when sending starts.") && studio.includes("`Yes, send it to ${n(reach)}`"), true);

const update = readFileSync("components/product-update-box.tsx", "utf8");
const waitlist = readFileSync("components/waitlist-panel.tsx", "utf8");
const launchReview = waitlist.slice(waitlist.indexOf('id={`waitlist-${productId}-review`}'), waitlist.indexOf("Put it on sale and tell the waitlist\"\n"));
is("before the waitlist's sale and email, a summary list: on sale, price, emails, note, postal address", launchReview.includes("<dl") && ["Goes on sale", "Price", "Emails", "Note", "Postal address"].every((term) => launchReview.includes(`>${term}</dt>`)), true);
is("the price shown is the product's own, as the email carries it", waitlist.includes("price: string;") && readFileSync("components/product-editor.tsx", "utf8").includes("price={formatMoney(product.priceCents, currency)}"), true);
is("the note and the address each have a Change that leads to their field", launchReview.includes("changeAnswer(`waitlist-${productId}-note`)") && launchReview.includes("changeAnswer(`waitlist-${productId}-address`)") && waitlist.includes("id={`waitlist-${productId}-note`}") && waitlist.includes("id={`waitlist-${productId}-address`}"), true);
is("the price says where it is changed, since it is the product's", launchReview.includes("Change it in the product's details above."), true);
is("the second press still names how many emails, in the singular for one", waitlist.includes('`Press again: on sale now, ${view.confirmed.toLocaleString("en-US")} ${view.confirmed === 1 ? "email" : "emails"}`'), true);
is("changing the note or the address closes the review, so nothing is sent unread", waitlist.includes("setNote(e.target.value); setConfirming(false);") && waitlist.includes("setAddress(e.target.value); setConfirming(false);"), true);
is("without a postal address the second press is not offered, and the review says why", waitlist.includes("(confirming && view.confirmed > 0 && !address.trim())") && waitlist.includes("None yet. Add one before it can go out."), true);
is("both reviews are a heading one level under their section", waitlist.includes("<h3 id={`waitlist-${productId}-review-title`}") && update.includes("<h3 id={`${id}-review-title`}"), true);

is("emailing buyers about an update asks first, with a summary list: product, who gets it, note", update.includes("<dl") && ["Product", "Who gets it", "Note"].every((term) => update.includes(`>${term}</dt>`)), true);
is("how many is not guessed: it is counted from the store's Stripe account when it is sent", update.includes("Everyone who bought it. They are counted from your Stripe account when it is sent."), true);
is("the note has a Change that closes the review and goes back to it", update.includes("Change<span className=\"sr-only\"> note</span>") && update.includes("setReviewing(false)"), true);
is("nothing is sent from the first press, which says so: only from the review's own button", update.includes("if (!reviewing) {") && update.includes("Yes, email every buyer") && update.includes('"Check before sending"'), true);
is("changing the note closes the review, so nothing is sent from an old one", update.includes("setNote(event.target.value); setReviewing(false);"), true);
done();

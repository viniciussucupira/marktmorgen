/**
 * A web address checked when the person leaves the field (487 [IT4],
 * pattern 1; added 1 November 2026; lib/url-check.ts,
 * components/url-field.tsx). Checked:
 *
 *   - the check is the server's own reading (readLink in lib/product-link.ts),
 *     so the field never passes what the save refuses, or refuses what it keeps;
 *   - an empty optional field is fine;
 *   - an address missing https:// is offered back with it, in one press,
 *     only when that makes it one the server keeps; an http:// one too;
 *   - nothing is said while the person is still typing: only after they
 *     leave the field, and the message goes as soon as the address is right;
 *   - the message is tied to the field (aria-describedby, aria-invalid) and
 *     the fix is a real button at least 44 px tall;
 *   - the lesson link in the course editor uses it, with a visible label.
 */
import { readFileSync } from "node:fs";
import { linkOnLeave } from "@/lib/url-check";
import { readLink, LINK_PROBLEMS } from "@/lib/product-link";
import { done, is, part } from "./check";

part("The check");
is("empty is fine in an optional field", linkOnLeave(""), { problem: null, fix: null });
is("a good address is fine", linkOnLeave("https://notion.so/my-course"), { problem: null, fix: null });
is("missing https://: said, with the address offered back with it", linkOnLeave("notion.so/my-course"), { problem: "This address needs https:// at the start.", fix: "https://notion.so/my-course" });
is("http://: offered back as https://", linkOnLeave("http://example.com/page"), { problem: "This address needs https:// at the start.", fix: "https://example.com/page" });
is("spaces around it are not a problem", linkOnLeave("  https://example.com  ").problem, null);
is("something no prefix can save: the server's own words, no fix", linkOnLeave("my course"), { problem: LINK_PROBLEMS.shape, fix: null });
is("a local address: why it is refused, never offered back", linkOnLeave("localhost:3000"), { problem: LINK_PROBLEMS.host, fix: null });
is("a password in it: the server's words", linkOnLeave("https://me:secret@example.com").problem, LINK_PROBLEMS.credentials);
for (const typed of ["notion.so/x", "http://example.com", "https://example.com", "my course", "https://10.0.0.1/a", "ftp://example.com", "https://me:pw@example.com", ""]) {
  const leave = linkOnLeave(typed);
  const server = typed.trim() ? readLink(typed) : null;
  is(`"${typed}": passes here exactly when the server keeps it`, leave.problem === null, server === null || server.ok);
  if (leave.fix) is(`"${typed}": what is offered is kept by the server`, readLink(leave.fix).ok, true);
}

part("The field");
const field = readFileSync("components/url-field.tsx", "utf8");
is("said only after leaving the field", field.includes("onBlur={() => setLeft(true)}") && field.includes("const shown = left ? linkOnLeave(value) : { problem: null, fix: null };"), true);
is("tied to the field, and marked invalid only while said", field.includes("aria-invalid={shown.problem ? true : undefined}") && field.includes("aria-describedby="), true);
is("the fix is a button at least 44 px tall that puts the address in", field.includes('type="button"') && field.includes("min-h-11") && field.includes("onChange(fix)"), true);
is("the message is announced", field.includes('role="status"'), true);
const course = readFileSync("components/course-editor.tsx", "utf8");
is("the lesson link uses it, with a visible label tied by its id", course.includes("<UrlField") && /htmlFor=\{`\$\{prefix\}-link`\}/.test(course) && course.includes("id={`${prefix}-link`}"), true);
done();

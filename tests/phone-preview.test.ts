/**
 * A live preview at phone width beside the email editor (487 [IT4], pattern 7;
 * added 1 November 2026; components/mail-designer.tsx). Checked:
 *
 *   - the email shows "As it is sent" in both Write and Design, not only in
 *     Design, so the creator sees it while typing;
 *   - it starts at phone width (390 px, as the page editor's preview), with a
 *     Phone or Wide choice that says which is on;
 *   - it is drawn by the same function that draws the email (bodyHtml), so it
 *     cannot show something the email does not;
 *   - the email composer and every sequence step get it, as both use this editor.
 */
import { readFileSync } from "node:fs";
import { done, is } from "./check";

const designer = readFileSync("components/mail-designer.tsx", "utf8");
is("one preview, drawn by the email's own function", (designer.match(/bodyHtml\(body, undefined, accent\)/g) ?? []).length, 1);
is("shown in Write as well as in Design", (designer.match(/\{preview\}/g) ?? []).length, 3);
is("in Write it sits beside the text on a wide screen and is folded on a narrow one", designer.includes('<div className="hidden xl:block">{preview}</div>') && designer.includes('<details className="xl:hidden">') && designer.includes("See it as it is sent</summary>"), true);
is("it is inert: out of the outline, the Tab order and clicks that would leave the draft, and says why", /inert\s+className="mx-auto/.test(designer) && designer.includes("Nothing in it can be pressed here."), true);
is("it starts at phone width, 390 px", designer.includes("const [phone, setPhone] = useState(true);") && designer.includes("style={phone ? { maxWidth: 390 } : undefined}"), true);
is("a Phone or Wide choice that says which is on", designer.includes('aria-label="Preview width"') && /aria-pressed=\{phone\}[\s\S]{0,200}?Phone/.test(designer) && /aria-pressed=\{!phone\}[\s\S]{0,200}?Wide/.test(designer), true);
const studio = readFileSync("components/email-studio.tsx", "utf8");
is("the composer and every sequence step use this editor", (studio.match(/<MailBodyEditor/g) ?? []).length, 2);
is("an empty preview says so in text at 7:1 or more on white (#57534e is 7.6:1)", designer.includes('color:#57534e\\">Nothing yet.') , true);
done();

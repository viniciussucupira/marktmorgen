/**
 * "Which spaces a member sees" in the studio (399 [SL3], unit 2; added
 * 1 November 2026; components/community-member-preview.tsx). Checked:
 *
 *   - the panel works out its list with previewSpaces, the rule the real gate
 *     uses, from the community the studio already has, and nothing else;
 *   - it reads no buyer, calls no route, changes nothing and tells nobody;
 *   - its line says how many of the spaces such a member sees, and says
 *     plainly when it is none;
 *   - it says what it does not show (posts and events), so it never stands
 *     in for something it is not;
 *   - the products to pick are those that open the community, as visible
 *     checkboxes in a group with a legend, and the result is announced.
 */
import { readFileSync } from "node:fs";
import { PREVIEW_LEAVES_OUT, previewLine } from "@/lib/community-gate";
import { done, is, part } from "./check";

part("The line");
is("some of the spaces", previewLine(["Introductions", "Wins"], 4), "A member with these products sees 2 of your 4 spaces: Introductions, Wins.");
is("one", previewLine(["Introductions"], 3), "A member with these products sees 1 of your 3 spaces: Introductions.");
is("all of them", previewLine(["A", "B"], 2), "A member with these products sees all 2 of your spaces.");
is("none is said plainly", previewLine([], 2), "A member with these products sees none of your spaces.");
is("what it leaves out is said", PREVIEW_LEAVES_OUT, "This shows which spaces they see, not their posts. Events have their own rule and are not shown here. Nothing is changed and nobody is told.");

part("The panel");
const panel = readFileSync("components/community-member-preview.tsx", "utf8");
is("its list comes from the same rule as the real gate", panel.includes("previewSpaces(spaces, access, chosen)"), true);
is("it reads no buyer and calls nothing", /fetch\(|useRouter|\/api\/|email|stripe/i.test(panel), false);
is("its products are the ones that open the community, as checkboxes in a group with a legend", panel.includes("<fieldset") && panel.includes("<legend") && panel.includes('type="checkbox"') && panel.includes("open.map("), true);
is("the result is announced politely, with the line", panel.includes('aria-live="polite"') && panel.includes("previewLine("), true);
is("it says what it does not show", panel.includes("PREVIEW_LEAVES_OUT"), true);
is("shown only when some space is kept for some products, and some product opens the community", panel.includes("if (!open.length || !spaces.some((space) => space.only.length)) return null;"), true);
const studio = readFileSync("components/community-studio.tsx", "utf8");
is("the studio shows it under the spaces, with the community's own spaces, access and the open products", studio.includes("<MemberPreview spaces={config.spaces} access={config.access} open={open} />"), true);
done();

/**
 * Empty screens say what to do next (487 [IT4], pattern 5, first pass;
 * added 1 November 2026; docs/ease-patterns-audit.md).
 */
import { readFileSync } from "node:fs";
import { done, is } from "./check";

const email = readFileSync("components/email-studio.tsx", "utf8");
is("an empty email history says where the first email comes from", email.includes("Your first email shows here once you send or schedule it with the editor above."), true);
const events = readFileSync("components/community-events-studio.tsx", "utf8");
is("no event scheduled says what an event can be and where to start one", events.includes("Nothing scheduled yet. A live call, a workshop or a Q&amp;A: press &ldquo;Schedule an event&rdquo; to put one on your community&rsquo;s calendar."), true);
const reviews = readFileSync("app/studio/reviews/page.tsx", "utf8");
is("no review yet offers the way to ask buyers for one, on the same page", reviews.includes('href="#asking-for-reviews"') && reviews.includes('id="asking-for-reviews"'), true);
is("the place it leads to takes the focus, so a keyboard or screen reader lands there", reviews.includes('id="asking-for-reviews" tabIndex={-1}'), true);
done();

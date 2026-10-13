/**
 * One refund window, everywhere, and never a number typed out by hand.
 *
 * The window was fourteen days and is now thirty. It is stated on the home
 * page twice, in both plan cards, in the help center, on the mission page,
 * in the Terms and all through the Refund Policy — and it is also the
 * reason INVITE_HOLD_DAYS is what it is, because credit must not be paid to
 * an inviter on a payment that can still be handed back. That is eight
 * places to change and one of them is not a sentence at all.
 *
 * Advertising a longer window than the policy honors is a false promise;
 * holding invite credit for less than the window pays out money we may have
 * to return. Both are silent failures. These checks make them loud.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { REFUND_DAYS, TRIAL_DAYS } from "@/lib/plan";
import { INVITE_HOLD_DAYS } from "@/lib/creator-invite-rules";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const files = [
  ...walk(join(process.cwd(), "app")),
  ...walk(join(process.cwd(), "lib")),
  ...walk(join(process.cwd(), "components")),
].map((file) => relative(process.cwd(), file).replaceAll("\\", "/"));

test("the guarantee is held for longer than the trial", () => {
  assert.ok(
    REFUND_DAYS > TRIAL_DAYS,
    "a refund window no longer than the free trial gives a paying creator nothing the trial did not",
  );
});

test("invite credit is never paid while the payment behind it can still be refunded", () => {
  assert.ok(
    INVITE_HOLD_DAYS > REFUND_DAYS,
    `INVITE_HOLD_DAYS (${INVITE_HOLD_DAYS}) must be longer than REFUND_DAYS (${REFUND_DAYS}), or credit ` +
      "is paid out on payments we may still have to give back",
  );
});

test("no page states a refund window as a number of its own", () => {
  // A refund sentence that carries a hard-coded figure instead of REFUND_DAYS.
  const typed = /(?:within|after|of)\s+(?:a\s+)?(\d{1,3}|fourteen|thirty|seven|sixty|ninety)[\s-]*(?:\(\d+\)\s*)?days?[^.]{0,80}(?:refund|money[\s-]back|charge it back|give it back)/gi;
  const alsoTyped = /refund[^.]{0,80}(?:within|after)\s+(?:a\s+)?(\d{1,3}|fourteen|thirty|seven|sixty|ninety)[\s-]*(?:\(\d+\)\s*)?days?/gi;

  const offenders: string[] = [];
  for (const file of files) {
    if (file.endsWith("tests/refund-window.test.ts")) continue;
    const src = readFileSync(file, "utf8");
    for (const re of [typed, alsoTyped]) {
      re.lastIndex = 0;
      for (const m of src.matchAll(re)) {
        // The creator's own guarantee block is their promise to their buyers,
        // written by them, and has nothing to do with what we refund.
        if (file.endsWith("components/page-editor.tsx")) continue;
        const line = src.slice(0, m.index).split("\n").length;
        offenders.push(`${file.replace(process.cwd() + "/", "")}:${line} — ${m[0].trim().slice(0, 90)}`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    "These state a refund window as a typed number. Use REFUND_DAYS from lib/plan.ts so the " +
      `promise and the policy cannot drift apart:\n  ${offenders.join("\n  ")}`,
  );
});

test("the Refund Policy still offers the guarantee by that name, at that length", () => {
  const policy = readFileSync(join(process.cwd(), "app/refunds/page.tsx"), "utf8");
  assert.match(policy, /money-back guarantee/i, "the policy page should name the guarantee");
  assert.match(policy, /REFUND_DAYS/, "the policy page should read the window from lib/plan.ts");
  assert.match(
    policy,
    /id="guarantee"/,
    "the guarantee needs a fixed anchor, because the pages that promise it link straight to it",
  );
});

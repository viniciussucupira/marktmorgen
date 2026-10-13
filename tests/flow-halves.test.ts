/**
 * Halves of a sequence, and a step that tells the store's webhooks (lib/flow-rules.ts,
 * added 13 October 2026). What is checked:
 *
 *   - a person's half is the same at every step, about even across people,
 *     and differs between sequences;
 *   - a condition on a half holds for that half only;
 *   - the webhook step is read as an action, and "sequence.step" is an event
 *     an address can listen for.
 */
import { halfOf, holds, readAction, readCondition } from "@/lib/flow-rules";
import { WEBHOOK_EVENTS } from "@/lib/webhooks";
import { done, is, part } from "./check";

async function main(): Promise<void> {
  part("Halves");
  is("the same person, the same half, whatever the capitals", halfOf("flow000001", "Dana@Example.com"), halfOf("flow000001", "dana@example.com"));
  const people = Array.from({ length: 2000 }, (_, i) => `p${i}@example.com`);
  const a = people.filter((p) => halfOf("flow000001", p) === "a").length;
  is("about even across many people", a > 900 && a < 1100, true);
  const differs = people.filter((p) => halfOf("flow000001", p) !== halfOf("flow000002", p)).length;
  is("and not the same split in every sequence", differs > 800, true);

  part("A condition on a half");
  const condition = readCondition({ if: "half-a" }, () => true);
  const person = { ids: [], source: "free", tags: [] };
  is("read as one", condition, { if: "half-a" });
  if (condition && condition !== "bad") {
    is("holds for the first half only", [holds(condition, { ...person, half: "a" }, new Set()), holds(condition, { ...person, half: "b" }, new Set()), holds(condition, person, new Set())], [true, false, false]);
  }

  part("Telling the store's webhooks");
  is("read as an action", readAction({ do: "webhook" }, () => false), { do: "webhook" });
  is("an event an address can listen for", (WEBHOOK_EVENTS as readonly string[]).includes("sequence.step"), true);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

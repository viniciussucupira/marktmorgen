/**
 * What the buyers of a product also bought (lib/also-bought.ts, added 10
 * October 2026). What is checked: buyers are told apart by the address they
 * paid with, however typed, and one checkout's added products count as bought
 * together; each buyer counts once for a pair; nothing is kept below three
 * buyers of both; the most bought together come first; what is stored is read
 * safely; and it is kept with the counts a store chose to show.
 */
import { MIN_TOGETHER, TOGETHER_KEPT, parseTogether, togetherFrom } from "@/lib/also-bought";
import { readSoldCounts, refreshSoldCounts } from "@/lib/sold-count";
import { addProduct, claimHandle, ensureStatsId, setStripeAccount, storeForEmail, updateLook } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const checkout = (email: string, product: string, bumps: string[] = [], id = `cs_${Math.random().toString(36).slice(2)}`) => ({
  product,
  upsell: false,
  row: { id, customer_details: { email }, metadata: { product, ...(bumps[0] ? { bump: bumps[0] } : {}), ...(bumps[1] ? { bump2: bumps[1] } : {}) } },
});
const upsell = (email: string, product: string) => ({ product, upsell: true, row: { id: `pi_${Math.random().toString(36).slice(2)}`, receipt_email: email, metadata: { product } } });

async function main(): Promise<void> {
  part("Counted by buyer");
  const sales = [
    checkout("ana@example.com", "planner"),
    checkout(" ANA@example.com ", "lists"),
    checkout("ben@example.com", "planner", ["lists"]),
    checkout("cy@example.com", "planner"),
    upsell("cy@example.com", "lists"),
    checkout("cy@example.com", "lists"),
    checkout("dee@example.com", "planner", ["batch"]),
    checkout("eve@example.com", "planner", ["batch"]),
  ];
  const together = togetherFrom(sales);
  is("the same person in two checkouts, in one checkout, or after paying: each counts once", together.planner, [["lists", 3]]);
  is("and both ways round", together.lists, [["planner", 3]]);
  is("nothing below three buyers of both", [MIN_TOGETHER, together.batch], [3, undefined]);
  const more = togetherFrom([...sales, checkout("fay@example.com", "planner", ["batch"]), checkout("gus@example.com", "batch", ["planner"]), checkout("hal@example.com", "batch", ["planner"])]);
  is("the most bought together first", more.planner, [["batch", 5], ["lists", 3]]);
  is("a checkout with nobody's address counts only with itself", togetherFrom([{ product: "a", upsell: false, row: { id: "cs_1", metadata: { product: "a", bump: "b" } } }]), {});

  part("Read safely");
  is("what is stored, kept as it should be", parseTogether({ planner: [["lists", 3], ["x", 2], ["y", "4"], "z"], bad: "no" }), { planner: [["lists", 3]] });
  is("at most a few for each product", TOGETHER_KEPT <= 6, true);

  part("Kept with the counts a store chose to show");
  redis.clear();
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setStripeAccount("owner@example.com", "acct_1TestHarbor0001", true);
  await addProduct("owner@example.com", "Planner", "", "27", null);
  let store = (await storeForEmail("owner@example.com"))!;
  const read = async () => ({ byProduct: { planner: { sales: 12 } }, together });
  is("not kept by a store that shows no counts", await refreshSoldCounts(store, read), null);
  const looked = await updateLook("owner@example.com", { ...store.look, sold: true });
  if (!looked.ok) throw new Error("no look");
  store = looked.store;
  await refreshSoldCounts(store, read);
  is("kept, and read back with the counts", (await readSoldCounts(store))?.together.planner, [["lists", 3]]);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

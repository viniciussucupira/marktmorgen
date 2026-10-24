/**
 * A paid store's new orders stop at its plan's figure (lib/order-admission.ts),
 * and nothing past it is billed. Runs the real code against the in-memory
 * Redis (tests/redis-stub.ts); scripts/test_order_admission_redis.py runs the
 * same scripts on a real Redis.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ADMITTED_FIELD, OPEN_HOURS, admitOrders, settleAdmitted } from "@/lib/order-admission";
import { ORDERS_INCLUDED, TRIAL_ORDERS, freeCopiesLimitFor, paidOrdersLimitFor } from "@/lib/order-rules";
import { countOrder, storeOrdersThisMonth } from "@/lib/orders";
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

async function main() {
  const OWNER = "orders-paused@example.com";
  await claimHandle(OWNER, "pausedshop", "Paused Shop", "");
  await ensureStatsId(OWNER);
  await setSubscription(OWNER, { customerId: "cus_Paused0001", subscriptionId: "sub_Paused0001", active: true, tier: "creator", period: paidPeriod() });
  const store = (await storeForEmail(OWNER))!;
  const now = Date.UTC(2026, 9, 17, 12);

  part("Where a paid store's orders stop");
  is("a paid store's figure is its plan's, for paid orders and free copies alike", [paidOrdersLimitFor(store, now / 1000), freeCopiesLimitFor(store, now / 1000)], [ORDERS_INCLUDED.creator, ORDERS_INCLUDED.creator]);
  // Since 17 October 2026 a trial's paid orders stop at its figure too, shared with free copies.
  is("a trial's paid orders and free copies stop at the trial's figure", [paidOrdersLimitFor({ ...store, trialEnds: now / 1000 + 86_400 }, now / 1000), freeCopiesLimitFor({ ...store, trialEnds: now / 1000 + 86_400 }, now / 1000)], [TRIAL_ORDERS, TRIAL_ORDERS]);

  part("A marked paid contract needs its funded resource month before checkout");
  const funded = { ...store, period: { ...store.period!, funded: true as const } };
  const beforeFunded = JSON.stringify(redis.keys().filter((key) => key.startsWith("nl:orders:")));
  is("without actual financial approval no new funded order can open", await admitOrders(funded, 1, now), { ok: false, reason: "unavailable" });
  is("refused funded admission holds neither order capacity nor data room", JSON.stringify(redis.keys().filter((key) => key.startsWith("nl:orders:"))), beforeFunded);
  is("invalid order units cannot open a funded admission", await admitOrders(funded, 0, now), { ok: false, reason: "unavailable" });

  part("Checkouts are admitted up to the figure, counting those still open");
  const limit = ORDERS_INCLUDED.creator;
  for (let i = 0; i < limit - 3; i += 1) await countOrder(store, `checkout:test_${i}`, 0, now);
  is("the month's counted orders", await storeOrdersThisMonth(store, now), limit - 3);
  const a = await admitOrders(store, 1, now);
  const b = await admitOrders(store, 2, now);
  is("checkouts fill the rest of the figure, each held for its hour", [a.ok, b.ok, a.ok && a.hour === Math.floor(now / 3_600_000)], [true, true, true]);
  is("one more is refused: the figure is reached", await admitOrders(store, 1, now), { ok: false, reason: "paused" });
  // The first checkout is paid and its order counted: it gives its hour back.
  await countOrder(store, "checkout:paid_a", 0, now);
  await settleAdmitted(funded, a.ok ? String(a.hour) : null, 1);
  is("a paid checkout is not counted twice, and the figure is still reached", (await admitOrders(store, 1, now)).ok, false);
  const later = now + OPEN_HOURS * 3_600_000;
  is("a checkout nobody paid falls out of the window after a day, and frees its place", (await admitOrders(store, 1, later)).ok, true);
  is("a purchase for several people needs room for all its places", (await admitOrders(store, 5, later)).ok, false);

  part("A store not on a paid plan is not counted here");
  await setSubscription(OWNER, { active: false });
  const ended = (await storeForEmail(OWNER))!;
  is("nothing is held for it", await admitOrders(ended, 1, now), { ok: true, hour: null });

  part("Unknown is not zero");
  await setSubscription(OWNER, { customerId: "cus_Paused0001", subscriptionId: "sub_Paused0001", active: true, tier: "creator", period: paidPeriod() });
  const paid = (await storeForEmail(OWNER))!;
  const keys = [...redis.keys()].filter((key) => key.startsWith("nl:orders:n:"));
  for (const key of keys) redis.run(["SET", key, "not-a-number"]);
  is("an unreadable count admits nothing", await admitOrders(paid, 1, now), { ok: false, reason: "unavailable" });

  part("Every door that opens an order is admitted first");
  is("a product's checkout, before Stripe's page opens", /admitOrders\(store, 1 \+ \(extras\.group/.test(read("lib/store-checkout.ts")), true);
  is("a cart, holding what all its products leave", /admitOrders\(store, 1, Date\.now\(\), itemsHandedOver\(products\)\)/.test(read("lib/cart-checkout.ts")), true);
  is("an offer after paying, before it is charged", /admitOrders\(store, 1\)/.test(read("lib/upsell.ts")), true);
  is("a PayPal order, which is now counted too", [/admitOrders\(store, 1\)/.test(read("lib/paypal-sales.ts")), /countOrder\(store, `paypal:/.test(read("lib/paypal-sales.ts"))], [true, true]);
  is("a free copy", /admitOrders\(store, 1\)/.test(read("lib/free.ts")), true);
  is("a counted checkout gives its hour back, and what it held", new RegExp(`settleAdmitted\\(store, read\\.session\\?\\.metadata\\?\\.\\[ADMITTED_FIELD\\], 1, read\\.items \\?\\? 1\\)`).test(read("lib/purchase-email.ts")), true);
  is("the field it travels in", ADMITTED_FIELD, "mm_admit");
  is("a refused buyer is told plainly, with nothing charged", [/OrdersPausedError/.test(read("app/api/store/checkout/route.ts")), read("app/api/store/checkout/route.ts").includes('status=${error.reason === "paused" ? "paused"'), /paused: \{ title:/.test(read("lib/buyer-words/en.ts"))], [true, true, true]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

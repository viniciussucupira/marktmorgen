/**
 * Conditions in a sequence (lib/flow-rules.ts, lib/flows.ts), and buyers who
 * never reached the thanks page put on the list all the same
 * (lib/buyer-list.ts, lib/checkout-sweep.ts), added 11 October 2026. What is
 * checked:
 *
 *   - a condition reads what the list keeps — what somebody has, whether
 *     they paid, their labels — and nothing else;
 *   - a sequence ends for anyone who gets what it was selling, checked
 *     before each email, the first included;
 *   - an email with a condition goes only to those it holds for; the others
 *     skip it, their next email's wait counted from then, or leave there;
 *   - saving refuses a condition on a product the store does not have, and
 *     an end that would come before the first email;
 *   - a paid order is put on the list once, by the thanks page or by the
 *     five-minute job, whichever comes first.
 */
import { holds, reached, goalClash, readCondition } from "@/lib/flow-rules";
import { enroll, flowStats, readFlows, saveFlow, sendDueSteps } from "@/lib/flows";
import { importContactRows, noteProduct, parseContact, leadsKey, upsertContact } from "@/lib/contacts";
import { listOrder, listedAlready } from "@/lib/buyer-list";
import { sweepCheckouts } from "@/lib/checkout-sweep";
import { addProduct, claimHandle, ensureListId, ensureStatsId, setMailSettings, setStripeAccount, setSubscription, storeForEmail, storeForHandle } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const HOUR = 3_600_000;
const realNow = Date.now;
let shift = 0;
Date.now = () => realNow() + shift;

const sent: { to: string; subject: string }[] = [];
let sessions: Record<string, unknown>[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") {
    const body = JSON.parse(String(init?.body)) as { to: string | string[]; subject: string } | { to: string[]; subject: string }[];
    const all = Array.isArray(body) ? body : [body];
    for (const m of all) sent.push({ to: [m.to].flat()[0], subject: m.subject });
    return json(Array.isArray(body) ? { data: all.map((_, i) => ({ id: `email_${sent.length}_${i}` })) } : { id: `email_${sent.length}` });
  }
  if (url.pathname === "/v1/checkout/sessions") return json({ object: "list", data: sessions, has_more: false });
  return json({ object: "list", data: [], has_more: false });
}) as typeof fetch;

const to = (subject: string) => sent.filter((m) => m.subject === subject).map((m) => m.to).sort();
const run = () => sendDueSteps((handle) => storeForHandle(handle), Date.now() + 20_000);

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_conditions_only_a_stand_in";
  process.env.RESEND_API_KEY = "re_test_conditions_only_a_stand_in";

  part("A condition reads what the list keeps");
  const paid = new Set(["course"]);
  const lead = { ids: ["guide"], source: "free", tags: ["Spring Launch"] };
  const buyer = { ids: ["guide", "course"], source: "free", tags: [] };
  const atCheckout = { ids: [], source: "buyer", tags: [] };
  is("having a product, or not", [holds({ if: "has", productId: "course" }, buyer, paid), holds({ if: "lacks", productId: "course" }, lead, paid)], [true, true]);
  is("having paid: a product sold for money, or first agreeing at a checkout", [holds({ if: "buyer" }, buyer, paid), holds({ if: "buyer" }, atCheckout, paid), holds({ if: "lead" }, lead, paid)], [true, true, true]);
  is("a label, whatever its capitals and spaces", [holds({ if: "tag", tag: " spring launch" }, lead, paid), holds({ if: "untagged", tag: "Spring Launch" }, buyer, paid)], [true, true]);
  is("the end: one product, or anything paid for", [reached({ productId: "course" }, buyer, paid), reached({ any: true }, lead, paid), reached({ any: true }, atCheckout, paid)], [true, false, true]);
  is("a condition on a product the store does not have is refused", [readCondition({ if: "has", productId: "gone" }, () => false), readCondition({ if: "tag", tag: "  " }, () => true), readCondition({ if: "opened" }, () => true), readCondition(null, () => true)], ["bad", "bad", "bad", null]);
  is("an end that would come before the first email is refused", [
    goalClash("bought", null, { any: true }, false),
    goalClash("product", "course", { any: true }, true),
    goalClash("product", "course", { productId: "course" }, true),
    goalClash("joined", null, { any: true }, false),
    goalClash("product", "guide", { productId: "course" }, false),
  ], [true, true, true, false, false]);

  // ---- A store ---------------------------------------------------------------
  const OWNER = "harbor@example.com";
  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await ensureListId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0001", true);
  await setSubscription(OWNER, { customerId: "cus_Harbor0001", subscriptionId: "sub_Harbor0001", active: true, tier: "pro" });
  await setMailSettings(OWNER, { fromName: "Harbor Kitchen", address: "1 Main St, Portland, OR 97201" });
  const guide = await addProduct(OWNER, "Pantry Guide", "A free guide.", "0", null);
  const course = await addProduct(OWNER, "Weeknight Course", "Thirty dinners.", "49", null);
  const extra = await addProduct(OWNER, "Spice Chart", "A chart.", "9", null);
  if (!guide.ok || !course.ok || !extra.ok) throw new Error("no product");
  let store = (await storeForEmail(OWNER))!;
  const list = store.listId as string;

  part("Saved, and checked when saved");
  const steps = [
    { delayHours: 0, subject: "Welcome", body: "Hello." },
    { delayHours: 24, subject: "Not bought yet?", body: "The course.", when: { if: "lead" } },
    { delayHours: 24, subject: "For the launch list", body: "Early price.", when: { if: "tag", tag: "  VIP " }, otherwise: "end" },
    { delayHours: 24, subject: "Last call", body: "Closing.", when: { if: "lacks", productId: course.product.id }, otherwise: "skip" },
  ];
  is("a condition on a product that is not the store's", (await saveFlow(store, { name: "Launch", trigger: "joined", active: true, steps: [{ ...steps[0], when: { if: "has", productId: "nosuchproduct" } }] })).ok ? "saved" : "refused", "refused");
  const clash = await saveFlow(store, { name: "Launch", trigger: "bought", active: true, steps, goal: { any: true } });
  is("an end that would come first", clash.ok ? "saved" : clash.reason, "goal");
  const saved = await saveFlow(store, { name: "Launch", trigger: "joined", active: true, steps, goal: { productId: course.product.id } });
  const flow = saved.ok ? saved.flows[0] : null;
  is("kept as asked: the label trimmed, the others skipping unless told to leave", [
    flow?.goal,
    flow?.steps[0].when,
    flow?.steps[1].otherwise,
    flow?.steps[2].when,
    flow?.steps[2].otherwise,
  ], [{ productId: course.product.id }, undefined, "skip", { if: "tag", tag: "VIP" }, "end"]);

  part("Sent only to those it is for");
  // Ana took the free guide; Ben bought the course at a checkout; Cleo came in on an import labeled vip.
  await upsertContact(list, "ana@example.com", { agreed: true, explicit: true, source: "free", productId: guide.product.id, title: "Pantry Guide" });
  await upsertContact(list, "ben@example.com", { agreed: true, explicit: true, source: "buyer", productId: course.product.id, title: "Weeknight Course" });
  await importContactRows(list, [{ email: "cleo@example.com", name: "Cleo", tags: ["vip"] }]);
  store = (await storeForEmail(OWNER))!;
  for (const email of ["ana@example.com", "ben@example.com", "cleo@example.com"]) await enroll(store, email, { joined: true });
  await run();
  is("the first email: not to Ben, who already has what it sells", to("Welcome"), ["ana@example.com", "cleo@example.com"]);

  // Cleo buys something else: she has paid now, but not for the course.
  await noteProduct(list, "cleo@example.com", extra.product.id, "Spice Chart");
  shift += 25 * HOUR;
  await run();
  is("the second, for those who have not bought: Ana; Cleo skips it", to("Not bought yet?"), ["ana@example.com"]);
  is("and Cleo's next one waits its day, counted from the one she skipped", to("For the launch list"), []);

  shift += 25 * HOUR;
  await run();
  is("the third, for the label: Cleo, a day after the one she skipped; Ana leaves", to("For the launch list"), ["cleo@example.com"]);

  // Cleo buys the course before the last one.
  await noteProduct(list, "cleo@example.com", course.product.id, "Weeknight Course");
  shift += 25 * HOUR;
  await run();
  is("the last: nobody — Ana left, Cleo now has the course", to("Last call"), []);
  const stats = (await flowStats(await readFlows(list))).get(flow!.id);
  is("counted: who started, what went, who left by buying, what was skipped", stats, { started: 3, sent: 4, reached: 2, skipped: 2 });

  part("A paid order on the list, once");
  const order = { sessionId: "cs_test_thanks0000001", email: "dee@example.com", news: true, created: Math.floor(Date.now() / 1000), products: [{ id: course.product.id, title: "Weeknight Course" }, { id: extra.product.id, title: "Spice Chart" }] };
  is("put on the list by whichever comes first, and not again", [await listOrder(store, order), await listOrder(store, order), (await listedAlready([order.sessionId]))[0]], ["done", "already", true]);
  const [dee] = await redis.pipeline([["HGET", leadsKey(list), "dee@example.com"]]);
  is("with everything the order handed over", parseContact(dee)?.ids, [course.product.id, extra.product.id]);
  is("somebody who did not tick the box and is not on the list is added to nothing", [await listOrder(store, { ...order, sessionId: "cs_test_thanks0000002", email: "eve@example.com", news: false }), parseContact((await redis.pipeline([["HGET", leadsKey(list), "eve@example.com"]]))[0])], ["done", null]);

  // Fay paid and closed the tab before the thanks page: the job finds her checkout.
  sessions = [
    {
      id: "cs_test_closedthetab01",
      object: "checkout.session",
      status: "complete",
      payment_status: "paid",
      mode: "payment",
      created: Math.floor(Date.now() / 1000) - 600,
      amount_total: 4900,
      currency: "usd",
      customer_details: { email: "fay@example.com" },
      metadata: { store: "harbor", product: course.product.id, news: "yes" },
    },
  ];
  const counts = await sweepCheckouts(Date.now() + 20_000);
  const [fay] = await redis.pipeline([["HGET", leadsKey(list), "fay@example.com"]]);
  is("a buyer who never reached the thanks page is on the list, with what they bought", [counts.listed, parseContact(fay)?.agreed, parseContact(fay)?.ids], [1, true, [course.product.id]]);
  is("and the job does not do it twice", (await sweepCheckouts(Date.now() + 20_000)).listed, 0);

  Date.now = realNow;
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

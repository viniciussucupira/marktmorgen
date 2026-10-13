/**
 * Discounts beside full price (lib/discount-impact.ts; added 12 October
 * 2026). Checked:
 *
 *   - each checkout is grouped by the discount it had, from the store's own
 *     note of it and what Stripe took off;
 *   - sales, revenue, what was given off, refunds and buyers who bought
 *     again, for the last 90 days only, in the store's currency, without
 *     one-click extras or tips;
 *   - nothing to show when no sale had a discount;
 *   - worked out while the sales are read, with nothing more asked of Stripe;
 *   - members by how they joined: full price first, then each discount.
 */
import { discountImpact, discountKindOf, entryOf, type DiscountSale } from "@/lib/discount-impact";
import { type Sub, entriesFrom } from "@/lib/membership-numbers";
import { readSales } from "@/lib/stats";
import { claimHandle, ensureStatsId, setStripeAccount, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

process.env.STRIPE_SECRET_KEY = "sk_test_discount_impact_only";

const DAY = 86_400_000;
const NOW = Date.now();
const asked: string[] = [];
let sessions: Record<string, unknown>[] = [];
let refunds: Record<string, unknown>[] = [];

globalThis.fetch = (async (input: string | URL | Request) => {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^\/v1/, "");
  asked.push(path);
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
  if (path === "/checkout/sessions") return json({ object: "list", data: sessions, has_more: false });
  if (path === "/refunds") return json({ object: "list", data: refunds, has_more: false });
  return json({ object: "list", data: [], has_more: false });
}) as typeof fetch;

const checkout = (email: string, daysAgo: number, paid: number, off: number, meta: Record<string, string> = {}, pi = "") => ({
  created: NOW - daysAgo * DAY,
  cents: paid,
  currency: "usd",
  upsell: false,
  paymentIntent: pi,
  row: { customer_details: { email }, total_details: { amount_discount: off }, metadata: { store: "harbor", product: "guide", ...meta } },
});

async function main(): Promise<void> {
  redis.clear();

  part("Which discount a sale had");
  const row = (meta: Record<string, string>, off = 0) => ({ metadata: meta, total_details: { amount_discount: off } });
  is(
    "from the store's own note, else what Stripe took off",
    [discountKindOf(row({})), discountKindOf(row({}, 500)), discountKindOf(row({ code: "SPRING" }, 500)), discountKindOf(row({ sale: "20" }, 400)), discountKindOf(row({ fair: "IN:40" }, 800)), discountKindOf(row({ intro: "3" }, 1500)), discountKindOf(row({ winback: "yes" }, 1000))],
    ["full", "code", "code", "sale", "fair", "intro", "comeback"],
  );

  part("Full price beside each discount");
  const sales: DiscountSale[] = [
    checkout("ana@example.com", 5, 2000, 0, {}, "pi_full_ana"),
    checkout("ben@example.com", 10, 2000, 0, {}, "pi_full_ben"),
    checkout("cy@example.com", 20, 1500, 500, { code: "SPRING" }, "pi_code_cy"),
    checkout("dee@example.com", 25, 1500, 500, { code: "SPRING" }, "pi_code_dee"),
    checkout("dee@example.com", 25, 1500, 500, { code: "SPRING" }, "pi_code_dee2"),
    // Dee came back later, at full price.
    checkout("dee@example.com", 3, 2000, 0, {}, "pi_full_dee"),
    // A one-click extra, a tip, another currency and a sale from before the 90 days are left out.
    { ...checkout("cy@example.com", 20, 900, 0), upsell: true },
    checkout("eve@example.com", 4, 500, 0, { kind: "tip" }),
    { ...checkout("fay@example.com", 4, 2000, 0), currency: "eur" },
    checkout("gus@example.com", 120, 1500, 500, { code: "OLD" }),
  ];
  const rows = discountImpact(sales, new Set(["pi_code_cy"]), "usd", NOW);
  is("each group's sales, revenue, what was given off, refunded, and buyers who bought again", rows, [
    { kind: "full", sales: 3, cents: 6000, off: 0, refunded: 0, buyers: 3, again: 0 },
    { kind: "code", sales: 3, cents: 4500, off: 1500, refunded: 1, buyers: 2, again: 1 },
  ]);
  is("nothing to set beside full price, nothing shown", discountImpact([checkout("ana@example.com", 5, 2000, 0)], new Set(), "usd", NOW), null);

  part("Worked out while the sales are read");
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setStripeAccount("owner@example.com", "acct_1TestHarbor0001", true);
  const store = (await storeForEmail("owner@example.com"))!;
  const session = (id: string, email: string, daysAgo: number, paid: number, off: number, meta: Record<string, string> = {}) => ({
    id,
    status: "complete",
    payment_status: "paid",
    amount_total: paid,
    currency: "usd",
    created: Math.floor((NOW - daysAgo * DAY) / 1000),
    payment_intent: `pi_${id.slice(8)}`,
    customer_details: { email },
    total_details: { amount_discount: off, amount_tax: 0 },
    metadata: { store: "harbor", product: "guide", ...meta },
  });
  sessions = [
    session("cs_test_full00000001", "ana@example.com", 2, 2000, 0),
    session("cs_test_sale00000001", "ben@example.com", 6, 1600, 400, { sale: "20" }),
  ];
  refunds = [{ id: "re_1", status: "succeeded", amount: 1600, currency: "usd", created: Math.floor((NOW - DAY) / 1000), payment_intent: "pi_sale00000001" }];
  const read = await readSales(store, NOW);
  is("in the sales the studio reads", read?.discounts, {
    rows: [
      { kind: "full", sales: 1, cents: 2000, off: 0, refunded: 0, buyers: 1, again: 0 },
      { kind: "sale", sales: 1, cents: 1600, off: 400, refunded: 1, buyers: 1, again: 0 },
    ],
    refundsRead: true,
  });
  is("with nothing more asked of Stripe than the sales, renewals and refunds", [...new Set(asked)].sort(), ["/checkout/sessions", "/invoices", "/payment_intents", "/refunds"]);

  part("Members by how they joined");
  is("from what the checkout wrote on the membership", [entryOf({}), entryOf({ intro: "3" }), entryOf({ winback: "yes" }), entryOf({ discount: "code" }), entryOf({ discount: "sale" }), entryOf({ discount: "x" })], ["full", "intro", "comeback", "code", "sale", "full"]);
  const now = Math.floor(NOW / 1000);
  const sub = (start: number, ended: number, entry: Sub["entry"]): Sub => ({
    id: "sub_x", status: ended ? "canceled" : "active", product: "club", amount: 2000, currency: "usd", interval: "month", count: 1,
    start: now - start * 86_400, ended: ended ? now - ended * 86_400 : 0, trialEnd: 0, channel: "direct", entry, canceledAt: 0, cancelCause: "", feedback: "", comment: "",
  });
  const entries = entriesFrom([sub(200, 0, "full"), sub(150, 0, "full"), sub(200, 160, "intro"), sub(180, 0, "intro"), sub(20, 0, "code")], now);
  is("full price first, then each discount, with who stayed three months in", entries.map((e) => [e.entry, e.started, e.running, e.stayed3]), [
    ["full", 2, 2, 1],
    ["code", 1, 1, null],
    ["intro", 2, 1, 0.5],
  ]);
  is("none at all with no discount", entriesFrom([sub(200, 0, "full")], now), []);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

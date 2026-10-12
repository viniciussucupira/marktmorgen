/**
 * Who bought (lib/stats.ts, buyersFrom; added 12 October 2026). Checked:
 *
 *   - a buyer is an address, whatever its capitals;
 *   - an order is a checkout: an extra taken in one click after it adds to
 *     its buyer's money and is not an order of its own;
 *   - "came back" is a buyer of the window who had bought before it began,
 *     as far back as the sales read; "more than once" is two orders inside it;
 *   - support for the creator's work, and money in another currency, are not
 *     counted;
 *   - the biggest buyers of the 90 days, most money first, each with the
 *     latest sale that opens their page.
 */
import { buyersFrom, type Sale } from "@/lib/stats";
import { done, is, part } from "./check";

const NOW = Date.parse("2026-10-12T12:00:00Z");
const DAY = 86_400_000;
let n = 0;

function sale(email: string, daysAgo: number, cents: number, extra: { upsell?: boolean; currency?: string; kind?: string } = {}): Sale {
  n += 1;
  const id = extra.upsell ? `pi_test${String(n).padStart(12, "0")}` : `cs_test_${String(n).padStart(12, "0")}`;
  return {
    created: NOW - daysAgo * DAY,
    product: "p1",
    cents,
    currency: extra.currency ?? "usd",
    row: extra.upsell
      ? { id, receipt_email: email, metadata: { kind: "upsell" } }
      : { id, customer_details: { email }, metadata: extra.kind ? { kind: extra.kind } : {} },
    upsell: Boolean(extra.upsell),
    source: "",
    medium: "",
    campaign: "",
    first: "",
    content: "",
    country: "",
    paymentIntent: "",
  };
}

const sales: Sale[] = [
  // Ana: bought 120 days ago, and twice this week, one with an extra.
  sale("Ana@Example.com", 120, 2000),
  sale("ana@example.com", 3, 3000),
  sale("ana@example.com", 3, 900, { upsell: true }),
  sale("ana@example.com", 1, 1000),
  // Ben: once, 20 days ago.
  sale("ben@example.com", 20, 5000),
  // Cy: once, 60 days ago, and once 100 days ago (before the 90).
  sale("cy@example.com", 60, 1500),
  sale("cy@example.com", 100, 1500),
  // Not counted: support for the creator's work, and euros.
  sale("dee@example.com", 2, 700, { kind: "tip" }),
  sale("eve@example.com", 2, 4000, { currency: "eur" }),
];

part("The last 7 days");
const b = buyersFrom(sales, "usd", NOW);
is("one buyer, two orders, the extra in the money", [b.d7.buyers, b.d7.orders, b.d7.cents], [1, 2, 4900]);
is("she had bought before, and bought more than once", [b.d7.returning, b.d7.repeat], [1, 1]);

part("The last 30 and 90 days");
is("30 days: Ana and Ben", [b.d30.buyers, b.d30.orders, b.d30.cents, b.d30.returning, b.d30.repeat], [2, 3, 9900, 1, 1]);
is("90 days: Cy came back too", [b.d90.buyers, b.d90.orders, b.d90.cents, b.d90.returning, b.d90.repeat], [3, 4, 11400, 2, 1]);

part("The biggest buyers");
is("most money first, the address as one", b.top.map((t) => [t.email, t.cents, t.orders]), [["ben@example.com", 5000, 1], ["ana@example.com", 4900, 2], ["cy@example.com", 1500, 1]]);
is("each opens by its latest sale", b.top.find((t) => t.email === "ana@example.com")?.last, NOW - 1 * DAY);
is("support and euros are nowhere", b.top.some((t) => t.email.startsWith("dee") || t.email.startsWith("eve")), false);

part("Nothing sold");
const none = buyersFrom([], "usd", NOW);
is("zeros, and no buyers listed", [none.d90, none.top], [{ buyers: 0, orders: 0, cents: 0, returning: 0, repeat: 0 }, []]);

done();

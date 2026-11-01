/**
 * The creator's own profit before taxes (545 [LU1], unit 1,
 * lib/creator-profit-rules.ts; added 1 November 2026). Checked: an empty
 * cost is "not set", never 0; the fee is the one given, never estimated;
 * refunds, costs per unit, other costs and ads taken off; a missing cost
 * makes the line incomplete and an unread figure unavailable, never zero;
 * currencies apart; a loss said in words; the before-taxes sentence; an
 * export cell never runs as a formula.
 */
import { BEFORE_TAXES, SOURCES, csvRow, orderProfit, periodProfit, profitWords, readCostPerSale } from "@/lib/creator-profit-rules";
import { done, is, part } from "./check";

part("The cost the creator enters");
is("empty is not set, never 0", [readCostPerSale("", "usd"), readCostPerSale("   ", "usd")], [null, null]);
is("an amount in the store's currency", [readCostPerSale("4.50", "usd"), readCostPerSale("300", "jpy")], [450, 300]);
is("not an amount: refused, not guessed", [readCostPerSale("cheap", "usd"), readCostPerSale("-2", "usd")], [undefined, undefined]);
is("zero, typed, is zero", readCostPerSale("0", "usd"), 0);

part("One order");
const order = { currency: "usd", paid: 4900, refunded: 0, fee: 172, lines: [{ productId: "a", units: 1, costPerSale: 800 }], otherCosts: 0 };
is("paid, less the real fee and the cost", orderProfit(order), { state: "complete", cents: 3928 });
is("the fee is exactly the one read, not a rate", orderProfit({ ...order, fee: 199 }), { state: "complete", cents: 3901 });
is("a refund is taken off", orderProfit({ ...order, refunded: 4900 }), { state: "complete", cents: -972 });
is("cost per unit, times units", orderProfit({ ...order, lines: [{ productId: "a", units: 3, costPerSale: 800 }] }), { state: "complete", cents: 2328 });
is("a cost not set: incomplete, never as if 0", orderProfit({ ...order, lines: [...order.lines, { productId: "b", units: 1, costPerSale: null }] }), { state: "incomplete", why: "cost not set" });
is("a fee or a payment not read: unavailable", [orderProfit({ ...order, fee: null }).state, orderProfit({ ...order, paid: null }).state, orderProfit({ ...order, otherCosts: null }).state], ["unavailable", "unavailable", "unavailable"]);

part("A period, per currency");
const eur = { ...order, currency: "eur", paid: 3000, fee: 120, lines: [{ productId: "a", units: 1, costPerSale: 500 }] };
const totals = periodProfit([order, order, eur], { usd: 1000 });
is("each currency on its own, ads taken off where they were spent", [totals.get("usd"), totals.get("eur")], [{ state: "complete", cents: 3928 * 2 - 1000 }, { state: "complete", cents: 2380 }]);
is("one incomplete order makes its currency's total incomplete", periodProfit([order, { ...order, lines: [{ productId: "b", units: 1, costPerSale: null }] }], {}).get("usd"), { state: "incomplete", why: "cost not set" });
is("ads that could not be read make the total unavailable", periodProfit([order], { usd: null }).get("usd"), { state: "unavailable" });

part("Said plainly");
is("a loss in words, not only a color", profitWords({ state: "complete", cents: -972 }, "usd"), "$9.72 loss");
is("incomplete and unavailable in words", [profitWords({ state: "incomplete", why: "cost not set" }, "usd"), profitWords({ state: "unavailable" }, "usd")], ["Incomplete: cost not set", "Count unavailable"]);
is("before taxes, and no tax advice", BEFORE_TAXES, "Before taxes. Marktmorgen does not know your taxes; check with your own tax rules.");
is("where each number comes from", [SOURCES.fee, SOURCES.cost, SOURCES.ads], ["from your Stripe account", "you entered", "recorded ads"]);

part("The export");
is("a plain row", csvRow(["Bread course", "$39.28", 1]), "Bread course,$39.28,1");
is("commas and quotes kept in their cell", csvRow(['Bread, "sourdough"']), '"Bread, ""sourdough"""');
is("a cell that starts like a formula stays text", [csvRow(["=HYPERLINK(1)"]), csvRow(["+1"]), csvRow(["@x"])], ["'=HYPERLINK(1)", "'+1", "'@x"]);
done();

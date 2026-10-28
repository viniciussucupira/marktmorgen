import { test } from "node:test";
import assert from "node:assert/strict";
import { bindStripeDisputePurchase } from "@/lib/dispute-purchase-binding";
function fixture() {
  const charge = { object: "charge", id: "ch_fixture", paid: true, captured: true, created: 200, payment_intent: "pi_fixture", amount: 1000, amount_captured: 1000, currency: "usd" };
  const session = {
    object: "checkout.session", id: "cs_fixture", mode: "payment", status: "complete", payment_status: "paid",
    metadata: { store: "old-handle", product: "a".repeat(32), title: "Original synthetic title" },
    payment_intent: { object: "payment_intent", status: "succeeded", id: "pi_fixture", latest_charge: charge },
    customer_details: { email: "buyer@example.test" }, amount_total: 1000, currency: "usd", created: 100,
  };
  const dispute = { object: "dispute", id: "du_fixture", charge: "ch_fixture", payment_intent: "pi_fixture", amount: 500, currency: "usd" };
  return { account: "acct_fixture", saleHandles: new Set(["old-handle", "new-handle"]), session, dispute };
}
test("binds partial dispute to original account, payment, buyer and recorded title", () => {
  const bound = bindStripeDisputePurchase(fixture());
  assert.ok(bound);
  assert.equal(bound.disputedAmount, 500);
  assert.equal(bound.amount, 1000);
  assert.equal(bound.buyerEmail, "buyer@example.test");
  assert.equal(bound.title, "Original synthetic title");
  assert.equal(bound.purchase, "cs_fixture");
  assert.equal(bound.checkoutCreatedAt, 100);
  assert.equal(bound.chargeCreatedAt, 200);
  assert.equal("paidAt" in bound, false);
  assert.equal("submitted" in bound, false);
});
test("renames work only through server-resolved sale handles", () => {
  const input = fixture();
  input.saleHandles = new Set(["unrelated"]);
  assert.equal(bindStripeDisputePurchase(input), null);
});
test("different charge or intent cannot borrow another purchase's receipt", () => {
  for (const key of ["charge", "payment_intent"] as const) {
    const input = fixture();
    input.dispute[key] = key === "charge" ? "ch_other" : "pi_other";
    assert.equal(bindStripeDisputePurchase(input), null);
  }
  const input = fixture();
  input.session.payment_intent.latest_charge.payment_intent = "pi_other";
  assert.equal(bindStripeDisputePurchase(input), null);
});
test("unpaid, nonpayment and malformed records never become paid proof", () => {
  for (const patch of [
    { mode: "subscription" }, { payment_status: "unpaid" }, { status: "open" },
    { object: "other" }, { created: NaN }, { created: 201 }, { amount_total: 999 }, { currency: "eur" },
  ]) {
    const input = fixture();
    Object.assign(input.session, patch);
    assert.equal(bindStripeDisputePurchase(input), null);
  }
  assert.equal(bindStripeDisputePurchase({ ...fixture(), session: null }), null);
  assert.equal(bindStripeDisputePurchase({ ...fixture(), dispute: [] }), null);
});
test("oversized dispute, unknown buyer and missing expanded payment fail closed", () => {
  const oversized = fixture(); oversized.dispute.amount = 1001;
  assert.equal(bindStripeDisputePurchase(oversized), null);
  const buyer = fixture(); buyer.session.customer_details.email = "";
  assert.equal(bindStripeDisputePurchase(buyer), null);
  const unexpanded = fixture();
  assert.equal(bindStripeDisputePurchase({ ...unexpanded, session: { ...unexpanded.session, payment_intent: "pi_fixture" } }), null);
  const missing = fixture();
  assert.equal(bindStripeDisputePurchase({ ...missing, dispute: { ...missing.dispute, payment_intent: null } }), null);
});
test("expanded dispute references are supported without changing purchase identifiers", () => {
  const input = fixture();
  const bound = bindStripeDisputePurchase({ ...input, dispute: { ...input.dispute, charge: { id: "ch_fixture" }, payment_intent: { id: "pi_fixture" } } });
  assert.equal(bound?.charge, "ch_fixture");
  assert.equal(bound?.paymentIntent, "pi_fixture");
});

test("authorization without capture or a succeeded intent is not settled purchase proof", () => {
  const authorization = fixture();
  authorization.session.payment_intent.latest_charge.captured = false;
  assert.equal(bindStripeDisputePurchase(authorization), null);
  const partial = fixture();
  partial.session.payment_intent.latest_charge.amount_captured = 800;
  assert.equal(bindStripeDisputePurchase(partial), null);
  const incomplete = fixture();
  incomplete.session.payment_intent.status = "requires_capture";
  assert.equal(bindStripeDisputePurchase(incomplete), null);
});

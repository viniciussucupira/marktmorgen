import { paidStepProblem, readFunnelPaymentChecks } from "@/lib/funnel-payment-checks";
import type { Listing, Store } from "@/lib/store";
import { done, is, part } from "./check";
process.env.STRIPE_SECRET_KEY = "sk_test_local_configuration_only";
const store = { stripeAccountId: "acct_test", stripeChargesEnabled: true, subscriptionActive: true, suspended: false } as unknown as Store;
const product = { id: "offer1", title: "Offer", priceCents: 1000, hidden: false, call: null, course: null, podcast: null, shipping: null, options: [], recurring: null, bundle: null, link: "https://example.com/delivery", file: null } as unknown as Listing;
part("Paid funnel configuration follows the existing sale rules");
is("ready link offer", paidStepProblem(store, product, 0), null);
is("disabled payments found", paidStepProblem({ ...store, stripeChargesEnabled: false }, product, 0)?.includes("Payments are unavailable"), true);
is("expired subscription found", paidStepProblem({ ...store, subscriptionActive: false }, product, 0)?.includes("Payments are unavailable"), true);
is("missing delivery found", paidStepProblem(store, { ...product, link: null }, 0)?.includes("delivery"), true);
is("empty course found", paidStepProblem(store, { ...product, link: null, course: { id: "course1", lessons: 0 } } as Listing, 0)?.includes("delivery"), true);
is("course with lessons", paidStepProblem(store, { ...product, link: null, course: { id: "course1", lessons: 2 } } as Listing, 0), null);
is("free sign-up is not claimed to be checked", paidStepProblem(store, { ...product, priceCents: 0 }, 0), null);
is("draft availability is checked separately", paidStepProblem(store, { ...product, hidden: true }, 0), null);
const bundle = { ...product, link: null, bundle: ["a", "b", "c", "d"], pick: 3 } as Listing;
is("bundle needs enough deliverable choices", paidStepProblem(store, bundle, 2)?.includes("enough deliverable"), true);
is("bundle with enough choices", paidStepProblem(store, bundle, 3), null);
is("whole bundle needs at least two", paidStepProblem(store, { ...bundle, pick: null }, 1)?.includes("enough deliverable"), true);
async function main() {
  const catalogStore = { ...store, catalog: { id: null, inline: null, items: [{ id: product.id }], head: [product] } } as unknown as Store;
  is("configured paid step checked", await readFunnelPaymentChecks(catalogStore, { steps: [{ kind: "product", id: product.id }] }), []);
  is("ordinary pages do not read unrelated products", await readFunnelPaymentChecks(catalogStore, { steps: [{ kind: "page", id: "page1" }] }), []);
  is("foreign product cannot become a ready step", (await readFunnelPaymentChecks(catalogStore, { steps: [{ kind: "product", id: "foreign1" }] }))[0]?.includes("could not be found"), true);
  const broken = { ...catalogStore, catalog: { ...catalogStore.catalog, get head(): Listing[] { throw new Error("storage unavailable"); } } } as Store;
  let unknown = false;
  try { await readFunnelPaymentChecks(broken, { steps: [{ kind: "product", id: product.id }] }); } catch { unknown = true; }
  is("failed reads remain unknown", unknown, true);
  done();
}
void main();

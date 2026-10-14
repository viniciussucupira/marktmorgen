import { readFunnelPaymentChecks } from "@/lib/funnel-payment-checks";
import type { Store } from "@/lib/store";
import { readFunnelPageChecks } from "@/lib/funnel-page-checks";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
async function main() {
  redis.clear();
  const store = { statsId: "forms-a", sitePages: [{ id: "abcd123456", title: "Apply", from: 0 }] } as unknown as Store;
  const funnel = { steps: [{ kind: "page" as const, id: "abcd123456" }] };
  const key = "nl:product:page:forms-a:site-abcd123456";
  part("Saved page form availability");
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "" }] })]]);
  is("empty binding needs correction", (await readFunnelPageChecks(store, funnel))[0]?.includes("no selected form"), true);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "abcdef1234" }] })]]);
  is("removed form is identified", (await readFunnelPageChecks(store, funnel))[0]?.includes("no longer available"), true);
  await redis.pipeline([["HSET", "nl:forms:forms-b", "abcdef1234", "{}"]]);
  is("another store cannot satisfy the binding", (await readFunnelPageChecks(store, funnel)).length, 1);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "hero" }] })]]);
  is("page without form has no form warning", await readFunnelPageChecks(store, funnel), []);
  await redis.pipeline([["SET", key, "broken"]]);
  let failed = false;
  try { await readFunnelPageChecks(store, funnel); } catch { failed = true; }
  is("malformed page stays unknown", failed, true);
  is("kept-back page is handled by availability review", await readFunnelPageChecks({ ...store, sitePages: [{ ...store.sitePages[0], from: -1 }] }, funnel), []);
  is("foreign page is not read", await readFunnelPageChecks(store, { steps: [{ kind: "page", id: "foreign" }] }), []);
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "abcdef1234" }] })]]);
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", JSON.stringify({ id: "abcdef1234", name: "Apply", fields: [{ id: "field1", type: "email", label: "Email", required: true }], outcomes: [], offerList: false, updatedAt: 1 })]]);
  is("valid selected-store form passes", await readFunnelPageChecks(store, funnel), []);
  await redis.pipeline([["HSET", "nl:forms:forms-a", "abcdef1234", "broken"]]);
  let invalidForm = false;
  try { await readFunnelPageChecks(store, funnel); } catch { invalidForm = true; }
  is("malformed stored form stays unknown", invalidForm, true);
  const pipeline = redis.pipeline;
  try {
    redis.pipeline = async () => { throw new Error("Injected read failure"); };
    let unavailable = false;
    try { await readFunnelPageChecks(store, funnel); } catch { unavailable = true; }
    is("storage failure never becomes a clear review", unavailable, true);
  } finally { redis.pipeline = pipeline; }
  await redis.pipeline([["SET", key, JSON.stringify({ blocks: [{ kind: "form", form: "" }] })]]);
  is("form warning reaches the existing saved funnel review", (await readFunnelPaymentChecks({ ...store, catalog: { id: null, inline: null, items: [], head: [] } } as unknown as Store, funnel))[0]?.includes("no selected form"), true);
  done();
}
void main();

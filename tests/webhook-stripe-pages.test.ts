import { addEndpoint, watchStripe } from "@/lib/webhooks";
import { claimHandle, ensureStatsId, setStripeAccount, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

process.env.STRIPE_SECRET_KEY = "sk_test_webhook_page_only";
const account = "acct_EventPageTest01";
const oldAnchor = "evt_PreviousPage01";
const row = { id: "evt_ObservedPage01", type: "payment_intent.succeeded", data: { object: {} } };
let pages: unknown[] = [];
const requests: URL[] = [];
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.origin !== "https://api.stripe.com" || url.pathname !== "/v1/events" ||
      init?.method !== "GET" || new Headers(init.headers).get("Stripe-Account") !== account)
    throw new Error("unexpected synthetic webhook operation");
  requests.push(url);
  if (!pages.length) throw new Error("unexpected extra page request");
  return Response.json(pages.shift());
}) as typeof fetch;

async function setup(anchor: boolean) {
  redis.clear();
  await claimHandle("event-pages@example.com", "event-page-shop", "Event Pages", "");
  await ensureStatsId("event-pages@example.com");
  const connected = await setStripeAccount("event-pages@example.com", account);
  is("synthetic connected account is saved", connected.ok, true);
  const store = (await storeForEmail("event-pages@example.com"))!;
  const added = await addEndpoint(store, "https://hooks.example.net/events", ["sale.completed"]);
  is("synthetic retained endpoint is configured", added.ok, true);
  const key = `nl:hooks:anchor:${store.statsId}`;
  if (anchor) await redis.pipeline([["SET", key, oldAnchor]]);
  requests.length = 0;
  return key;
}

async function main() {
  const invalid: unknown[] = [
    null, [], {}, { data: null, has_more: false }, { data: {}, has_more: false },
    { data: [] }, { data: [], has_more: null }, { data: [], has_more: "false" },
    { data: [], has_more: true }, { data: [null], has_more: false },
    { data: [row, {}], has_more: false }, { data: [{ id: "wrong" }], has_more: false },
    { data: [row, row], has_more: false },
    { data: Array.from({ length: 101 }, (_, i) => ({ id: `evt_Overflow${i}` })), has_more: false },
  ];
  part("Malformed event pages cannot advance the retained anchor");
  for (const anchored of [false, true]) {
    for (const bad of invalid) {
      const key = await setup(anchored);
      pages = [bad];
      is("unknown pages are not reported as handled events", await watchStripe(Date.now() + 10000), { stores: 1, events: 0 });
      is("the prior anchor is preserved", await redis.pipeline([["GET", key]]), [anchored ? oldAnchor : null]);
      is("the refusal makes no fallback or extra request", requests.length, 1);
      is("the existing page limit is preserved", requests[0].searchParams.get("limit"), "100");
      is("the incremental cursor remains exact", requests[0].searchParams.get("ending_before"), anchored ? oldAnchor : null);
    }
  }
  part("A malformed older page cannot commit the first page's newest event");
  let key = await setup(false);
  pages = [{ data: [row], has_more: true }, { data: null, has_more: false }];
  is("the incomplete first-run history handles no events", await watchStripe(Date.now() + 10000), { stores: 1, events: 0 });
  is("the incomplete first-run history has no anchor", await redis.pipeline([["GET", key]]), [null]);
  is("the next older page uses the observed ID", requests.map(url => url.searchParams.get("starting_after")), [null, row.id]);

  part("Explicit empty and valid observations remain available");
  for (const anchored of [false, true]) {
    key = await setup(anchored);
    pages = [{ data: [], has_more: false }];
    is("an explicit empty final page is accepted", await watchStripe(Date.now() + 10000), { stores: 1, events: 0 });
    is("an empty final page leaves the anchor intact", await redis.pipeline([["GET", key]]), [anchored ? oldAnchor : null]);
    pages = [{ data: [row], has_more: false }];
    is("a valid event is handled on the real watcher path", await watchStripe(Date.now() + 10000), { stores: 1, events: 1 });
    is("a valid final page advances to its observed ID", await redis.pipeline([["GET", key]]), [row.id]);
  }
  key = await setup(false);
  const older = { ...row, id: "evt_OlderPage01" };
  pages = [{ data: [row], has_more: true }, { data: [older], has_more: false }];
  is("valid initial pagination handles both pages", await watchStripe(Date.now() + 10000), { stores: 1, events: 2 });
  is("initial pagination commits the newest observed ID", await redis.pipeline([["GET", key]]), [row.id]);
  done();
}
main();

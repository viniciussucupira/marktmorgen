import { done, is, part } from "./check";
import { store as redis } from "./redis-stub";
import { paidPeriod } from "./billing-period-fixture";

async function main(): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.STRIPE_SECRET_KEY;
  const previousApi = process.env.STRIPE_API;
  process.env.STRIPE_SECRET_KEY = "sk_test_order_list_only_a_stand_in";
  process.env.STRIPE_API = "http://127.0.0.1:4999/v1";
  let reply: unknown = {};
  let status = 200;
  const calls: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.origin !== "http://127.0.0.1:4999" || (init?.method ?? "GET") !== "GET") {
      throw new Error("Only synthetic order reads are allowed");
    }
    calls.push(url.pathname);
    if (url.pathname === "/v1/checkout/sessions") return new Response(JSON.stringify(reply), { status });
    if (url.pathname === "/v1/payment_intents") return new Response(JSON.stringify({data:[]}));
    throw new Error("Unexpected synthetic endpoint");
  }) as typeof fetch;
  try {
    redis.clear();
    const { claimHandle, setStripeAccount, setSubscription, storeForEmail } = await import("@/lib/store");
    const { listSales } = await import("@/lib/store-checkout");
    const email = "order-list-proof@example.test";
    await claimHandle(email, "orderlistproof", "Order history proof", "");
    await setStripeAccount(email, "acct_OrderListProof0001", true);
    await setSubscription(email, {customerId:"cus_OrderListProof1",subscriptionId:"sub_OrderListProof1",active:true,period:paidPeriod()});
    const store = (await storeForEmail(email))!;
    part("An unreadable order list must not appear empty");
    for (const value of [null, [], {}, {data:null}, {data:{}}, {data:""}, {data:[null]}, {data:[[]]}, {data:[42]}]) {
      reply=value;
      const before=calls.length;
      is("malformed history is an error", (await listSales(store)).state,"error");
      is("no extra provider read follows a malformed history",calls.length-before,1);
    }
    reply={data:[]};
    const beforeEmpty=calls.length;
    const empty=await listSales(store);
    is("an explicit empty list stays valid",empty.state,"ok");
    if(empty.state!=="ok")throw new Error("Expected an explicit empty history");
    is("an explicit empty history has no sales",empty.sales.length,0);
    is("the existing two bounded reads are preserved",calls.length-beforeEmpty,2);

    reply={data:[{id:"cs_test_orderproof",status:"complete",payment_status:"paid",
      created:Math.floor(Date.now()/1000),amount_total:1200,currency:"usd",
      metadata:{store:store.handle,title:"Original creator title"},
      customer_details:{email:"synthetic-buyer@example.test"}}]};
    const sale=await listSales(store);
    if(sale.state!=="ok")throw new Error("Expected a readable paid order");
    is("valid paid history remains visible",sale.sales.length,1);
    is("the historical title stays intact",sale.sales[0].title,"Original creator title");
    is("the persisted order identifier stays intact",sale.sales[0].reference,"cs_test_orderproof");
    status=500;
    reply={data:[]};
    is("an HTTP failure is not an empty history",(await listSales(store)).state,"error");
    done();
  } finally {
    globalThis.fetch=previousFetch;
    if(previousKey===undefined)delete process.env.STRIPE_SECRET_KEY;else process.env.STRIPE_SECRET_KEY=previousKey;
    if(previousApi===undefined)delete process.env.STRIPE_API;else process.env.STRIPE_API=previousApi;
  }
}
void main();

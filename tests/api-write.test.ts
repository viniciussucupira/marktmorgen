/**
 * The API's writing half (lib/api-write.ts), through its own routes, as a
 * creator's tool would call them. What is checked:
 *
 *   - only a key made to write may write; every key made to read stays one;
 *   - nobody is added to the list without the caller's word that they
 *     agreed, and nobody who unsubscribed is ever added back;
 *   - labels change only for somebody on the list;
 *   - a product is given as an import gives one, never a membership; the
 *     email goes only when asked for; and the API takes back only what the
 *     API gave.
 */
import { addProduct, claimHandle, ensureListId, ensureStatsId, setProductLink, setSubscription, storeForEmail } from "@/lib/store";
import { makeKey } from "@/lib/api-keys";
import { leadsKey, parseContact } from "@/lib/contacts";
import { grantImported, importedFor } from "@/lib/imported-purchases";
import { POST as postLead } from "@/app/api/v1/leads/route";
import { POST as postLabels } from "@/app/api/v1/leads/labels/route";
import { DELETE as deleteAccess, POST as postAccess } from "@/app/api/v1/access/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

type Sent = { to: string | string[]; subject: string; text: string };
const emails: Sent[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname === "api.resend.com") {
    emails.push(JSON.parse(String(init?.body)) as Sent);
    return new Response(JSON.stringify({ id: "email_1" }));
  }
  return new Response(JSON.stringify({ error: { message: `no stand-in for ${url}` } }), { status: 404 });
}) as typeof fetch;

const call = async (handler: (r: Request) => Promise<Response>, key: string, body: unknown, method = "POST") => {
  const response = await handler(
    new Request("https://marktmorgen.com/api/v1/x", { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  );
  return { status: response.status, json: (await response.json()) as { error?: string; data?: Record<string, unknown> } };
};

async function main(): Promise<void> {
  process.env.RESEND_API_KEY = "re_test_api_write_only_a_stand_in";
  redis.clear();
  const OWNER = "owner@example.com";
  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  await ensureListId(OWNER);
  await setSubscription(OWNER, { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, period: paidPeriod() });
  const guide = await addProduct(OWNER, "The Guide", "", "12", null);
  const club = await addProduct(OWNER, "The Club", "", "9", { interval: "month", trialDays: 0, payments: 0 });
  if (!guide.ok || !club.ok) throw new Error("no product");
  await setProductLink(OWNER, guide.product.id, "https://example.com/guide");
  await setProductLink(OWNER, club.product.id, "https://example.com/club");
  const store = (await storeForEmail(OWNER))!;
  const reader = await makeKey(store.sid!, "Reader");
  const writer = await makeKey(store.sid!, "Zapier", Date.now(), true);
  if (!reader.ok || !writer.ok) throw new Error("no key");

  part("Only a key made to write");
  is("a key made to read is refused, and told how to get one that writes", [(await call(postLead, reader.key, { email: "ada@example.com", agreed: true })).json.error], ["read_only"]);
  is("a key made before the choice existed reads only", reader.made.write, false);

  part("Adding to the list");
  is("not without the caller's word that they agreed", (await call(postLead, writer.key, { email: "ada@example.com" })).json.error, "consent");
  const added = await call(postLead, writer.key, { email: "Ada@Example.com", name: "Ada", tags: ["webinar"], agreed: true });
  is("added, by the address as it is kept", [added.status, added.json.data], [200, { email: "ada@example.com", status: "added" }]);
  is("a second time, already there", (await call(postLead, writer.key, { email: "ada@example.com", agreed: true })).json.data?.status, "already");
  const [raw] = (await redis.pipeline([["HGET", leadsKey(store.listId!), "ada@example.com"]])) as unknown[];
  is("agreeing, with the name and the label", [parseContact(raw)?.agreed, parseContact(raw)?.name, parseContact(raw)?.tags], [true, "Ada", ["webinar"]]);
  const left = { ...parseContact(raw)!, unsub: true, unsubAt: new Date().toISOString() };
  await redis.pipeline([["HSET", leadsKey(store.listId!), "bea@example.com", JSON.stringify(left)]]);
  is("somebody who unsubscribed is never added back", (await call(postLead, writer.key, { email: "bea@example.com", agreed: true })).json.error, "unsubscribed");

  part("Labels");
  const labeled = await call(postLabels, writer.key, { email: "ada@example.com", add: ["vip"], remove: ["webinar"] });
  is("added and taken away", labeled.json.data?.labels, ["vip"]);
  is("only for somebody on the list", (await call(postLabels, writer.key, { email: "nobody@example.com", add: ["vip"] })).json.error, "not_on_list");
  is("and only with labels to change", (await call(postLabels, writer.key, { email: "ada@example.com" })).json.error, "labels");

  part("Giving a product");
  is("never a membership", (await call(postAccess, writer.key, { email: "cy@example.com", product: club.product.id })).json.error, "cannot_give");
  is("never a product that is not there", (await call(postAccess, writer.key, { email: "cy@example.com", product: "Nothing Like It" })).json.error, "unknown_product");
  const given = await call(postAccess, writer.key, { email: "cy@example.com", product: "the guide" });
  is("given, by its name or its id, with no email unless asked", [given.json.data?.status, given.json.data?.emailed, emails.length], ["given", false, 0]);
  is("a second time, already there", (await call(postAccess, writer.key, { email: "cy@example.com", product: guide.product.id })).json.data?.status, "already");
  const fresh = (await storeForEmail(OWNER))!;
  is("kept as given by the store's own tools, never as a sale", (await importedFor(fresh, "cy@example.com")).map((p) => [p.productId, p.job]), [[guide.product.id, `api:${writer.made.id}`]]);
  const told = await call(postAccess, writer.key, { email: "dee@example.com", product: guide.product.id, notify: true });
  is("the one email, when asked for", [told.json.data?.emailed, emails.length, [emails[0]?.to].flat()[0]], [true, 1, "dee@example.com"]);
  is("saying it was given and nothing was charged", emails[0]?.text.includes("Harbor Kitchen has given you The Guide. Nothing was charged."), true);

  part("Taking a product back");
  is("what the API gave", (await call(deleteAccess, writer.key, { email: "cy@example.com", product: guide.product.id }, "DELETE")).json.data?.status, "taken_back");
  is("is gone", (await importedFor(fresh, "cy@example.com")).length, 0);
  await grantImported(store.statsId!, "0123456789abcdef01234567", [{ email: "eve@example.com", productId: guide.product.id, items: null }]);
  is("never what an import gave", (await call(deleteAccess, writer.key, { email: "eve@example.com", product: guide.product.id }, "DELETE")).json.error, "not_given_here");
  is("which stays", (await importedFor(fresh, "eve@example.com")).length, 1);

  done();
}

void main();

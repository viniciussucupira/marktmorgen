/**
 * Asking why before a member cancels (lib/leave-rules.ts, lib/leave-flow.ts,
 * lib/membership-manage.ts, lib/membership-numbers.ts; added 12 October 2026).
 * Checked:
 *
 *   - off for a store that never chose; "Another reason" is always offered;
 *     a creator's own reasons are kept with ids that do not change, three at most;
 *   - each answer is met with what fits it, and only an offered one counts;
 *   - pressing "Cancel my membership" after saying why writes the reason on
 *     the membership and opens Stripe's page without asking again; without an
 *     answer, Stripe's page asks as before;
 *   - "Why members leave" counts the store's own answer when the membership
 *     was canceled within two days of it, with the creator's own words, and
 *     Stripe's otherwise;
 *   - this month's answers, pauses, switches and departures are counted.
 */
import { createHash } from "node:crypto";
import { answerFor, offers, parseLeave } from "@/lib/leave-rules";
import { countLeave, leaveMonth, saidField } from "@/lib/leave-flow";
import { openCancel } from "@/lib/membership-manage";
import { leavingFrom, readSub } from "@/lib/membership-numbers";
import { addProduct, claimHandle, ensureStatsId, setLeaving, setStripeAccount, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const DAY = 86_400;
const posts: { path: string; body: URLSearchParams }[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  const path = url.pathname.replace(/^\/v1/, "");
  const method = init?.method ?? "GET";
  if (method === "POST") posts.push({ path, body: new URLSearchParams(String(init?.body ?? "")) });
  if (path === "/subscriptions" && method === "GET") {
    return answer({
      object: "list",
      has_more: false,
      data: [
        {
          id: "sub_Member0000001",
          status: "active",
          customer: "cus_Member000001",
          metadata: { store: "harbor", product: "club" },
          items: { data: [{ current_period_end: Math.floor(Date.now() / 1000) + 20 * DAY, price: { unit_amount: 2000, currency: "usd", recurring: { interval: "month", interval_count: 1 } } }] },
        },
      ],
    });
  }
  if (path.startsWith("/subscriptions/") && method === "POST") return answer({ id: path.split("/")[2] });
  if (path === "/billing_portal/configurations") return answer({ id: `bpc_Config${posts.length}0000` });
  if (path === "/billing_portal/sessions") return answer({ id: "bps_1", url: "https://billing.stripe.com/p/session/test" });
  return answer({ error: { message: `no stand-in for ${method} ${path}` } }, 404);
}) as typeof fetch;

/** A link to a member's page, as the emailed one is kept (lib/membership-manage.ts). */
async function grantLink(token: string): Promise<void> {
  const hash = createHash("sha256").update(`nimbus-manage:${token}`).digest("hex").slice(0, 40);
  await redis.pipeline([["SET", `nl:manage:link:${hash}`, JSON.stringify({ a: "acct_1TestHarbor0001", c: "cus_Member000001", h: "harbor" })]]);
}

async function main(): Promise<void> {
  process.env.STRIPE_SECRET_KEY = "sk_test_leave_only_a_stand_in";
  process.env.RESEND_API_KEY = "re_test_leave_only_a_stand_in";
  redis.clear();

  part("The setting");
  const none = parseLeave(undefined);
  is("off for a store that never chose, every reason offered", [none.on, none.reasons.length, none.own], [false, 8, []]);
  is("“Another reason” is always offered", parseLeave({ on: true, reasons: ["unused"] }).reasons, ["unused", "other"]);
  is("own reasons need an id and words, three at most", parseLeave({ own: [{ id: "own_abc123", text: " Too  late " }, { id: "bad", text: "x" }, { id: "own_abc124", text: "" }] }).own, [{ id: "own_abc123", text: "Too late" }]);

  part("What each answer is met with");
  is("it costs too much: a cheaper plan and a pause", answerFor("too_expensive"), { cheaper: true, pause: true, contact: false });
  is("not used enough: a pause", answerFor("unused"), { cheaper: false, pause: true, contact: false });
  is("something missing, and the creator's own: a way to write", [answerFor("missing_features").contact, answerFor("own_abc123").contact], [true, true]);
  is("moved to something else: only the way out", answerFor("switched_service"), { cheaper: false, pause: false, contact: false });
  const setting = parseLeave({ on: true, reasons: ["too_expensive"], own: [{ id: "own_abc123", text: "Too late for me" }] });
  is("only an offered answer counts", [offers(setting, "too_expensive"), offers(setting, "unused"), offers(setting, "own_abc123"), offers(setting, "own_ffffff")], [true, false, true, false]);

  part("Saved by the creator");
  const OWNER = "owner@example.com";
  const made = await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  if (!made.ok) throw new Error("no store");
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1TestHarbor0001", true);
  await addProduct(OWNER, "The Inner Circle", "", "20", { interval: "month", trialDays: 0, payments: 0 });
  is("off until turned on", (await storeForEmail(OWNER))!.leaving.on, false);
  const saved = await setLeaving(OWNER, { on: true, reasons: ["too_expensive", "unused"], own: [{ text: "The calls don't fit my time zone" }] });
  const ownId = saved.ok ? saved.store.leaving.own[0]?.id ?? "" : "";
  is("a reason of the creator's own is given an id", /^own_[0-9a-f]{6}$/.test(ownId), true);
  const again = await setLeaving(OWNER, { on: true, reasons: ["too_expensive", "unused"], own: [{ id: ownId, text: "The calls don't fit my time zone" }] });
  is("and keeps it", again.ok ? again.store.leaving.own[0].id : "", ownId);
  is("four of their own are refused", (await setLeaving(OWNER, { on: true, own: [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }] })).ok, false);
  const store = (await storeForEmail(OWNER))!;

  part("Canceling after saying why");
  const token = "a".repeat(64);
  await grantLink(token);
  const opened = await openCancel(store, token, "sub_Member0000001", "https://marktmorgen.com", "too_expensive");
  const meta = posts.find((p) => p.path === "/subscriptions/sub_Member0000001")?.body;
  is("Stripe's page opens", opened.ok, true);
  is("the reason is written on the membership", [meta?.get("metadata[leave_reason]"), Number(meta?.get("metadata[leave_at]")) > 0], ["too_expensive", true]);
  const quiet = posts.find((p) => p.path === "/billing_portal/configurations")?.body;
  is("and Stripe's page does not ask again", quiet?.get("features[subscription_cancel][cancellation_reason][enabled]"), "false");

  posts.length = 0;
  const other = "b".repeat(64);
  await grantLink(other);
  await openCancel(store, other, "sub_Member0000001", "https://marktmorgen.com");
  is("without an answer, nothing is written, and Stripe's page asks as before", [
    posts.some((p) => p.path === "/subscriptions/sub_Member0000001"),
    posts.find((p) => p.path === "/billing_portal/configurations")?.body.get("features[subscription_cancel][cancellation_reason][enabled]"),
  ], [false, "true"]);
  posts.length = 0;
  await openCancel(store, other, "sub_Member0000001", "https://marktmorgen.com", "low_quality");
  is("an answer the store does not offer is not written", posts.some((p) => p.path === "/subscriptions/sub_Member0000001"), false);

  part("Why members leave");
  const now = Math.floor(Date.now() / 1000);
  const handles = new Set(["harbor"]);
  const raw = (id: string, metadata: Record<string, string>, canceledAt: number, feedback = "") =>
    readSub({ id, status: "canceled", currency: "usd", canceled_at: canceledAt, metadata: { store: "harbor", product: "club", ...metadata }, cancellation_details: { reason: "cancellation_requested", feedback }, items: { data: [{ quantity: 1, price: { unit_amount: 2000, recurring: { interval: "month", interval_count: 1 } } }] } }, handles)!;
  const subs = [
    raw("sub_1", { leave_reason: "unused", leave_at: String(now - DAY) }, now - DAY + 60),
    raw("sub_2", { leave_reason: ownId, leave_at: String(now - DAY), leave_text: "The calls don't fit my time zone" }, now - DAY + 60),
    // Said why months ago and stayed; canceled now on Stripe's page, with Stripe's answer.
    raw("sub_3", { leave_reason: "unused", leave_at: String(now - 90 * DAY) }, now - DAY, "too_expensive"),
  ];
  const leaving = leavingFrom(subs, "usd", now);
  is("the store's own answer, and Stripe's when the store's is old", leaving.reasons.map((r) => [r.reason, r.members]).sort(), [[ownId, 1], ["too_expensive", 1], ["unused", 1]].sort());
  is("the creator's own reason in their words", leaving.own[ownId], "The calls don't fit my time zone");

  part("This month");
  await countLeave(store.statsId, saidField("too_expensive"));
  await countLeave(store.statsId, saidField(ownId));
  await countLeave(store.statsId, "paused");
  const month = await leaveMonth(store.statsId);
  is("said why, paused, switched, and went on to cancel", month, { said: 2, paused: 1, switched: 0, left: 3 });

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

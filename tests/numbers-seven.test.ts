/**
 * The seventh part of the numbers, added on 11 October 2026: visits by the
 * store's own people left out (lib/visit.ts, lib/no-count.ts), today so far
 * (lib/stats.ts readToday), and the Google searches that found a store
 * (lib/search-console.ts). What is checked:
 *
 *   - a team member signed in, and a device the creator marked, are not
 *     counted; a buyer is, at no extra cost to the visit;
 *   - the cookie names stores by a hash, holds at most twenty, and unmarks;
 *   - today's visitors, checkouts and channels come from today's counts;
 *   - only the person who runs the site may connect Search Console, the
 *     state is spent once and must be theirs, Search Console must be granted,
 *     and the token is sealed;
 *   - a store's searches are read for its own pages only, over the settled
 *     days, kept a day, and not read for a store on its own domain.
 */
import { NO_COUNT_COOKIE, MAX_MARKED, isMarkedDevice, marksOf, storeMark, withMark } from "@/lib/no-count";
import { countHit } from "@/lib/visit";
import { readStats, readToday } from "@/lib/stats";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { DEMO_STUDIO_ADMIN } from "@/lib/house-store";
import {
  SEARCH_CONSOLE_SCOPE,
  beginSearchConsole,
  finishSearchConsole,
  isOperator,
  readRows,
  searchConsoleStatus,
  searchWindow,
  storePattern,
  storeSearches,
} from "@/lib/search-console";
import { claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { redisPipeline } from "@/lib/redis";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

process.env.NIMBUS_DATA_KEY = "a-local-key-for-tests-only-0123456789abcdef";
process.env.GOOGLE_OAUTH_CLIENT_ID = "client-id.apps.googleusercontent.com";
process.env.GOOGLE_OAUTH_CLIENT_SECRET = "client-secret-for-tests";

const OWNER = "owner@example.com";
const MEMBER = "helper@example.com";
const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";

let tokenAnswer: Record<string, unknown> = {};
const queries: { site: string; body: Record<string, unknown> }[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "oauth2.googleapis.com" && url.pathname === "/token") {
    const form = new URLSearchParams(String(init?.body));
    if (form.get("grant_type") === "refresh_token") return json({ access_token: "ya29.access", expires_in: 3600, scope: SEARCH_CONSOLE_SCOPE });
    return json(tokenAnswer);
  }
  if (url.hostname === "searchconsole.googleapis.com") {
    queries.push({ site: decodeURIComponent(url.pathname.split("/sites/")[1].split("/")[0]), body: JSON.parse(String(init?.body)) });
    return json({ rows: [{ keys: ["meal planner pdf"], clicks: 12, impressions: 340, position: 7.84 }, { keys: ["weeknight dinners"], clicks: 0, impressions: 90, position: 18.2 }] }, 200);
  }
  return json({});
}) as typeof fetch;

/** A request as the store's count receives it, with whatever cookies it carries. */
function asking(cookies: Record<string, string> = {}): never {
  const request = new Request("https://marktmorgen.com/api/store/hit", { method: "POST", headers: { "user-agent": PHONE, "x-forwarded-for": "203.0.113.9", "x-vercel-ip-country": "US" } });
  (request as unknown as { cookies: unknown }).cookies = { get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined) };
  return request as never;
}

const idToken = (email: string) =>
  `x.${Buffer.from(JSON.stringify({ iss: "https://accounts.google.com", aud: "client-id.apps.googleusercontent.com", exp: Math.floor(Date.now() / 1000) + 600, sub: "1234567890", email })).toString("base64url")}.y`;

async function main(): Promise<void> {
  redis.clear();
  await claimHandle(OWNER, "harbor", "Harbor Kitchen", "");
  await ensureStatsId(OWNER);
  const store = (await storeForEmail(OWNER))!;

  part("A device marked not to be counted");
  const mark = storeMark(store.sid);
  is("a store is named in the cookie by twelve characters of a hash, never its id", [mark.length, mark === store.sid.slice(0, 12)], [12, false]);
  const marked = withMark("", store.sid, true);
  is("marked, the device is not counted on that store", [isMarkedDevice(marked, store.sid), isMarkedDevice(marked, "f".repeat(32))], [true, false]);
  is("and unmarked again", isMarkedDevice(withMark(marked, store.sid, false), store.sid), false);
  const many = Array.from({ length: 30 }, (_, i) => i.toString(16).padStart(32, "0")).reduce((v, sid) => withMark(v, sid, true), "");
  is("at most twenty stores, the newest kept", [marksOf(many).length, isMarkedDevice(many, (29).toString(16).padStart(32, "0"))], [MAX_MARKED, true]);
  is("anything else in the cookie is ignored", marksOf("zz.<script>." + mark), [mark]);

  part("Whose visits count");
  await redisPipeline([["SET", `nl:team:${store.sid}`, JSON.stringify({ members: [{ email: MEMBER, role: "editor", joinedAt: new Date().toISOString() }], invites: [] })]]);
  const before = (await readStats(store))!.days.at(-1)!.views;
  await countHit(asking(), store, { kind: "view" });
  await countHit(asking({ [SESSION_COOKIE]: await openSession(OWNER) }), store, { kind: "view" });
  await countHit(asking({ [SESSION_COOKIE]: await openSession(MEMBER) }), store, { kind: "view" });
  await countHit(asking({ [NO_COUNT_COOKIE]: marked }), store, { kind: "view" });
  await countHit(asking({ [SESSION_COOKIE]: await openSession("stranger@example.com") }), store, { kind: "view" });
  is("a buyer and a signed-in stranger count; the owner, a team member and a marked device do not", (await readStats(store))!.days.at(-1)!.views - before, 2);

  part("Today so far");
  await countHit(asking(), store, { kind: "checkout", id: "prod000001" });
  const today = await readToday(store);
  is("today's people, page views and checkouts, from today's counts", [today.date, today.views, today.checkouts, today.visitors >= 1], [new Date().toISOString().slice(0, 10), 2, 1, true]);
  is("no sales without Stripe connected", today.sales, null);

  part("Connecting Search Console");
  is("only the person who runs the site", [isOperator(DEMO_STUDIO_ADMIN), isOperator(DEMO_STUDIO_ADMIN.toUpperCase()), isOperator(OWNER), isOperator(null)], [true, true, false, false]);
  is("nobody else is sent to Google", await beginSearchConsole(OWNER), null);
  const url = new URL((await beginSearchConsole(DEMO_STUDIO_ADMIN))!);
  const state = url.searchParams.get("state")!;
  is("Google is asked for read-only Search Console, offline, at the registered address", [
    url.hostname,
    url.searchParams.get("scope"),
    url.searchParams.get("access_type"),
    url.searchParams.get("redirect_uri"),
    /^gsc\./.test(state),
  ], ["accounts.google.com", `openid email ${SEARCH_CONSOLE_SCOPE}`, "offline", "https://marktmorgen.com/api/integrations/google/callback", true]);
  is("a state started by one person is not finished by another", await finishSearchConsole(state, "code-1", OWNER), "expired");
  is("and is spent by trying", await finishSearchConsole(state, "code-1", DEMO_STUDIO_ADMIN), "expired");
  const second = new URL((await beginSearchConsole(DEMO_STUDIO_ADMIN))!).searchParams.get("state")!;
  tokenAnswer = { access_token: "ya29.a", refresh_token: "1//refresh-token-value", scope: "openid email", id_token: idToken("site@example.com") };
  is("refused when Search Console was not granted", await finishSearchConsole(second, "code-2", DEMO_STUDIO_ADMIN), "scope");
  is("and nothing is kept", (await searchConsoleStatus()).connected, false);
  const third = new URL((await beginSearchConsole(DEMO_STUDIO_ADMIN))!).searchParams.get("state")!;
  tokenAnswer = { ...tokenAnswer, scope: `openid email ${SEARCH_CONSOLE_SCOPE}` };
  is("connected when it was", [await finishSearchConsole(third, "code-3", DEMO_STUDIO_ADMIN), await searchConsoleStatus()], ["connected", { connected: true, account: "site@example.com" }]);
  const [kept] = await redisPipeline([["GET", "nl:gsc:conn"]]);
  is("the refresh token is sealed, never kept as given", String(kept).includes("1//refresh-token-value"), false);

  part("A store's searches");
  is("its own pages only: the store, its products, never a longer handle", [
    new RegExp(storePattern("harbor")).test("https://marktmorgen.com/@harbor"),
    new RegExp(storePattern("harbor")).test("https://marktmorgen.com/@harbor/p/meal-planner"),
    new RegExp(storePattern("harbor")).test("https://marktmorgen.com/@harborside"),
    new RegExp(storePattern("harbor")).test("https://evil.com/https://marktmorgen.com/@harbor"),
  ], [true, true, false, false]);
  is("28 days, ending three days ago, when Google's figures are settled", searchWindow(Date.parse("2026-10-11T12:00:00Z")), { from: "2026-09-11", to: "2026-10-08" });
  const read = await storeSearches(store);
  is("read from our property, filtered to the store, by search", [queries[0].site, (queries[0].body.dimensions as string[])[0], JSON.stringify(queries[0].body).includes("@harbor")], ["https://marktmorgen.com/", "query", true]);
  is("each search with its clicks, how often it was shown and its place", read?.rows, [
    { query: "meal planner pdf", clicks: 12, impressions: 340, position: 7.8 },
    { query: "weeknight dinners", clicks: 0, impressions: 90, position: 18.2 },
  ]);
  await storeSearches(store);
  is("kept a day: the second look asks Google nothing", queries.length, 1);
  is("not read for a store on its own domain", await storeSearches({ ...store, statsId: "other0000", domain: { name: "shop.example.com" } } as never), null);
  is("rows Google leaves out are not made up", readRows({ rows: [{ keys: [""], clicks: 1, impressions: 1, position: 1 }] }), []);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

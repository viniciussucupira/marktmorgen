/**
 * Team event types and each host's own calendar (added 17 October 2026).
 *
 * What is checked, against the real code with an in-memory Redis and
 * stand-ins for Stripe and Google:
 *
 *   - the rules: a team's setup is read strictly; each plan has its numbers;
 *     a host's week is read on their own clock across daylight saving; a
 *     host's gap, notice and daily cap (counted in their own day) apply;
 *     round robin needs one free host and a collective call needs them all;
 *     a blocked host loses only their own times; round robin shares out by
 *     bookings so far, then by what is coming up, then by address;
 *   - the claims: one host's time can be taken once, a collective claim takes
 *     every host or none, a daily cap refuses, a move keeps its own time;
 *   - a store: holds go to the free hosts in turn until none is left, a hold
 *     given back frees its host, the same person on another store's team
 *     cannot be held twice for one time, a collective hold takes everyone, a
 *     team event the plan no longer allows is closed;
 *   - Google: a host connects their own calendar with the host scopes; busy
 *     times read from it close their times only; a reading that fails and
 *     grows stale, a missing permission, or the switch being off blocks that
 *     host and no other; a confirmed booking is written to the calendar the
 *     host chose, moved there and deleted there.
 */
import { addProduct, claimHandle, ensureStatsId, setProductCall, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import type { Product, Store } from "@/lib/store";
import { readListing, readProduct } from "@/lib/catalog";
import { type CallListing, confirmBooking, holdAndCheckout, moveBooking, releaseOwnHold, slotsForProduct } from "@/lib/calls";
import { type CallSetup, zonedToUtc } from "@/lib/call-setup";
import { putMember } from "@/lib/team";
import {
  type HostState,
  type TeamHost,
  type TeamSetup,
  TEAM_LIMITS,
  dayBounds,
  freeHosts,
  hostFree,
  readTeamSetup,
  roundRobinOrder,
  teamBookable,
  teamLimitsFor,
  teamSlots,
} from "@/lib/team-scheduling-rules";
import { claimHosts, claimsKey, confirmClaim, hostId, newClaimId, readClaims, releaseClaim } from "@/lib/host-claims";
import { activeTeam, writeTeam } from "@/lib/team-booking";
import { beginConsent, finishConsent, takeConsent } from "@/lib/meet-connect";
import { GOOGLE_HOST_SCOPES } from "@/lib/meet-providers";
import { hostCalendarView, hostSync, setHostCalendars, setHostSource } from "@/lib/host-calendar";
import { callRefunded } from "@/lib/meet-links";
import { readRecord, callScope } from "@/lib/meet-records";
import { redisPipeline, store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const realNow = Date.now.bind(Date);
let offset = 0;
Date.now = () => realNow() + offset;

// ---- Stand-ins ---------------------------------------------------------------

let sessions = 0;
const checkouts: URLSearchParams[] = [];
const google: { method: string; path: string; body: string }[] = [];
let grantScope = GOOGLE_HOST_SCOPES.join(" ");
let freeBusy: ((items: string[]) => Response) | null = null;
let busyFor: Record<string, [number, number][]> = {};
const iso = (ms: number) => new Date(ms).toISOString();

function idToken(email: string): string {
  const part = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
  return `${part({ alg: "none" })}.${part({ iss: "https://accounts.google.com", aud: "client-id.apps.googleusercontent.com", exp: Math.floor(Date.now() / 1000) + 3600, sub: `sub-${email}`, email, email_verified: true })}.sig`;
}

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "api.resend.com") return answer({ id: "e" });
  if (url.hostname === "127.0.0.1") {
    const path = url.pathname;
    google.push({ method, path: path + url.search, body: String(init?.body ?? "") });
    if (path === "/google/token") {
      const form = new URLSearchParams(String(init?.body ?? ""));
      const who = form.get("code") ?? "x@example.com";
      return answer({ access_token: `at-${who}`, refresh_token: `rt-${who}`, expires_in: 3600, scope: grantScope, id_token: idToken(who) });
    }
    if (path === "/google/calendar/v3/freeBusy") {
      const body = JSON.parse(String(init?.body)) as { items: { id: string }[] };
      if (freeBusy) return freeBusy(body.items.map((i) => i.id));
      const calendars = Object.fromEntries(body.items.map((i) => [i.id, { busy: (busyFor[i.id] ?? []).map(([s, e]) => ({ start: iso(s), end: iso(e) })) }]));
      return answer({ kind: "calendar#freeBusy", calendars });
    }
    if (path === "/google/calendar/v3/users/me/calendarList") {
      return answer({ items: [{ id: "maya@example.com", summary: "Maya", primary: true, accessRole: "owner" }, { id: "team@group.calendar.google.com", summary: "Team calls", accessRole: "writer" }] });
    }
    const event = /^\/google\/calendar\/v3\/calendars\/([^/]+)\/events(?:\/([^/?]+))?$/.exec(path);
    if (event) {
      if (method === "POST") {
        const body = JSON.parse(String(init?.body)) as { id: string };
        return answer({ id: body.id, status: "confirmed", hangoutLink: "https://meet.google.com/abc-defg-hij" });
      }
      if (method === "DELETE") return new Response(null, { status: 204 });
      return answer({ id: event[2], status: "confirmed", hangoutLink: "https://meet.google.com/abc-defg-hij", attendees: [] });
    }
    return answer({ error: "no stand-in" }, 404);
  }
  // Stripe: checkouts open, close, and the ledger lists nothing paid.
  const path = url.pathname.replace(/^\/v1/, "");
  if (method === "POST" && path === "/checkout/sessions") {
    sessions += 1;
    checkouts.push(new URLSearchParams(String(init?.body ?? "")));
    const id = `cs_test_team${String(sessions).padStart(12, "0")}`;
    return answer({ id, url: `https://checkout.stripe.com/c/pay/${id}` });
  }
  if (method === "POST" && /^\/checkout\/sessions\/[^/]+\/expire$/.test(path)) return answer({ status: "expired" });
  return answer({ object: "list", data: [], has_more: false });
}) as typeof fetch;

// ---- Fixtures ------------------------------------------------------------------

const NY = "America/New_York";
const WEEKDAYS: [number, number][][] = [[], [[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]], [[540, 1020]], []];
const weekly = {
  kind: "weekly",
  minutes: 60,
  tz: NY,
  weekly: WEEKDAYS,
  noticeHours: 1,
  horizonDays: 30,
  bufferMinutes: 0,
  room: "https://example.com/room",
  video: false,
  meet: null,
  seats: 1,
  sessions: [],
} as unknown as CallSetup;

function host(email: string, patch: Partial<TeamHost> = {}): TeamHost {
  return { email, tz: NY, weekly: WEEKDAYS, bufferMinutes: 0, noticeHours: 1, dailyCap: 4, ...patch };
}

/** A weekday at least `days` from now, at `minute` past midnight in New York. */
function weekdayAt(days: number, minute: number): number {
  for (let d = days; d < days + 8; d += 1) {
    const day = new Date(Date.now() + d * DAY);
    const p = new Intl.DateTimeFormat("en-US", { timeZone: NY, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(day);
    const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
    if (get("weekday") === "Sat" || get("weekday") === "Sun") continue;
    return zonedToUtc(Number(get("year")), Number(get("month")), Number(get("day")), minute, NY) as number;
  }
  throw new Error("no weekday");
}

function state(email: string, patch: Partial<HostState> = {}): HostState {
  return { email, busy: [], booked: [], blocked: false, ...patch };
}

async function storeWithCalls(email: string, handle: string, account: string, tier: "creator" | "pro" | "scale", count = 1) {
  await claimHandle(email, handle, `${handle} studio`, "");
  await ensureStatsId(email);
  await setStripeAccount(email, account, true);
  await setSubscription(email, { customerId: `cus_${handle}00001`, subscriptionId: `sub_${handle}00001`, active: true, tier });
  const products: CallListing[] = [];
  for (let i = 0; i < count; i += 1) {
    const made = await addProduct(email, `Strategy call ${i + 1}`, "", "120", null);
    if (!made.ok) throw new Error("no product");
    await setProductCall(email, made.product.id, weekly);
    products.push((await readListing((await storeForEmail(email)) as Store, made.product.id)) as CallListing);
  }
  return { store: (await storeForEmail(email)) as Store, products };
}

async function hold(store: Store, product: CallListing, start: number) {
  const full = (await readProduct(store, product.id)) as Product & { call: CallSetup };
  return holdAndCheckout({ store, product: full, start, buyerTz: "Europe/Lisbon", origin: "https://marktmorgen.com" });
}

async function offered(store: Store, product: CallListing, start: number): Promise<boolean> {
  const read = await slotsForProduct(store, product);
  return Boolean(read && read.days.some((d) => d.starts.includes(start)));
}

async function connectGoogle(store: Store, email: string): Promise<boolean> {
  const url = await beginConsent("google", { statsId: store.statsId as string, sid: store.sid, sessionCookie: `cookie-${email}`, email, host: hostId(email), scopes: GOOGLE_HOST_SCOPES });
  const asked = new URL(url).searchParams.get("scope") ?? "";
  const state = new URL(url).searchParams.get("state") ?? "";
  const taken = await takeConsent("google", state, { sessionCookie: `cookie-${email}`, email });
  if (!taken || taken.host !== hostId(email) || asked !== GOOGLE_HOST_SCOPES.join(" ")) return false;
  const result = await finishConsent("google", { statsId: taken.statsId, code: email, verifier: taken.verifier, by: email, owner: { email: store.email, handle: store.handle }, host: taken.host });
  return result.ok;
}

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_team_scheduling_only";
  process.env.RESEND_API_KEY = "re_test_team_scheduling_only";
  process.env.GOOGLE_OAUTH_CLIENT_ID = "client-id.apps.googleusercontent.com";
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = "secret-for-tests";
  process.env.GOOGLE_API_BASE = "http://127.0.0.1:9";

  part("Reading a team");
  const ok = readTeamSetup({ mode: "round_robin", hosts: [host("A@Example.com")] }, weekly);
  is("a team of one host, its address made lower case", typeof ok === "string" ? ok : ok.hosts[0].email, "a@example.com");
  is(
    "every wrong part is named",
    [
      readTeamSetup({ mode: "everyone", hosts: [host("a@example.com")] }, weekly),
      readTeamSetup({ mode: "collective", hosts: [] }, weekly),
      readTeamSetup({ mode: "collective", hosts: [host("a@example.com"), host("A@example.com")] }, weekly),
      readTeamSetup({ mode: "collective", hosts: [host("a@example.com", { tz: "Mars/Olympus" })] }, weekly),
      readTeamSetup({ mode: "collective", hosts: [host("a@example.com", { weekly: [[], [[540, 570]], [], [], [], [], []] })] }, weekly),
      readTeamSetup({ mode: "collective", hosts: [host("a@example.com", { dailyCap: 7 })] }, weekly),
      readTeamSetup({ mode: "collective", hosts: [host("a@example.com", { bufferMinutes: 7 })] }, weekly),
      readTeamSetup({ mode: "collective", hosts: [host("a@example.com")] }, { ...weekly, seats: 3 }),
      readTeamSetup({ mode: "collective", hosts: [host("a@example.com"), host("b@example.com"), host("c@example.com")] }, weekly, 2),
    ],
    ["team_mode", "team_hosts", "team_host", "team_host_tz", "team_host_hours", "team_host_cap", "team_host_buffer", "team_call", "team_hosts"],
  );
  const plan = (tier: "creator" | "pro" | "scale", active: boolean, trialEnds = 0) => teamLimitsFor({ subscriptionActive: active, subscriptionId: active ? "sub_x" : null, trialEnds, planEndedAt: "", tier }, 1_000);
  is("each plan has its numbers; a trial has the Store plan's; no plan has none", [plan("creator", true), plan("pro", true), plan("scale", true), plan("scale", true, 5_000), plan("pro", false)], [TEAM_LIMITS.creator, TEAM_LIMITS.pro, TEAM_LIMITS.scale, TEAM_LIMITS.creator, { eventTypes: 0, hosts: 0 }]);

  part("A host's own clock, across daylight saving");
  const berlin = host("b@example.com", { tz: "Europe/Berlin", weekly: [[], [[540, 600]], [], [], [], [], []] });
  const beforeDst = Date.UTC(2026, 2, 23, 8); // Monday 23 March 2026, 9:00 in Berlin (UTC+1)
  const afterDst = Date.UTC(2026, 2, 30, 7); // Monday 30 March 2026, 9:00 in Berlin (UTC+2)
  const team1: TeamSetup = { mode: "round_robin", hosts: [berlin], createdAt: "2026-01-01T00:00:00.000Z" };
  const states1 = new Map([[berlin.email, state(berlin.email)]]);
  const slots = teamSlots({ ...weekly, horizonDays: 30 }, team1, states1, Date.UTC(2026, 2, 20)).flatMap((d) => d.starts);
  is("9:00 in Berlin is 08:00 UTC before the clocks move and 07:00 after", [slots.includes(beforeDst), slots.includes(afterDst), slots.includes(afterDst + HOUR)], [true, true, false]);
  const skipped = host("n@example.com", { weekly: [[[60, 240]], [], [], [], [], [], []] });
  const spring = teamSlots({ ...weekly, horizonDays: 7 }, { ...team1, hosts: [skipped] }, new Map([[skipped.email, state(skipped.email)]]), Date.UTC(2026, 2, 6)).flatMap((d) => d.starts);
  is(
    "on the night New York skips 2:00, every offered hour fits inside 1:00 to 4:00 on the clock",
    spring.filter((s) => s >= Date.UTC(2026, 2, 8) && s < Date.UTC(2026, 2, 9)).map((s) => new Date(s).toISOString().slice(11, 16)),
    ["06:00", "07:00"],
  );
  const tokyo = dayBounds(Date.UTC(2026, 9, 19, 23, 30), "Asia/Tokyo");
  is("a host's day is their own: 23:30 UTC Monday is Tuesday in Tokyo", [new Date(tokyo[0]).toISOString(), new Date(tokyo[1]).toISOString()], ["2026-10-19T15:00:00.000Z", "2026-10-20T15:00:00.000Z"]);

  part("Gap, notice, daily cap");
  const now = Date.UTC(2026, 9, 12, 12); // Monday 12 October 2026, 8:00 in New York
  const ten = Date.UTC(2026, 9, 13, 14); // Tuesday 10:00 New York
  const a = host("a@example.com", { bufferMinutes: 30 });
  const busyA = state(a.email, { busy: [{ start: ten, end: ten + HOUR }] });
  is("the host's own gap keeps an hour after a call free", [hostFree(weekly, a, busyA, now, ten + HOUR), hostFree(weekly, a, busyA, now, ten + 2 * HOUR)], [false, true]);
  const late = host("l@example.com", { noticeHours: 48 });
  is("the host's own notice wins over the call's", [hostFree(weekly, late, state(late.email), now, ten), hostFree(weekly, late, state(late.email), now, ten + DAY)], [false, true]);
  const capped = host("c@example.com", { dailyCap: 1 });
  const once = state(capped.email, { booked: [ten - HOUR] });
  is("a host with their cap reached that day is free the next", [hostFree(weekly, capped, once, now, ten + 3 * HOUR), hostFree(weekly, capped, once, now, ten + DAY)], [false, true]);
  is("outside the host's hours, never", hostFree(weekly, a, state(a.email), now, Date.UTC(2026, 9, 13, 23)), false);

  part("Round robin and collective");
  const two: TeamSetup = { mode: "round_robin", hosts: [host("a@example.com"), host("b@example.com")], createdAt: "" };
  const aBusy = new Map([
    ["a@example.com", state("a@example.com", { busy: [{ start: ten, end: ten + HOUR }] })],
    ["b@example.com", state("b@example.com")],
  ]);
  is("round robin offers the time with one host free", [teamBookable(weekly, two, aBusy, now, ten), freeHosts(weekly, two, aBusy, now, ten)], [true, ["b@example.com"]]);
  is("a collective call does not", teamBookable(weekly, { ...two, mode: "collective" }, aBusy, now, ten), false);
  const aBlocked = new Map([
    ["a@example.com", state("a@example.com", { blocked: true })],
    ["b@example.com", state("b@example.com")],
  ]);
  const rr = teamSlots(weekly, two, aBlocked, now).flatMap((d) => d.starts);
  is("a host whose calendar cannot be read loses their times only", [rr.includes(ten), teamSlots(weekly, { ...two, mode: "collective" }, aBlocked, now).length], [true, 0]);
  is(
    "round robin order: fewest so far, then fewest coming up, then by address",
    [roundRobinOrder(["b@x.com", "a@x.com"], { "a@x.com": 2, "b@x.com": 1 }, {}), roundRobinOrder(["b@x.com", "a@x.com"], {}, { "a@x.com": 3 }), roundRobinOrder(["b@x.com", "a@x.com"], {}, {})],
    [["b@x.com", "a@x.com"], ["b@x.com", "a@x.com"], ["a@x.com", "b@x.com"]],
  );

  part("Claims on a host's time");
  const k1 = newClaimId();
  const k2 = newClaimId();
  const one = (id: string, cap = 4) => ({ id, gapMs: 0, day: [ten - 10 * HOUR, ten + 14 * HOUR] as [number, number], cap });
  const hx = hostId("x@example.com");
  const hy = hostId("y@example.com");
  is("one host's hour is taken once", [await claimHosts({ hosts: [one(hx)], start: ten, end: ten + HOUR, claim: k1, until: 0, ref: "c1:p1", now }), await claimHosts({ hosts: [one(hx)], start: ten + HOUR / 2, end: ten + 1.5 * HOUR, claim: k2, until: 0, ref: "c1:p1", now })], [{ ok: true }, { ok: false, reason: "taken", host: 0 }]);
  is("a collective claim that loses on one host writes nothing on the other", [await claimHosts({ hosts: [one(hy), one(hx)], start: ten, end: ten + HOUR, claim: k2, until: 0, ref: "c1:p1", now }), (await readClaims([hy], now)).get(hy)], [{ ok: false, reason: "taken", host: 1 }, []]);
  is("a move onto its own time is not a clash", await claimHosts({ hosts: [one(hx)], start: ten + HOUR / 2, end: ten + 1.5 * HOUR, claim: k1, until: 0, ref: "c1:p1", now }), { ok: true });
  is("a full day refuses", await claimHosts({ hosts: [one(hx, 1)], start: ten + 4 * HOUR, end: ten + 5 * HOUR, claim: k2, until: 0, ref: "c1:p1", now }), { ok: false, reason: "cap", host: 0 });
  await releaseClaim([hx], k1);
  is("released, the hour is free again", await claimHosts({ hosts: [one(hx)], start: ten, end: ten + HOUR, claim: k2, until: now + HOUR, ref: "c1:p1", now }), { ok: true });
  await confirmClaim([hx], k2, ten, ten + HOUR, "c1:p1");
  is("a confirmed claim stays for good", (await readClaims([hx], now + 2 * HOUR)).get(hx)?.map((c) => c.until), [0]);
  await redisPipeline([["DEL", claimsKey(hx), claimsKey(hy)]]);

  part("Holding team times on a store");
  const OWNER = "owner@example.com";
  const MAYA = "maya@example.com";
  const PAT = "pat@example.com";
  const first = await storeWithCalls(OWNER, "harbor", "acct_1TestHarbor0001", "pro", 2);
  await putMember(first.store, MAYA, "editor");
  await putMember(first.store, PAT, "support");
  const [rrCall, groupCall] = first.products;
  await writeTeam(first.store, rrCall.id, { mode: "round_robin", hosts: [host(OWNER), host(MAYA)], createdAt: "2026-10-01T00:00:00.000Z" });
  await writeTeam(first.store, groupCall.id, { mode: "collective", hosts: [host(OWNER), host(PAT)], createdAt: "2026-10-02T00:00:00.000Z" });
  const S = weekdayAt(3, 600);
  is("the time is offered", await offered(first.store, rrCall, S), true);
  const h1 = await hold(first.store, rrCall, S);
  const h2 = await hold(first.store, rrCall, S);
  const h3 = await hold(first.store, rrCall, S);
  is("two holds of one time go to its two hosts in turn, the third finds none", [h1.ok, h2.ok, h3.ok ? "held" : h3.reason], [true, true, "taken"]);
  const claimsOf = async (email: string) => ((await readClaims([hostId(email)])).get(hostId(email)) ?? []).map((c) => c.start);
  is("round robin went to Maya first (by address), then the owner", [await claimsOf(MAYA), await claimsOf(OWNER)], [[S], [S]]);
  is("each checkout names its host and claim, so Stripe's ledger knows them", [checkouts[0].get("metadata[hosts]"), /^k[0-9a-f]{24}$/.test(checkouts[0].get("metadata[claim]") ?? "")], [hostId(MAYA), true]);
  is("and the time is no longer offered", await offered(first.store, rrCall, S), false);
  if (h1.ok) await releaseOwnHold(first.store, h1.session);
  is("a hold given back frees its host and the time", [await claimsOf(MAYA), await offered(first.store, rrCall, S)], [[], true]);

  const second = await storeWithCalls("other@example.com", "lantern", "acct_1TestLantern01", "creator", 1);
  await putMember(second.store, MAYA, "editor");
  await writeTeam(second.store, second.products[0].id, { mode: "round_robin", hosts: [host(MAYA)], createdAt: "2026-10-03T00:00:00.000Z" });
  const again = await hold(first.store, rrCall, S);
  const elsewhere = await hold(second.store, second.products[0], S);
  is("the same person on another store's team cannot be held twice for one time", [again.ok, elsewhere.ok ? "held" : elsewhere.reason, await offered(second.store, second.products[0], S)], [true, "taken", false]);

  const G = weekdayAt(4, 660);
  const g1 = await hold(first.store, groupCall, G);
  const g2 = await hold(first.store, groupCall, G);
  is("a collective hold takes every host's time, once", [g1.ok, g2.ok ? "held" : g2.reason, await claimsOf(PAT), (await claimsOf(OWNER)).includes(G)], [true, "taken", [G], true]);
  is("the owner is taken, so on the round robin call the time goes to Maya", [await offered(first.store, rrCall, G), (await (async () => { const h = await hold(first.store, rrCall, G); return h.ok && (await claimsOf(MAYA)).includes(G); })())], [true, true]);

  await writeTeam(second.store, "another", { mode: "round_robin", hosts: [host(MAYA)], createdAt: "2026-10-04T00:00:00.000Z" });
  const extra = await addProduct("other@example.com", "Second call", "", "120", null);
  if (!extra.ok) throw new Error("no product");
  await setProductCall("other@example.com", extra.product.id, weekly);
  await writeTeam(second.store, extra.product.id, { mode: "round_robin", hosts: [host(MAYA)], createdAt: "2026-10-05T00:00:00.000Z" });
  const secondNow = (await storeForEmail("other@example.com")) as Store;
  const extraCall = (await readListing(secondNow, extra.product.id)) as CallListing;
  is("on the Store plan the second team event is closed, the first stays", [await activeTeam(secondNow, extraCall), (await activeTeam(secondNow, second.products[0])) !== "closed", (await slotsForProduct(secondNow, extraCall))?.days.length], ["closed", true, 0]);

  part("A host's own Google Calendar");
  process.env.GOOGLE_CALENDAR_SYNC_SCOPES = "1";
  is("Maya connects her own, with the host scopes", await connectGoogle(first.store, MAYA), true);
  is("she picks it as her source, a second calendar to read and one to write to", [await setHostSource(first.store, MAYA, "google"), await setHostCalendars(first.store, MAYA, ["maya@example.com", "team@group.calendar.google.com"], "team@group.calendar.google.com")], [null, null]);
  const B = weekdayAt(5, 600);
  busyFor = { "team@group.calendar.google.com": [[B, B + HOUR]] };
  const synced = await hostSync(first.store, MAYA, NY, { refresh: true });
  is("her busy time is read from both calendars, by free/busy only", [synced.state, synced.busy.some((b) => b.start === B), google.some((g) => g.path.endsWith("/freeBusy") && g.body.includes("team@group.calendar.google.com"))], ["ok", true, true]);
  const hb = await hold(first.store, rrCall, B);
  is("busy in her calendar, the booking goes to the owner", [hb.ok, (await claimsOf(OWNER)).includes(B), (await claimsOf(MAYA)).includes(B)], [true, true, false]);

  part("A booking written to her calendar, moved and deleted there");
  const W = weekdayAt(6, 840);
  const hw = await hold(first.store, rrCall, W);
  if (!hw.ok) throw new Error("no hold for Maya");
  is("free in her calendar, Maya gets it", (await claimsOf(MAYA)).includes(W), true);
  await confirmBooking({ store: first.store, product: rrCall, session: hw.session, start: W, end: W + HOUR, buyerEmail: "ana@example.com", buyerTz: "Europe/Lisbon", origin: "https://marktmorgen.com" });
  const scope = callScope(first.store.callsId as string, { group: false, session: hw.session, product: rrCall.id, start: W });
  const record = await readRecord(scope);
  is(
    "an event with a Meet link is made on the calendar she chose, on her own connection",
    [record?.made, record?.host === hostId(MAYA), record?.calendar, google.some((g) => g.method === "POST" && g.path.startsWith("/google/calendar/v3/calendars/team%40group.calendar.google.com/events"))],
    [true, true, "team@group.calendar.google.com", true],
  );
  is("and her claim is a booking now", ((await readClaims([hostId(MAYA)])).get(hostId(MAYA)) ?? []).find((c) => c.start === W)?.until, 0);
  const W2 = W + 2 * HOUR;
  const moved = await moveBooking({ store: first.store, product: rrCall, session: hw.session, booked: { start: W, end: W + HOUR, email: "ana@example.com", buyerTz: "Europe/Lisbon" }, start: W2, origin: "https://marktmorgen.com" });
  is("moved by the buyer, it keeps its host, and her event moves on that calendar", [moved.ok, (await claimsOf(MAYA)).includes(W2), (await claimsOf(MAYA)).includes(W), google.some((g) => g.method === "PATCH" && g.path.startsWith("/google/calendar/v3/calendars/team%40group.calendar.google.com/events/"))], [true, true, false, true]);
  await callRefunded(first.store, { session: hw.session, product: rrCall.id, start: W2, email: "ana@example.com" });
  is("refunded in full, the event is deleted on that calendar", google.some((g) => g.method === "DELETE" && g.path.startsWith("/google/calendar/v3/calendars/team%40group.calendar.google.com/events/")), true);

  part("When her calendar cannot be read");
  freeBusy = () => new Response(JSON.stringify({ error: { message: "backend" } }), { status: 503 });
  offset += 10 * 60_000;
  const within = await hostSync(first.store, MAYA, NY, { refresh: true });
  is("a failure soon after a good reading keeps it, and says so", [within.state, within.blocked, within.message.length > 0], ["ok", false, true]);
  offset += 25 * 60_000;
  const stale = await hostSync(first.store, MAYA, NY, { refresh: true });
  is("past 20 minutes without a good reading she is blocked", [stale.state, stale.blocked], ["stale", true]);
  const T = weekdayAt(7, 600);
  is("her times are hidden, the owner's are not", [await offered(first.store, rrCall, T), (await (async () => { const h = await hold(first.store, rrCall, T); return h.ok && (await claimsOf(OWNER)).includes(T); })())], [true, true]);
  const second2 = await slotsForProduct(second.store, second.products[0]);
  is("her calendar is hers, not a store's: on the other store, where she hosts alone, nothing is offered either", second2?.days.length, 0);
  const view = await hostCalendarView(first.store, MAYA, NY);
  is("her page shows the state and the last successful sync", [view.sync.state, view.sync.lastSuccess > 0, view.google?.freebusy, view.calendars?.length], ["stale", true, true, 2]);
  freeBusy = null;

  part("A missing permission, or the switch off");
  grantScope = "openid email https://www.googleapis.com/auth/calendar.events";
  is("Pat connects without the free/busy permission", await connectGoogle(first.store, PAT), true);
  await setHostSource(first.store, PAT, "google");
  const noScope = await hostSync(first.store, PAT, NY, { refresh: true });
  is("he is blocked, and told why", [noScope.state, noScope.blocked, /free\/busy/.test(noScope.message)], ["scope", true, true]);
  delete process.env.GOOGLE_CALENDAR_SYNC_SCOPES;
  const off = await hostSync(first.store, MAYA, NY, { refresh: true });
  is("with the switch off, a Google host is blocked rather than read without permission", [off.state, off.blocked], ["off", true]);
  is("and choosing Google is refused", await setHostSource(first.store, OWNER, "google"), "google_off");

  done();
}

void main();

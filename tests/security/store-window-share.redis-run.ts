/**
 * MM-SA-01: one connection could spend a store's whole window of requests.
 *
 * Every page a store draws and every public request it answers (a download,
 * the cart, a search, the page after paying) is one of the requests its plan
 * covers in its window (lib/traffic.ts). Past them the store rests: its pages
 * show that it is resting, and what buyers already have — files, courses,
 * the community — is refused. Before this check nothing told one connection
 * apart from another, so a script on one machine could spend the window in
 * minutes, for example with download links made up on the spot, and every
 * store's buyers were shut out for the rest of its month.
 *
 * Proved against a real Redis, through the real download route
 * (app/api/store/download): a creator store that pays, with its window near
 * its end, is sent made-up download links from one address. The store must
 * still answer a buyer on another address, and the connection that sent the
 * links must be the only one refused.
 */
import type { NextRequest } from "next/server";
import { answering } from "./next-headers";
import { GET as download } from "@/app/api/store/download/route";
import { claimHandle, ensureStatsId, ensureStoreId, setStripeAccount, setSubscription, storeFolder, storeForEmail, storeRef } from "@/lib/store";
import { allowanceWindow } from "@/lib/allowance-window";
import { isResting, takePublicRequest } from "@/lib/traffic";
import * as rules from "@/lib/traffic-rules";
import { publicVisitLimit, requestLimitFor } from "@/lib/traffic-rules";
import { redisPipeline } from "@/lib/redis";
import { paidPeriod } from "../billing-period-fixture";
import { check, finish } from "./check";

const sentCommands = { n: 0 };
globalThis.fetch = ((real) =>
  (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input instanceof Request ? input.url : input));
    if (String(url).startsWith(String(process.env.UPSTASH_REDIS_REST_URL))) {
      sentCommands.n += (JSON.parse(String(init?.body)) as unknown[]).length;
      return real(input as string, init);
    }
    throw new Error(`no network in this check: ${url.hostname}`);
  }) as typeof fetch)(globalThis.fetch);

const HANDLE = "window-share";
const ATTACKER = "203.0.113.7";
const BUYER = "198.51.100.23";

function requestFrom(ip: string, path: string): NextRequest {
  const url = new URL(`https://marktmorgen.com${path}`);
  const request = new Request(url, { headers: { "x-forwarded-for": ip, host: "marktmorgen.com" } });
  return Object.assign(request, { nextUrl: url, cookies: { get: () => undefined } }) as unknown as NextRequest;
}

async function main(): Promise<void> {
  process.env.NIMBUS_DATA_KEY ??= "tests-only-not-a-real-deployment-secret";
  const owner = "owner@window-share.example";
  await claimHandle(owner, HANDLE, "Window Share", "");
  await ensureStatsId(owner);
  await ensureStoreId(owner);
  await setStripeAccount(owner, "acct_1WindowShareXX", true);
  await setSubscription(owner, { customerId: "cus_windowshare", subscriptionId: "sub_windowshare", active: true, tier: "creator", period: paidPeriod() });
  const store = (await storeForEmail(owner))!;
  const window = allowanceWindow(store)!;
  const folder = await storeFolder(storeRef(store));
  const whole = requestLimitFor(store);
  // The window as a busy month leaves it: four hundred requests to go. A
  // connection may take far more than that in a day of its own on any plan
  // with room to spare, but not the store's whole window.
  const room = 400;
  const sent = 600;
  const publicLimit = publicVisitLimit(whole);
  await redisPipeline([["SET", `nl:traffic:r:${folder}:${window.id}`, String(publicLimit - room)]]);

  // One machine sends six hundred made-up download links.
  let refused = 0;
  for (let i = 0; i < sent; i += 1) {
    const token = (i.toString(16) + "f".repeat(48)).slice(0, 48);
    answering(requestFrom(ATTACKER, `/api/store/download?handle=${HANDLE}&token=${token}`));
    const answer = await download(requestFrom(ATTACKER, `/api/store/download?handle=${HANDLE}&token=${token}`));
    if (answer.status === 429) refused += 1;
  }
  answering(null);
  check("the connection that sent them is refused before it can spend the rest of the window", refused > 0, true);

  const [left] = await redisPipeline([["GET", `nl:traffic:r:${folder}:${window.id}`]]);
  check("what it was refused is not counted against the store", Number(left) < publicLimit - 50, true);

  // A buyer on another address, and the store's public pages, are still answered.
  answering(requestFrom(BUYER, `/@${HANDLE}`));
  check("the store's public pages do not rest", await isResting(store), false);
  check("a buyer's download is still one the store can answer", await takePublicRequest(store, "buyer"), true);
  answering(null);

  // What the share costs: no more than its priced commands a request (tests/plan-cost-registry.ts, REQUEST_COMMANDS).
  const perRequest = Number((rules as Record<string, unknown>).SHARE_COMMANDS_PER_REQUEST ?? 0);
  const commandsFor = async (ip: string | null) => {
    const before = sentCommands.n;
    for (let i = 0; i < 40; i += 1) {
      answering(ip ? requestFrom(ip, `/@${HANDLE}`) : null);
      await takePublicRequest(store, "buyer");
    }
    answering(null);
    return sentCommands.n - before;
  };
  const without = await commandsFor(null);
  const withShare = await commandsFor("192.0.2.200");
  check("a connection's share adds no more than its priced commands to a request", withShare - without <= Math.ceil(40 * perRequest), true);

  // The store's own figure is unchanged: past it, the store still rests, whoever asks.
  await redisPipeline([["SET", `nl:traffic:r:${folder}:${window.id}`, String(whole)]]);
  answering(requestFrom(BUYER, `/@${HANDLE}`));
  check("past its window the store still rests, for everybody", [await isResting(store), await takePublicRequest(store, "buyer")], [true, false]);
  check("public pages still rest at the share kept for buyers", publicVisitLimit(whole) < whole, true);
  answering(null);
  finish();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

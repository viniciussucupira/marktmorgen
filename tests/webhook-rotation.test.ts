/**
 * Replacing a webhook endpoint's signing secret without a gap (378 [TB4],
 * ClickFunnels audit F58). Delivered to a real local HTTP server through
 * lib/safe-fetch.ts, as tests/webhooks-delivery.test.ts does. Checked:
 *
 *   - the new secret is returned once and never appears in the studio's view;
 *     the view says only until when the old one still signs;
 *   - for ROTATION_HOURS every message carries a v1 under each secret, so a
 *     receiver with either accepts it; a retry already waiting when the
 *     secret is replaced goes out signed with both;
 *   - after that the old secret signs nothing, and is dropped from storage
 *     at the next change;
 *   - replacing again within the day keeps only the newest two;
 *   - one store cannot replace another's secret; replacing counts no
 *     delivery from the plan's month.
 */
import { createHmac } from "node:crypto";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import { readFileSync } from "node:fs";
import { ROTATION_HOURS, RETRY_MINUTES, addEndpoint, deliverDue, emitEvent, rotateSecret, setSendHooksForTests, signatureFor, webhooksView } from "@/lib/webhooks";
import { claimHandle, ensureStatsId, setSubscription, storeForEmail } from "@/lib/store";
import { allowanceUsed } from "@/lib/store-allowance";
import { paidPeriod } from "./billing-period-fixture";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

type Received = { headers: http.IncomingHttpHeaders; body: string };
const received: Received[] = [];
const answers: number[] = [];
const server = http.createServer((request, response) => {
  let body = "";
  request.on("data", (chunk: Buffer) => (body += chunk.toString()));
  request.on("end", () => {
    received.push({ headers: request.headers, body });
    response.writeHead(answers.shift() ?? 200);
    response.end("ok");
  });
});
class LocalAgent extends https.Agent {
  constructor(private port: number) {
    super({ keepAlive: false });
  }
  createConnection(): net.Socket {
    return net.connect(this.port, "127.0.0.1");
  }
}

/** How a receiver checks: the timestamp, then any v1 that its one secret matches. */
function accepts(secret: string, header: string, body: string): boolean {
  const parts = header.split(",");
  const t = /^t=(\d+)$/.exec(parts[0] ?? "")?.[1];
  if (!t) return false;
  const want = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  return parts.slice(1).some((part) => part === `v1=${want}`);
}
const v1Count = (header: string) => header.split(",").filter((part) => /^v1=[0-9a-f]{64}$/.test(part)).length;

// The webhook queue's lease script, modelled as Redis runs it (as in tests/webhooks-delivery.test.ts).
const original = redis.pipeline.bind(redis);
redis.pipeline = async (commands: (string | number)[][]) => {
  const [only] = commands;
  if (commands.length === 1 && only[0] === "EVAL" && String(only[1]).includes('redis.call("ZSCORE", KEYS[1], ARGV[1])')) {
    const [, , , key, member, now, until] = only.map(String);
    const [due] = await original([["ZSCORE", key, member]]);
    if (due === null || due === undefined || Number(due) > Number(now)) return [0];
    await original([["ZADD", key, Number(until), member]]);
    return [1];
  }
  return original(commands);
};

async function main(): Promise<void> {
  redis.clear();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as net.AddressInfo).port;
  setSendHooksForTests({ fetch: { resolve: async () => [{ address: "93.184.216.34", family: 4 }], agent: new LocalAgent(port) as never } });

  await claimHandle("rot-one@example.com", "rot-first", "Rot First", "");
  await claimHandle("rot-two@example.com", "rot-second", "Rot Second", "");
  await ensureStatsId("rot-one@example.com");
  await ensureStatsId("rot-two@example.com");
  await setSubscription("rot-one@example.com", { customerId: "cus_RotOne000001", subscriptionId: "sub_RotOne000001", active: true, period: paidPeriod() });
  await setSubscription("rot-two@example.com", { customerId: "cus_RotTwo000001", subscriptionId: "sub_RotTwo000001", active: true, period: paidPeriod() });
  const one = (await storeForEmail("rot-one@example.com"))!;
  const two = (await storeForEmail("rot-two@example.com"))!;

  const added = await addEndpoint(one, "https://hooks.example.com/sales", ["sale.completed"]);
  if (!added.ok) throw new Error("not added");
  const id = added.view.endpoints[0].id;
  const first = added.secret;

  part("Before any change, one signature");
  await emitEvent(one, "sale.completed", "cs_rot_0001", { amount_cents: 100 });
  const plain = String(received[0].headers["marktmorgen-signature"]);
  is("one v1, under the secret shown when it was added", [v1Count(plain), accepts(first, plain, received[0].body)], [1, true]);

  part("A retry waiting when the secret is replaced");
  answers.push(500);
  await emitEvent(one, "sale.completed", "cs_rot_0002", { amount_cents: 200 });
  is("the first try failed and waits", (await webhooksView(one)).log[0].state, "retrying");

  part("Replacing the secret");
  const usedBefore = await allowanceUsed(one, "webhook");
  const now = Date.now();
  const rotated = await rotateSecret(one, id, now);
  if (!rotated.ok) throw new Error("not rotated");
  const second = rotated.secret;
  is("a new secret, shown this once", [/^whsec_[A-Za-z0-9_-]{32}$/.test(second), second === first], [true, false]);
  const view = JSON.stringify(rotated.view);
  is("the studio sees neither secret", [view.includes(second), view.includes(first)], [false, false]);
  is("it sees until when the old one still signs", rotated.view.endpoints[0].oldSecretUntil, new Date(now + ROTATION_HOURS * 3_600_000).toISOString());
  is("replacing it counts no delivery", await allowanceUsed(one, "webhook"), usedBefore);
  is("another store cannot replace it", await rotateSecret(two, id), { ok: false, reason: "missing" });

  part("During the day, both sign");
  await emitEvent(one, "sale.completed", "cs_rot_0003", { amount_cents: 300 });
  const both = received[received.length - 1];
  const header = String(both.headers["marktmorgen-signature"]);
  is("two v1s, one per secret", [v1Count(header), accepts(second, header, both.body), accepts(first, header, both.body)], [2, true, true]);
  is("an unrelated secret still fails", accepts("whsec_not_the_one_at_all_000000000", header, both.body), false);
  const before = received.length;
  await deliverDue(Date.now() + 10_000, Date.now() + RETRY_MINUTES[0] * 60_000 + 1000);
  const retry = received[before];
  const retryHeader = String(retry?.headers["marktmorgen-signature"]);
  is("the waiting retry goes out signed with both", [Boolean(retry), accepts(second, retryHeader, retry?.body ?? ""), accepts(first, retryHeader, retry?.body ?? "")], [true, true, true]);

  part("After the day, only the new one");
  const later = now + ROTATION_HOURS * 3_600_000 + 1;
  const endpoint = { secret: second, previous: first, previousUntil: now + ROTATION_HOURS * 3_600_000 };
  const expired = signatureFor(endpoint, Math.floor(later / 1000), "{}", later);
  is("one v1, and the old secret no longer matches", [v1Count(expired), accepts(second, expired, "{}"), accepts(first, expired, "{}")], [1, true, false]);
  const atEdge = signatureFor(endpoint, Math.floor(now / 1000), "{}", now + ROTATION_HOURS * 3_600_000 - 1);
  is("a moment before the end, still both", v1Count(atEdge), 2);

  part("Replacing again within the day keeps only the newest two");
  const again = await rotateSecret(one, id, now + 60_000);
  if (!again.ok) throw new Error("not rotated");
  await emitEvent(one, "sale.completed", "cs_rot_0004", { amount_cents: 400 });
  const last = received[received.length - 1];
  const lastHeader = String(last.headers["marktmorgen-signature"]);
  is("the newest and the one before sign; the first stops at once", [v1Count(lastHeader), accepts(again.secret, lastHeader, last.body), accepts(second, lastHeader, last.body), accepts(first, lastHeader, last.body)], [2, true, true, false]);

  part("Stored, the old secret leaves when its day is over");
  const statsId = one.statsId!;
  const [raw] = await redis.pipeline([["GET", `nl:hooks:cfg:${statsId}`]]);
  const stored = JSON.parse(String(raw)) as { endpoints: { previous?: string; previousUntil?: number }[] };
  is("kept with its end while it signs", [stored.endpoints[0].previous === second, typeof stored.endpoints[0].previousUntil], [true, "number"]);
  // A change made after the day (here: replacing another endpoint's secret) writes the config without it.
  const other = await addEndpoint(one, "https://hooks.example.com/other", ["refund.issued"]);
  if (!other.ok) throw new Error("not added");
  await rotateSecret(one, other.view.endpoints[1].id, now + ROTATION_HOURS * 3_600_000 + 120_000);
  const [rawAfter] = await redis.pipeline([["GET", `nl:hooks:cfg:${statsId}`]]);
  const after = JSON.parse(String(rawAfter)) as { endpoints: { id: string; previous?: string }[] };
  is("the first endpoint's old secret is gone from storage", after.endpoints.find((e) => e.id === id)?.previous, undefined);

  part("The studio's route offers it");
  const route = readFileSync("app/api/store/webhooks/route.ts", "utf8");
  is("action rotate answers the new secret once", [/action === "rotate"/.test(route), /rotateSecret\(store, id\)/.test(route)], [true, true]);

  server.close();
  done();
}

main().catch((error) => {
  console.error(error);
  server.close();
  process.exit(1);
});

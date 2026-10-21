import assert from "node:assert/strict";
import { createServer } from "node:http";
import { TeamsGraph, TeamsGraphError } from "../lib/microsoft-teams-graph";
async function main() {
  const owner = { storeId: "a".repeat(32), connectionId: "b".repeat(64) };
  const record = { ...owner, provider: "teams", eventId: "opaque+event=" };
  const requests: { method: string; path: string; body: Record<string, unknown>; auth: string }[] = [];
  let status = 200, oversized = false, reservations = 0, admitted = true;
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const raw = Buffer.concat(chunks).toString();
    requests.push({ method: req.method ?? "", path: req.url ?? "", body: raw ? JSON.parse(raw) : {}, auth: String(req.headers.authorization) });
    res.statusCode = req.method === "DELETE" && status === 200 ? 204 : status;
    if (status === 302) res.setHeader("Location", "https://example.invalid/never-follow");
    if (res.statusCode === 204) { res.end(); return; }
    res.setHeader("Content-Type", "application/json");
    res.end(oversized ? JSON.stringify({ data: "x".repeat(1000001) }) : JSON.stringify(req.url?.startsWith("/me/calendar") ? { allowedOnlineMeetingProviders: ["teamsForBusiness"] } : { id: record.eventId }));
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("Local fixture failed");
  const original = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  try {
    const reserve = async () => { reservations++; return admitted; };
    const client = new TeamsGraph({ accessToken: "synthetic-token", owner, reserve, localBase: "http://127.0.0.1:" + address.port });
    const input = { subject: "Synthetic lesson", start: 1793511000000, end: 1793514600000, transactionId: "c".repeat(64) };
    assert.equal(await client.capability("personal"), false);
    assert.equal(requests.length, 0);
    await client.create(input, "organizational");
    assert.equal(requests.length, 2);
    assert.equal(requests[1].method, "POST");
    assert.deepEqual(requests[1].body.attendees, []);
    assert.equal(requests[1].body.transactionId, input.transactionId);
    await client.move(record, input);
    assert.equal(requests[2].path, "/me/events/opaque%2Bevent%3D");
    assert.deepEqual(Object.keys(requests[2].body).sort(), ["end", "start"]);
    await client.remove(record);
    assert.equal(requests[3].method, "DELETE");
    assert.equal(requests[3].auth, "Bearer synthetic-token");
    const before = requests.length;
    await assert.rejects(client.remove({ ...record, storeId: "d".repeat(32) }), (e: unknown) => e instanceof TeamsGraphError && e.kind === "invalid");
    admitted = false;
    await assert.rejects(client.remove(record), (e: unknown) => e instanceof TeamsGraphError && e.kind === "budget");
    assert.equal(requests.length, before);
    admitted = true;
    for (const [code, kind] of [[401, "auth"], [403, "scope"], [404, "gone"], [429, "limit"], [302, "provider"]] as const) {
      status = code;
      await assert.rejects(client.capability("organizational"), (e: unknown) => e instanceof TeamsGraphError && e.kind === kind && !e.message.includes("synthetic-token"));
    }
    status = 200; oversized = true;
    await assert.rejects(client.capability("organizational"), (e: unknown) => e instanceof TeamsGraphError && e.kind === "provider");
    const closed = new TeamsGraph({ accessToken: "synthetic-token", owner, reserve });
    const last = requests.length, reserved = reservations;
    await assert.rejects(closed.capability("organizational"), (e: unknown) => e instanceof TeamsGraphError && e.kind === "disabled");
    assert.equal(requests.length, last);
    assert.equal(reservations, reserved);
    assert.throws(() => new TeamsGraph({ accessToken: "synthetic-token", owner, reserve, localBase: "https://example.invalid" }));
    process.env.NODE_ENV = "production";
    assert.throws(() => new TeamsGraph({ accessToken: "synthetic-token", owner, reserve, localBase: "http://127.0.0.1:" + address.port }));
    console.log("Teams loopback create/move/delete, no attendees, ownership/budget refusals, redirects, response bound and disabled-production checks passed.");
  } finally {
    if (original === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = original;
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

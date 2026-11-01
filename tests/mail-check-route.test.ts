import { NextRequest } from "next/server";
import { GET, maxDuration } from "@/app/api/cron/mail-check/route";
import { control } from "./mail-check-route-world";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const oldFetch = globalThis.fetch;
const realNow = Date.now;
const oldPipeline = redis.pipeline;
const commands: (string | number)[][] = [];
const LAST = "nl:mail-check:last";
const LOCK = "nl:mail-check:lock";
const request = () => new NextRequest("https://example.test/api/cron/mail-check");

function reset(previous?: string): void {
  redis.clear();
  commands.length = 0;
  control.allowed = true; control.sender = true; control.deliveryOk = true; control.throwLoop = false;
  control.calls.length = 0; control.notices.length = 0; control.deadlines.length = 0; control.cutoffRoom.length = 0;
  control.afterUsage = null;
  if (previous !== undefined) redis.run(["SET", LAST, previous]);
}

async function main(): Promise<void> {
  globalThis.fetch = async () => { throw new Error("No real network request belongs in a route orchestration test"); };
  redis.pipeline = async (batch) => {
    commands.push(...batch.map(command => [...command]));
    return oldPipeline(batch);
  };

  part("Missing usage evidence is persisted without changing delivery status or sending a notice");
  reset(JSON.stringify({ ok: true, usage: { ses: { ok: false, reason: "provider" } } }));
  const response = await GET(request());
  const body = await response.json();
  is("the existing delivery checks still pass", [response.status, body.ok, body.checks.every((check: { ok: boolean }) => check.ok)], [200, true, true]);
  is("provider observations remain a separate response field", body.usage, control.usage);
  is("usage failures never add a delivery check or notice",
    [body.checks.length, control.notices.length, control.calls.filter(call => call === "loop").length], [3, 0, 1]);
  const saved = JSON.parse(String(redis.run(["GET", LAST])));
  is("the same last-result record retains the report and top-level delivery result", [saved.ok, saved.usage], [true, control.usage]);
  is("the existing retention remains 30 days",
    commands.some(command => command[0] === "SET" && command[1] === LAST && command[3] === "EX" && command[4] === 30 * 86_400), true);
  is("the lock is released after success", redis.run(["GET", LOCK]), null);
  is("the response cannot be cached", response.headers.get("cache-control"), "no-store");

  part("Only a strict top-level historical false triggers the existing recovery notice");
  for (const previous of [
    "{broken", JSON.stringify([{ ok: false }]), JSON.stringify({ ok: "false" }),
    JSON.stringify({ usage: { ok: false } }), JSON.stringify({ ok: true, detail: 'a string containing "ok":false' }),
  ]) {
    reset(previous);
    const got = await GET(request());
    is("nested, malformed or non-boolean history is not an earlier delivery failure", [got.status, control.notices.length], [200, 0]);
  }
  reset(JSON.stringify({ ok: false, usage: control.usage }));
  await GET(request());
  is("a real earlier delivery failure sends exactly the existing recovery notice",
    control.notices.map(notice => notice.subject), ["Mail check: all passing again"]);
  is("the recovery notice contains delivery checks and no new usage alert",
    control.notices[0].text.includes("provider_reported_counters"), false);
  reset(JSON.stringify({ ok: true }));
  control.deliveryOk = false;
  const failed = await GET(request());
  is("an actual delivery failure still fails and sends its existing notice",
    [(await failed.json()).ok, control.notices.length, control.notices[0].subject.startsWith("Mail check failed:")], [false, 1, true]);
  reset();
  control.throwLoop = true;
  const thrown = await GET(request());
  is("an orchestration error remains a delivery failure and releases its lock",
    [(await thrown.json()).ok, redis.run(["GET", LOCK])], [false, null]);

  part("Collector time does not extend the loop past the run budget");
  reset();
  const anchor = realNow();
  let passed = 0;
  Date.now = () => anchor + passed;
  control.afterUsage = () => { passed = 30_000; };
  const budgeted = await GET(request());
  is("the platform allowance remains 180 seconds", maxDuration, 180);
  is("a 30-second collection leaves the existing 100-second loop window",
    [budgeted.status, control.deadlines, control.cutoffRoom], [200, [anchor + 130_000], [130_000]]);
  is("one collection and one existing delivery run are invoked",
    control.calls.filter(call => ["usage", "loop"].includes(call)), ["usage", "loop"]);
  Date.now = realNow;

  part("Authorization and the existing lock still prevent work");
  reset();
  control.allowed = false;
  const denied = await GET(request());
  is("an unauthorized request invokes no collector or delivery work", [denied.status, control.calls], [401, ["authorize"]]);
  reset();
  redis.run(["SET", LOCK, "other-run", "EX", 170]);
  const busy = await GET(request());
  is("a busy run does not collect, probe, notify or release the other lock",
    [await busy.json(), control.calls, redis.run(["GET", LOCK])], [{ ok: true, busy: true }, ["authorize"], "other-run"]);

  globalThis.fetch = oldFetch;
  redis.pipeline = oldPipeline;
  Date.now = realNow;
  done();
}
main().catch(error => {
  globalThis.fetch = oldFetch; redis.pipeline = oldPipeline; Date.now = realNow;
  console.error(error); process.exit(1);
});

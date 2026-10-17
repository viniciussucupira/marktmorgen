import { readFunnelCounts, readFunnelCountsStrict, countFunnelStep, countFunnelDone } from "@/lib/page-funnel-store";
import { store as redis } from "./redis-stub";
import { funnelCompletionMetric, funnelStepMetrics } from "@/lib/funnel-metrics";
import { done, is, part } from "./check";

process.env.NIMBUS_DATA_KEY = "tests-only-not-a-real-deployment-secret";
const funnel = { id: "abcdefghij", name: "Launch", slug: "launch", on: true, since: 1760000000, steps: [{ kind: "page" as const, id: "landing001" }, { kind: "product" as const, id: "product001" }] };

async function main() {
  redis.clear();
  part("Confirmed zero and actual activity");
  is("confirmed empty counters remain zero", await readFunnelCountsStrict("analytics-store", funnel), [{ seen: 0, done: 0 }, { seen: 0, done: 0 }]);
  await countFunnelStep("analytics-store", funnel, 0, "visitor-a");
  await countFunnelStep("analytics-store", funnel, 0, "visitor-a");
  await countFunnelStep("analytics-store", funnel, 0, "visitor-b");
  await countFunnelStep("analytics-store", funnel, 1, "visitor-a");
  await countFunnelDone("analytics-store", funnel, 1, "visitor-a");
  is("strict analytics retain real deduplicated activity", await readFunnelCountsStrict("analytics-store", funnel), [{ seen: 2, done: 0 }, { seen: 1, done: 1 }]);
  is("healthy strict and legacy counts agree", await readFunnelCountsStrict("analytics-store", funnel), await readFunnelCounts("analytics-store", funnel));
  let missing = false;
  try { await readFunnelCountsStrict(null, funnel); } catch { missing = true; }
  is("missing store counter identity remains unknown", missing, true);
  const original = redis.pipeline;
  try {
    redis.pipeline = async () => { throw new Error("unavailable"); };
    let failed = false;
    try { await readFunnelCountsStrict("analytics-store", funnel); } catch { failed = true; }
    is("transport failure never becomes zero visits", failed, true);
    for (const replies of [[], [0], [0, 0, 0, 0, 0], Array(4)]) {
      redis.pipeline = async () => replies;
      let failed = false;
      try { await readFunnelCountsStrict("analytics-store", funnel); } catch { failed = true; }
      is("incomplete, extra or sparse reply stays unknown " + JSON.stringify(replies), failed, true);
    }
    for (const invalid of [null, undefined, "", "invalid", -1, 1.5, Infinity, NaN, true, false, {}, Number.MAX_SAFE_INTEGER + 1, "1e2", " 0", "-1"]) {
      redis.pipeline = async commands => commands.map(() => invalid);
      let failed = false;
      try { await readFunnelCountsStrict("analytics-store", funnel); } catch { failed = true; }
      is("malformed count stays unknown: " + String(invalid), failed, true);
    }
    redis.pipeline = async () => ["2", "0", "1", "1"];
    is("Redis numeric strings remain supported", await readFunnelCountsStrict("analytics-store", funnel), [{ seen: 2, done: 0 }, { seen: 1, done: 1 }]);
  } finally { redis.pipeline = original; }
  part("The dashboard distinguishes measured zero from unavailable metrics");
  const product = { product: true, free: false };
  is("measured zero does not invent a conversion rate", funnelStepMetrics({ ...product, seen: 0, done: 0 }), "0 people opened it · 0 paid (–)");
  is("paid conversion display", funnelStepMetrics({ ...product, seen: 4, done: 1 }), "4 people opened it · 1 paid (25%)");
  is("free sign-up display", funnelStepMetrics({ ...product, free: true, seen: 1, done: 1 }), "1 person opened it · 1 signed up (100%)");
  is("a page shows visits without calling them purchases", funnelStepMetrics({ ...product, product: false, seen: 1, done: 0 }), "1 person opened it");
  for (const missing of [null, -1, NaN, Infinity, 1.5]) {
    is("unavailable visits never display zero: " + missing, funnelStepMetrics({ ...product, seen: missing, done: 0 }), "Counts unavailable. Reload to try again.");
    is("unavailable conversions never display zero: " + missing, funnelStepMetrics({ ...product, seen: 2, done: missing }), "Counts unavailable. Reload to try again.");
    is("missing first step suppresses completion: " + missing, funnelCompletionMetric(missing, 1), "");
    is("missing last step suppresses completion: " + missing, funnelCompletionMetric(2, missing), "");
  }
  is("empty denominator suppresses completion", funnelCompletionMetric(0, 0), "");
  is("confirmed zero completion remains visible", funnelCompletionMetric(10, 0), "0% of the people who opened the first step reached the last. ");
  is("confirmed completion", funnelCompletionMetric(4, 1), "25% of the people who opened the first step reached the last. ");
  done();
}
void main();

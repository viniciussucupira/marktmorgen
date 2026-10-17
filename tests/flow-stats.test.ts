import { parseFlowCounts, readFlowStatsStrict } from "@/lib/flow-stats";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
const zero = { started: 0, sent: 0, reached: 0, skipped: 0, acted: 0 };
part("Strict sequence activity");
is("confirmed empty hash means zero", parseFlowCounts([]), zero);
is("valid counters retain values", parseFlowCounts(["started", "3", "sent", 4, "reached", "1", "skipped", "2", "acted", "5"]), { started: 3, sent: 4, reached: 1, skipped: 2, acted: 5 });
is("absent counters in a confirmed hash are zero", parseFlowCounts(["sent", "2"]), { ...zero, sent: 2 });
is("future metadata is ignored", parseFlowCounts(["future", "anything", "sent", "2"]), { ...zero, sent: 2 });
for (const value of [null, undefined, {}, "", ["sent"], [12, "1"], ["sent", "1", "sent", "2"]]) is("malformed hash " + JSON.stringify(value), parseFlowCounts(value), null);
for (const value of ["", " ", "no", "-1", -1, "1.5", 1.5, "Infinity", Infinity, NaN, true, null, {}, [], "9007199254740992", "1e2"]) is("invalid counter " + String(value), parseFlowCounts(["sent", value]), null);
is("safe maximum remains exact", parseFlowCounts(["sent", Number.MAX_SAFE_INTEGER])?.sent, Number.MAX_SAFE_INTEGER);
async function main() {
  const original = redis.pipeline;
  let reads = 0;
  let reply: unknown = [[], ["started", "4"]];
  let fail = false;
  redis.pipeline = async (commands) => { reads++; is("only requested sequence keys are read", commands, [["HGETALL", "nl:mail:flowstats:one"], ["HGETALL", "nl:mail:flowstats:two"]]); if (fail) throw new Error("unavailable"); return reply as unknown[]; };
  const flows = [{ id: "one" }, { id: "two" }];
  try {
    is("empty list needs no read", (await readFlowStatsStrict([])).size, 0);
    is("no read for empty list", reads, 0);
    const valid = await readFlowStatsStrict(flows);
    is("confirmed empty sequence is present", valid.get("one"), zero);
    is("second sequence keeps its own activity", valid.get("two"), { ...zero, started: 4 });
    for (reply of [[], [[]], [[], [], []], null, {}, [[], null], [[], ["sent", "bad"]]]) {
      let rejected = false;
      try { await readFlowStatsStrict(flows); } catch { rejected = true; }
      is("invalid batch stays unavailable " + JSON.stringify(reply), rejected, true);
    }
    fail = true;
    let rejected = false;
    try { await readFlowStatsStrict(flows); } catch { rejected = true; }
    is("storage failure stays unavailable", rejected, true);
  } finally { redis.pipeline = original; }
  done();
}
void main();

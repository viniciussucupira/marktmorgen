import { parseFlowList, readFlowListStrict } from "@/lib/flow-list";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
const step = { id: "step1", delayHours: 0, subject: "Hello", body: "Sample" };
const flow = { id: "flow1", name: "Welcome", trigger: "joined", productId: null, active: false, createdAt: 1, steps: [step] };
part("Strict saved sequence list");
is("confirmed empty array remains empty", parseFlowList([]), []);
is("valid saved flow is preserved", parseFlowList([flow]), [flow]);
is("empty steps remain editable diagnostics", parseFlowList([{ ...flow, steps: [] }])?.length, 1);
is("invalid business wait stays editable", parseFlowList([{ ...flow, steps: [{ ...step, delayHours: -1 }] }])?.length, 1);
for (const when of [{ if: "has", productId: "p1" }, { if: "lacks", productId: "p1" }, { if: "tag", tag: "new" }, { if: "untagged", tag: "new" }, ...["started", "unstarted", "finished", "unfinished"].map(value => ({ if: value, productId: "p1" })), ...["buyer", "lead", "clicked", "unclicked", "half-a", "half-b"].map(value => ({ if: value }))]) is("valid condition " + when.if, parseFlowList([{ ...flow, steps: [{ ...step, when }] }])?.length, 1);
for (const action of [{ do: "tag", tag: "new" }, { do: "untag", tag: "new" }, { do: "start", flowId: "other" }, { do: "field", field: "score", value: "1" }, { do: "deal", stage: "new", title: "Deal" }, { do: "note", text: "Call" }, { do: "notify" }, { do: "webhook" }]) is("valid action " + action.do, parseFlowList([{ ...flow, steps: [{ ...step, action }] }])?.length, 1);
for (const value of [null, {}, "", [null], [flow, flow], [{ ...flow, steps: [step, step] }], [{ ...flow, active: "true" }], [{ ...flow, trigger: "unknown" }], [{ ...flow, productId: 2 }], [{ ...flow, steps: null }], [{ ...flow, steps: [{ ...step, body: null }] }], [{ ...flow, steps: [{ ...step, when: "clicked" }] }], [{ ...flow, steps: [{ ...step, when: { if: "has" } }] }], [{ ...flow, steps: [{ ...step, action: { do: "field" } }] }], [{ ...flow, goal: { any: false } }], [{ ...flow, goal: "purchase" }]]) is("malformed list " + JSON.stringify(value), parseFlowList(value), null);
is("valid product goal is preserved", parseFlowList([{ ...flow, goal: { productId: "p1" } }])?.length, 1);
is("valid purchase goal is preserved", parseFlowList([{ ...flow, goal: { any: true } }])?.length, 1);
async function main() {
  const original = redis.pipeline;
  let reply: unknown = [JSON.stringify([flow])];
  let fail = false;
  let calls = 0;
  redis.pipeline = async commands => { calls++; is("only selected list is read", commands, [["GET", "nl:mail:flows:selected-list"]]); if (fail) throw Error("unavailable"); return reply as unknown[]; };
  try {
    is("store without a list is confirmed empty", await readFlowListStrict(null), []);
    is("no storage read without a list", calls, 0);
    is("valid list read", await readFlowListStrict("selected-list"), [flow]);
    reply = [null];
    is("confirmed missing key is empty", await readFlowListStrict("selected-list"), []);
    reply = ["[]"];
    is("confirmed stored empty list", await readFlowListStrict("selected-list"), []);
    for (reply of [[], [null, null], null, {}, [undefined], [""], ["bad json"], ["{}"], ["[null]"], [JSON.stringify([{ ...flow, steps: null }])]]) {
      let rejected = false;
      try { await readFlowListStrict("selected-list"); } catch { rejected = true; }
      is("failed read is not an empty list " + JSON.stringify(reply), rejected, true);
    }
    fail = true;
    let rejected = false;
    try { await readFlowListStrict("selected-list"); } catch { rejected = true; }
    is("storage failure remains unknown", rejected, true);
  } finally { redis.pipeline = original; }
  done();
}
void main();

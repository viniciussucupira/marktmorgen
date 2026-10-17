import { readPageFunnelsStrict } from "@/lib/page-funnel-store";
import { store as redis } from "./redis-stub";
import { is, done } from "./check";

async function main() {
  const pipeline = redis.pipeline;
  const record = { id: "abcdef1234", name: "Launch", slug: "launch", steps: [{ kind: "page", id: "page1" }], on: false, since: 100 };
  async function refused(replies: unknown[]) {
    redis.pipeline = async () => replies;
    try { await readPageFunnelsStrict("store-stats"); return false; } catch { return true; }
  }
  try {
    redis.pipeline = async () => [[]];
    is("confirmed empty hash is an empty inventory", await readPageFunnelsStrict("store-stats"), []);
    redis.pipeline = async () => [[JSON.stringify(record)]];
    is("existing disabled funnel is preserved", await readPageFunnelsStrict("store-stats"), [record]);
    redis.pipeline = async () => [[JSON.stringify({ ...record, id: "abcdef1235", slug: "later", since: 200 }), JSON.stringify(record)]];
    is("confirmed records retain chronological order", (await readPageFunnelsStrict("store-stats")).map(item => item.id), ["abcdef1234", "abcdef1235"]);
    for (const replies of [[], [null], [{}], [[], []], [[17]], [["{"]], [[JSON.stringify({})]], [[JSON.stringify(record), JSON.stringify(record)]]]) {
      is("unconfirmed or corrupt inventory is refused: " + JSON.stringify(replies), await refused(replies), true);
    }
    redis.pipeline = async () => { throw new Error("unavailable"); };
    let failed = false;
    try { await readPageFunnelsStrict("store-stats"); } catch { failed = true; }
    is("transport failure is not an empty list", failed, true);
    let missing = false;
    try { await readPageFunnelsStrict(null); } catch { missing = true; }
    is("missing storage identity is unavailable", missing, true);
    redis.pipeline = async () => [[]];
    is("a later confirmed read recovers", await readPageFunnelsStrict("store-stats"), []);
  } finally { redis.pipeline = pipeline; }
  done();
}
main().catch(error => { console.error(error); process.exitCode = 1; });

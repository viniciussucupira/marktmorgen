import { listDraftsStrict, parseDraftList } from "@/lib/mail-drafts";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
const first = { id: "1111111111111111", subject: "First", body: "Content", productId: null, by: "owner@example.com", savedAt: "2026-10-14T00:00:00.000Z" };
const second = { ...first, id: "2222222222222222", subject: "Second", savedAt: "2026-10-15T00:00:00.000Z" };
async function main() {
  part("Strict saved draft list");
  is("confirmed empty hash stays empty", parseDraftList([]), []);
  is("valid drafts sorted newest first", parseDraftList([first.id, JSON.stringify(first), second.id, JSON.stringify(second)]), [second, first]);
  is("empty editable content is retained", parseDraftList([first.id, JSON.stringify({ ...first, subject: "", body: "" })])?.[0].subject, "");
  for (const raw of [null, {}, "[]", [first.id], [first.id, null], [first.id, "invalid"], [first.id, "null"], [first.id, "[]"], [first.id, "{}"], ["wrong", JSON.stringify(first)], [first.id, JSON.stringify(second)], [first.id, JSON.stringify(first), first.id, JSON.stringify(first)]]) is("invalid hash stays unknown " + JSON.stringify(raw), parseDraftList(raw), null);
  for (const draft of [{ ...first, subject: 1 }, { ...first, body: null }, { ...first, productId: undefined }, { ...first, productId: [] }, { ...first, productId: "" }, { ...first, by: undefined }, { ...first, savedAt: "invalid" }]) is("invalid record stays unknown", parseDraftList([first.id, JSON.stringify(draft)]), null);
  const original = redis.pipeline;
  const calls: (string | number)[][][] = [];
  let reply: unknown = [[]];
  redis.pipeline = async commands => { calls.push(commands); if (reply instanceof Error) throw reply; return reply as unknown[]; };
  try {
    is("no list id is confirmed empty", await listDraftsStrict(null), []);
    is("no list id makes no storage call", calls.length, 0);
    is("empty stored list is valid", await listDraftsStrict("selected-list"), []);
    is("only selected store key is read", calls, [[["HGETALL", "nl:mail:drafts:selected-list"]]]);
    reply = [[first.id, JSON.stringify(first)]];
    is("valid stored draft retained", await listDraftsStrict("selected-list"), [first]);
    for (const failed of [[], null, {}, [null], [[], []], [[first.id, "invalid"]], new Error("unavailable")]) {
      reply = failed;
      let refused = false;
      try { await listDraftsStrict("selected-list"); } catch { refused = true; }
      is("unavailable storage never becomes empty", refused, true);
    }
  } finally { redis.pipeline = original; }
  done();
}
void main();

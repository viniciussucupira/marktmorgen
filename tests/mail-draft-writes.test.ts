import { DraftWriteUnconfirmed, saveDraft } from "@/lib/mail-drafts";
import type { Store } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
const listId = "draft-write-tests";
const key = "nl:mail:drafts:" + listId;
const store = { listId, catalog: { items: [] } } as unknown as Store;
const first = { id: "1111111111111111", subject: "First", body: "Original", productId: null, by: "owner@example.com", savedAt: "2026-10-15T00:00:00.000Z" };
const second = { ...first, id: "2222222222222222", subject: "Second" };
async function main() {
  part("Draft write acknowledgement");
  const original = redis.pipeline;
  const normal = Symbol("normal");
  let reply: unknown = normal;
  let applyWrite = false;
  redis.pipeline = async commands => {
    if (commands.some(command => command[0] === "HSET" && command[1] === key) && reply !== normal) {
      if (applyWrite) await original.call(redis, commands);
      if (reply instanceof Error) throw reply;
      return reply as unknown[];
    }
    return original.call(redis, commands);
  };
  const input = { subject: "Updated", body: "Updated content", productId: "" };
  try {
    await original.call(redis, [["DEL", key], ["HSET", key, first.id, JSON.stringify(first), second.id, JSON.stringify(second)]]);
    for (const uncertain of [[], [null], [true], ["1"], [-1], [2], [1, 0], null, {}, new Error("write unavailable")]) {
      reply = uncertain;
      for (const id of [undefined, first.id]) {
        let rejected = false;
        try { await saveDraft(store, "owner@example.com", { ...input, id }); } catch (error) { rejected = error instanceof DraftWriteUnconfirmed; }
        is("unconfirmed " + (id ? "edit" : "creation") + " " + String(uncertain), rejected, true);
      }
    }
    is("failed writes preserve original", (await original.call(redis, [["HGET", key, first.id]]))[0], JSON.stringify(first));
    is("failed writes preserve another draft", (await original.call(redis, [["HGET", key, second.id]]))[0], JSON.stringify(second));
    applyWrite = true;
    reply = [];
    let unconfirmed = false;
    try { await saveDraft(store, "owner@example.com", { ...input, id: first.id }); } catch (error) { unconfirmed = error instanceof DraftWriteUnconfirmed; }
    is("applied write with lost acknowledgement stays unconfirmed", unconfirmed, true);
    is("unconfirmed does not mean rollback", JSON.parse(String((await original.call(redis, [["HGET", key, first.id]]))[0])).body, input.body);
    reply = [0];
    is("confirmed overwrite acknowledgement is valid", (await saveDraft(store, "owner@example.com", { ...input, id: first.id })).ok, true);
    applyWrite = false;
    reply = normal;
    is("confirmed new-field acknowledgement is valid", (await saveDraft(store, "owner@example.com", input)).ok, true);
    is("creation keeps other drafts", (await original.call(redis, [["HLEN", key]]))[0], 3);
    is("successful writes preserve unrelated draft", (await original.call(redis, [["HGET", key, second.id]]))[0], JSON.stringify(second));
  } finally { redis.pipeline = original; }
  done();
}
void main();

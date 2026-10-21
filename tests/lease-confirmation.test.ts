import { test } from "node:test";
import assert from "node:assert/strict";
import { holdLock, setIfHeld, type Held } from "@/lib/redis-lock";
import { store } from "./redis-stub";

test("unknown script acknowledgments never confirm a lease or fenced write", async () => {
  const original: typeof store.pipeline = store.pipeline.bind(store);
  const held: Held = { key: "synthetic:held", token: "owner", ttlSeconds: 15 };
  try {
    for (const acknowledgment of [undefined, null, false, true, 0, 2, "1", "OK", {}, []]) {
      store.pipeline = async () => [acknowledgment];
      assert.equal(await holdLock(held), false);
      assert.equal(await setIfHeld(held, "synthetic:record", "value"), false);
    }
    store.pipeline = async () => [1];
    assert.equal(await holdLock(held), true);
    assert.equal(await setIfHeld(held, "synthetic:record", "value"), true);
  } finally { store.pipeline = original; }
});

test("fallback renewal and writes require explicit storage acknowledgment and known absence", async () => {
  const original: typeof store.pipeline = store.pipeline.bind(store);
  const held: Held = { key: "synthetic:held", token: "owner", ttlSeconds: 15 };
  let acknowledgment: unknown;
  let existence: unknown = 0;
  let writes = 0;
  store.pipeline = async commands => {
    if (commands[0]?.[0] === "EVAL") throw Error("Synthetic unsupported script");
    return commands.map(command => {
      if (command[0] === "GET") return held.token;
      if (command[0] === "EXISTS") return existence;
      if (command[0] === "EXPIRE") return acknowledgment;
      if (command[0] === "SET") { writes += 1; return acknowledgment; }
      throw Error("Unexpected synthetic command");
    });
  };
  try {
    for (const unknown of [undefined, null, false, true, 0, 2, "1", {}, []]) {
      acknowledgment = unknown;
      assert.equal(await holdLock(held), false);
      assert.equal(await setIfHeld(held, "synthetic:record", "value"), false);
    }
    for (const unknownExistence of [undefined, null, false, true, 1, 2, "0", "1", {}, []]) {
      existence = unknownExistence;
      acknowledgment = "OK";
      const before: number = writes;
      assert.equal(await setIfHeld(held, "synthetic:record", "value", { absent: true }), false);
      assert.equal(writes, before);
    }
    acknowledgment = 1;
    assert.equal(await holdLock(held), true);
    acknowledgment = "OK";
    existence = 0;
    assert.equal(await setIfHeld(held, "synthetic:record", "value", { absent: true }), true);
    existence = 1;
    const before: number = writes;
    assert.equal(await setIfHeld(held, "synthetic:record", "value", { absent: true }), false);
    assert.equal(writes, before);
  } finally { store.pipeline = original; }
});

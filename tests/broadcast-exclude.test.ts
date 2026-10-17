/**
 * Writing to the people who have not bought yet.
 *
 * A broadcast could go to everyone who agreed, or to the buyers of one
 * product. Not to the difference between them — which is the one letter in
 * this whole business that reliably sells: the people who took the free
 * guide and have not bought the course.
 *
 * It needed no new tracking. Every contact has carried `ids` from the
 * beginning, the products they asked for or bought, and the filter is one
 * line reading it. Nothing is now recorded about anybody that was not
 * recorded before, which is the only version of this feature worth having.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { audience, leadsKey, parseContact, upsertContact } from "@/lib/contacts";
import { store as redis } from "./redis-stub";
import { ROOM } from "./data-room";

const LIST = "list_abc";
const FREE = "prod_guide";
const PAID = "prod_course";

async function join(email: string, ids: string[]) {
  if (!ids.length) {
    await upsertContact(LIST, email, { agreed: true, explicit: true, source: "free" }, ROOM);
    return;
  }
  for (const id of ids) {
    await upsertContact(LIST, email, { agreed: true, explicit: true, source: "free", productId: id, title: id }, ROOM);
  }
}

test("setting up a list with the three kinds of person on it", async () => {
  redis.run(["DEL", leadsKey(LIST)]);
  await join("took-free@example.com", [FREE]);
  await join("took-both@example.com", [FREE, PAID]);
  await join("bought-only@example.com", [PAID]);
  await join("just-joined@example.com", []);
  await join("left@example.com", [FREE]);

  const all = await audience(LIST);
  assert.equal(all.length, 5, "everyone who agreed is writable to");
});

test("everyone, which is what it did before and still does", async () => {
  const to = await audience(LIST);
  assert.ok(to.includes("took-free@example.com"));
  assert.ok(to.includes("bought-only@example.com"));
  assert.ok(to.includes("just-joined@example.com"));
});

test("only the people who got one thing", async () => {
  const to = await audience(LIST, FREE);
  assert.deepEqual(to.sort(), ["left@example.com", "took-both@example.com", "took-free@example.com"]);
  assert.ok(!to.includes("bought-only@example.com"), "they never took the free one");
});

test("everyone except the people who already bought", async () => {
  const to = await audience(LIST, undefined, PAID);
  assert.ok(to.includes("took-free@example.com"));
  assert.ok(to.includes("just-joined@example.com"));
  assert.ok(!to.includes("took-both@example.com"), "they have it; the letter is not for them");
  assert.ok(!to.includes("bought-only@example.com"));
});

test("the letter that sells: took the free one, has not bought the paid one", async () => {
  const to = await audience(LIST, FREE, PAID);
  assert.deepEqual(
    to.sort(),
    ["left@example.com", "took-free@example.com"],
    "the difference between the two groups, which could not be addressed before",
  );
});

test("the same product on both sides is nobody, and is refused rather than sent", async () => {
  const to = await audience(LIST, FREE, FREE);
  assert.deepEqual(to, [], "only those who have it, who do not have it");
});

test("somebody who left is never in any of them", async () => {
  // Straight into storage, the way the unsubscribe link leaves its mark.
  const raw = redis.run(["HGET", leadsKey(LIST), "left@example.com"]);
  const contact = parseContact(raw);
  assert.ok(contact);
  redis.run([
    "HSET",
    leadsKey(LIST),
    "left@example.com",
    JSON.stringify({ ...contact, unsub: true, unsubAt: new Date().toISOString() }),
  ]);
  for (const to of [
    await audience(LIST),
    await audience(LIST, FREE),
    await audience(LIST, undefined, PAID),
    await audience(LIST, FREE, PAID),
  ]) {
    assert.ok(!to.includes("left@example.com"), "unsubscribing beats every filter, every time");
  }
});

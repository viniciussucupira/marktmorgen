import { test } from "node:test";
import assert from "node:assert/strict";
import { streamWatched, streamHeld, dropAllStreams } from "@/lib/stream";
import { measure, watchedIn } from "@/lib/watch";
import { store } from "./redis-stub";

const folder = "0123456789abcdef0123456789abcdef";
const collection = "11111111-1111-4111-8111-111111111111";
const id = (n: number) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
const video = (n: number, seconds = 10) => ({ guid: id(n), collectionId: collection, totalWatchTime: seconds });
const key = "nl:stream:col:" + folder;
let page: (n: number) => unknown;
let deleted = 0;

function setup() {
  process.env.BUNNY_STREAM_LIBRARY_ID = "4242";
  process.env.BUNNY_STREAM_API_KEY = "stand-in-key-that-is-long-enough";
  process.env.BUNNY_STREAM_TOKEN_KEY = "stand-in-token-key-long-enough";
  store.run(["SET", key, collection]);
  deleted = 0;
}
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  if (init?.method === "DELETE") { deleted++; return Response.json({}); }
  const url = new URL(String(input));
  return Response.json(page(Number(url.searchParams.get("page") ?? 1)));
}) as typeof fetch;

test("complete pages preserve exact integer watch totals, including zero", async () => {
  setup();
  page = () => ({ totalItems: 2, items: [video(1, 0), video(2, 12)] });
  assert.deepEqual(await streamWatched(folder), [{ id: id(1), seconds: 0 }, { id: id(2), seconds: 12 }]);
});
test("provider-declared smaller pages are fully traversed", async () => {
  setup();
  page = n => ({ totalItems: 3, currentPage: n, itemsPerPage: 2, items: n === 1 ? [video(1), video(2)] : [video(3)] });
  assert.equal((await streamWatched(folder))?.length, 3);
});
test("short pages that contradict totals cannot authorize a partial reading or deletion", async () => {
  setup();
  page = () => ({ totalItems: 2, items: [video(1)] });
  assert.equal(await streamWatched(folder), null);
  assert.equal(await dropAllStreams(folder), null);
  assert.equal(deleted, 0);
});
test("unknown, negative, fractional and unsafe watch values never become zero", async () => {
  setup();
  for (const seconds of [undefined, null, "10", -1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    page = () => ({ totalItems: 1, items: [{ ...video(1), totalWatchTime: seconds }] });
    assert.equal(await streamWatched(folder), null);
  }
});
test("missing or inconsistent pagination metadata is unavailable", async () => {
  setup();
  for (const data of [
    {items: []}, {totalItems: -1, items: []}, {totalItems: 0.5, items: []},
    {totalItems: 1, currentPage: 2, items: [video(1)]},
    {totalItems: 1, itemsPerPage: 0, items: [video(1)]},
    {totalItems: 0, items: [video(1)]}
  ]) { page = () => data; assert.equal(await streamWatched(folder), null); }
});
test("duplicate, invalid and foreign collection IDs invalidate the entire reading", async () => {
  setup();
  for (const items of [
    [video(1), video(1)],
    [{...video(1), guid: "invalid"}],
    [{...video(1), collectionId: "foreign"}]
  ]) { page = () => ({totalItems: items.length, items}); assert.equal(await streamWatched(folder), null); }
});
test("changing totals and repeated pages are not accepted as complete", async () => {
  setup();
  page = n => ({totalItems: n === 1 ? 2 : 3, itemsPerPage: 1, currentPage: n, items: [video(n)]});
  assert.equal(await streamWatched(folder), null);
  page = n => ({totalItems: 2, itemsPerPage: 1, currentPage: n, items: [video(1)]});
  assert.equal(await streamWatched(folder), null);
});
test("scan bounds reject unfinished collections and accept a complete last page", async () => {
  setup();
  page = n => ({totalItems: 21, itemsPerPage: 1, currentPage: n, items: [video(n)]});
  assert.equal(await streamWatched(folder), null);
  page = n => ({totalItems: 20, itemsPerPage: 1, currentPage: n, items: [video(n)]});
  assert.equal((await streamWatched(folder))?.length, 20);
});
test("lost credentials with existing collection never mean no usage", async () => {
  setup();
  delete process.env.BUNNY_STREAM_API_KEY;
  assert.equal(await streamWatched(folder), null);
  assert.equal(await streamHeld(folder), null);
  assert.equal(await dropAllStreams(folder), null);
  store.run(["DEL", key]);
  assert.deepEqual(await streamWatched(folder), []);
  assert.equal(await streamHeld(folder), 0);
});
test("failed readings preserve the previous measured baseline and monthly total", async () => {
  setup();
  page = () => ({totalItems: 1, items: [video(50, 10)]});
  assert.equal(await measure(folder), 10);
  page = () => ({totalItems: 1, items: [{...video(50), totalWatchTime: null}]});
  assert.equal(await measure(folder), null);
  assert.equal(await watchedIn(folder), 10);
  page = () => ({totalItems: 1, items: [video(50, 15)]});
  assert.equal(await measure(folder), 5);
  assert.equal(await watchedIn(folder), 15);
});

test("invalid collection records and imprecise byte counts remain unknown", async () => {
  setup();
  store.run(["SET", key, "corrupt"]);
  assert.equal(await streamWatched(folder), null);
  assert.equal(await streamHeld(folder), null);
  setup();
  for (const totalSize of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, null]) {
    page = () => ({totalSize});
    assert.equal(await streamHeld(folder), null);
  }
  page = () => ({totalSize: 0});
  assert.equal(await streamHeld(folder), 0);
});

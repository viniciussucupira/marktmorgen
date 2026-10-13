/**
 * Numbers counted by the platform, shown to others (lib/verified-numbers.ts,
 * lib/numbers-links.ts; added 13 October 2026). Checked:
 *
 *   - the record holds what the studio counted, sales only when they were
 *     read, countries as shares, and nobody in it;
 *   - a link needs a name, a password of 8 characters or more and one of
 *     the end dates; the password is kept only as a salted hash;
 *   - the cookie a right password leaves opens that link only, ends with it,
 *     and stops when the link is taken back and made again;
 *   - five links at most, taken back at once, and a few hundred openings a day;
 *   - the media kit shows counted numbers only when the creator picks them.
 */
import { MAX_LINKS, OPENS_PER_DAY, cookieFits, countOpen, indexLink, linkStore, makeLink, parseLinks, passCookie, passwordFits, unindexLink } from "@/lib/numbers-links";
import { readVerified, refreshVerified, usesVerified, verifiedFrom } from "@/lib/verified-numbers";
import { parseKit } from "@/lib/store-kit";
import { addNumbersLink, claimHandle, ensureStatsId, removeNumbersLink, setKit, storeForEmail } from "@/lib/store";
import type { StatsData } from "@/lib/stats";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

process.env.NIMBUS_DATA_KEY = "a-local-key-for-tests-only-0123456789abcdef";

const NOW = Date.UTC(2026, 9, 13, 12);

globalThis.fetch = (async () => new Response(JSON.stringify({ object: "list", data: [], has_more: false }), { status: 200 })) as typeof fetch;

const win = (visitors: number, sales: number, cents: number) => ({ visitors, views: visitors * 2, checkouts: sales * 2, sales, cents });

async function main(): Promise<void> {
  redis.clear();

  part("The record of counted numbers");
  const data = {
    currency: "usd",
    sales: "ok",
    totals: { d7: win(100, 2, 4000), d30: win(400, 8, 16000), d90: win(1200, 20, 40000), all: win(2000, 0, 0) },
    channels: { d7: [], d30: [{ source: "instagram", visits: 300, checkouts: 10, free: 0, sales: 6, cents: 12000 }], d90: [] },
    products: [{ id: "guide", title: "", d7: { views: 0, checkouts: 0, sales: 0, cents: 0 }, d30: { views: 90, checkouts: 10, sales: 8, cents: 16000 }, d90: { views: 0, checkouts: 0, sales: 0, cents: 0 }, all: { views: 0, checkouts: 0, sales: 0, cents: 0 } }],
    salesCountries: { d7: [], d30: [], d90: [{ country: "US", sales: 15, cents: 30000 }, { country: "GB", sales: 5, cents: 10000 }] },
  } as unknown as StatsData;
  const record = verifiedFrom(data, new Map([["guide", "The Guide"]]), NOW);
  is("the windows, channels, products and countries as shares", [record.day, record.windows.d30, record.channels[0].sales, record.products, record.countries], [
    "2026-10-13",
    { visitors: 400, views: 800, checkouts: 16, sales: 8, cents: 16000 },
    6,
    [{ title: "The Guide", sales: 8, cents: 16000 }],
    [{ country: "US", share: 0.75 }, { country: "GB", share: 0.25 }],
  ]);
  const unread = verifiedFrom({ ...data, sales: "error" } as StatsData, new Map(), NOW);
  is("sales left out when Stripe was not read", [unread.salesRead, unread.windows.d30.sales, unread.products, unread.countries], [false, null, [], []]);

  part("A link, its password and its end");
  is("a name, a password of 8 or more and an end date", [
    makeLink({ label: "", password: "longenough", days: 30, money: false }, NOW),
    makeLink({ label: "Acme", password: "short", days: 30, money: false }, NOW),
    makeLink({ label: "Acme", password: "longenough", days: 45, money: false }, NOW),
  ].map((r) => (r.ok ? "ok" : r.reason)), ["label", "password", "days"]);
  const made = makeLink({ label: "Acme sponsorship", password: "harbor-2026", days: 30, money: true }, NOW);
  if (!made.ok) throw new Error("no link");
  const link = made.link;
  is("ends when chosen, and the password is kept only as a hash", [link.expires - Math.floor(NOW / 1000), JSON.stringify(link).includes("harbor-2026"), /^[0-9a-f]{64}$/.test(link.hash)], [30 * 86_400, false, true]);
  is("the right password opens it, a wrong one does not", [passwordFits(link, "harbor-2026"), passwordFits(link, "harbor-2025"), passwordFits(link, "")], [true, false, false]);
  const cookie = passCookie(link, NOW);
  is("the cookie opens it, for twelve hours", [cookieFits(link, cookie, NOW), cookieFits(link, cookie, NOW + 13 * 3_600_000)], [true, false]);
  const again = makeLink({ label: "Acme sponsorship", password: "harbor-2026", days: 30, money: true }, NOW);
  if (!again.ok) throw new Error("no link");
  is("and never another link, nor one made again in its place", [cookieFits({ ...again.link }, cookie, NOW), cookieFits({ ...link, hash: again.link.hash }, cookie, NOW), cookieFits(link, "x.y", NOW)], [false, false, false]);
  is("read back whole only", parseLinks([link, { ...link, id: "BAD" }, { ...link, hash: "x" }]).length, 1);

  part("Kept with the store, at most five, taken back at once");
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  let store = (await storeForEmail("owner@example.com"))!;
  is("nothing shown to others yet", usesVerified(store, Math.floor(NOW / 1000)), false);
  for (let i = 0; i < MAX_LINKS; i += 1) {
    const one = makeLink({ label: `Partner ${i}`, password: "harbor-2026", days: 7, money: false }, NOW);
    if (one.ok) await addNumbersLink("owner@example.com", i === 0 ? link : one.link, NOW);
  }
  const extra = makeLink({ label: "One more", password: "harbor-2026", days: 7, money: false }, NOW);
  is("a sixth is refused", extra.ok ? (await addNumbersLink("owner@example.com", extra.link, NOW)).ok : true, false);
  is("an ended one makes room", extra.ok ? (await addNumbersLink("owner@example.com", extra.link, NOW + 8 * 86_400_000)).ok : false, true);
  store = (await storeForEmail("owner@example.com"))!;
  is("in use while one still works", usesVerified(store, Math.floor(NOW / 1000)), true);
  await indexLink(store.sid, link, NOW);
  is("its id finds its store", await linkStore(link.id), store.sid);
  await removeNumbersLink("owner@example.com", link.id);
  await unindexLink(link.id);
  is("taken back, it finds nothing", [await linkStore(link.id), (await storeForEmail("owner@example.com"))!.numbersLinks.some((l) => l.id === link.id)], [null, false]);
  let opened = 0;
  for (let i = 0; i < OPENS_PER_DAY + 2; i += 1) if (await countOpen(link.id, NOW)) opened += 1;
  is(`${OPENS_PER_DAY} openings a day`, opened, OPENS_PER_DAY);

  part("Read once a day and kept");
  const kept = await refreshVerified(store, NOW);
  is("kept, and read back without asking again", [(await readVerified(store))?.day, kept?.salesRead], ["2026-10-13", false]);

  part("In the media kit, only when picked");
  is("off until picked", [parseKit({}).counted, parseKit({ counted: { visitors: true, sales: "yes" } }).counted], [{ visitors: false, sales: false, countries: false }, { visitors: true, sales: false, countries: false }]);
  await setKit("owner@example.com", { on: true, pitch: "Weeknight dinners.", counted: { visitors: true, sales: true, countries: false } });
  is("kept with the kit", (await storeForEmail("owner@example.com"))!.kit.counted, { visitors: true, sales: true, countries: false });

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

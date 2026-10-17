/**
 * Private podcasts: the episodes, the feed a buyer's app reads, and who may
 * read it.
 *
 * Measured before it was built (30 September 2026): Kajabi's private
 * podcasts play in Kajabi's own app; Stan, Skool, Circle, Mighty Networks and
 * Whop document none. What is checked:
 *
 *   - what can become a podcast, and that it goes on sale with its first episode;
 *   - episodes: only audio, a title, and deleting one says which audio to delete;
 *   - the feed: newest first, escaped, kept out of directories;
 *   - each address keeps one feed; the creator may always listen, a stranger
 *     never, somebody given it may.
 */
import { addProduct, claimHandle, ensureStatsId, setProductLink, setProductPodcast, setPodcastEpisodes, setStripeAccount, setSubscription, storeForEmail } from "@/lib/store";
import { readListing } from "@/lib/catalog";
import { canSellProduct } from "@/lib/store-checkout";
import { editPodcast } from "@/lib/podcast";
import { appLinks, feedXml, type Podcast } from "@/lib/podcast-rules";
import { FEED_READS_A_DAY, FEED_SHARED_SECONDS, feedToken, mayListen, readFeedToken } from "@/lib/podcast-access";
import { GET as feed } from "@/app/api/store/podcast/feed/[token]/route";
import { storeFolder } from "@/lib/store";
import { visitsIn } from "@/lib/traffic";
import { COMMANDS, feedDayCost, visitCost } from "./traffic-cost";
import { grantImported } from "@/lib/imported-purchases";
import { setPastBuyers } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";
import { windowId } from "@/lib/allowance-window";
import { REQUEST_COMMANDS } from "./plan-cost-registry";

globalThis.fetch = (async () => new Response(JSON.stringify({ object: "list", data: [], has_more: false }))) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_podcast_only_a_stand_in";
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setStripeAccount("owner@example.com", "acct_1TestHarbor0001", true);
  await setSubscription("owner@example.com", { customerId: "cus_Owner00001", subscriptionId: "sub_Owner00001", active: true, period: paidPeriod() });
  const show = await addProduct("owner@example.com", "Sourdough Radio", "", "19", null);
  const free = await addProduct("owner@example.com", "Free Guide", "", "0", null);
  const linked = await addProduct("owner@example.com", "Linked", "", "9", null);
  if (!show.ok || !free.ok || !linked.ok) throw new Error("no products");
  await setProductLink("owner@example.com", linked.product.id, "https://example.com");

  part("What can become a podcast");
  const podcastId = "a".repeat(32);
  const refusedFree = await setProductPodcast("owner@example.com", free.product.id, { id: podcastId, episodes: 0 });
  is("not something free", refusedFree.ok ? "made" : refusedFree.reason, "free");
  const refusedLink = await setProductPodcast("owner@example.com", linked.product.id, { id: podcastId, episodes: 0 });
  is("not something that hands over a link", refusedLink.ok ? "made" : refusedLink.reason, "delivery");
  is("a paid product with nothing attached", (await setProductPodcast("owner@example.com", show.product.id, { id: podcastId, episodes: 0 })).ok, true);
  let store = (await storeForEmail("owner@example.com"))!;
  is("not on sale without an episode", canSellProduct(store, (await readListing(store, show.product.id))!), false);
  await setPodcastEpisodes("owner@example.com", show.product.id, 1);
  store = (await storeForEmail("owner@example.com"))!;
  is("on sale with its first", canSellProduct(store, (await readListing(store, show.product.id))!), true);
  const notEmpty = await setProductPodcast("owner@example.com", show.product.id, null);
  is("one with episodes is not turned back", notEmpty.ok ? "undone" : notEmpty.reason, "not_empty");

  part("Episodes");
  let podcast: Podcast = { id: podcastId, episodes: [] };
  const wrong = editPodcast(podcast, { op: "add", pathname: "x", bytes: 1, contentType: "video/mp4", title: "One", notes: "", at: 1 });
  is("only audio", wrong.ok ? "added" : wrong.reason, "type");
  const untitled = editPodcast(podcast, { op: "add", pathname: "x", bytes: 1, contentType: "audio/mpeg", title: "  ", notes: "", at: 1 });
  is("with a title", untitled.ok ? "added" : untitled.reason, "title");
  for (const [title, at] of [["Starter <basics> & more", 100], ["Shaping", 200]] as const) {
    const added = editPodcast(podcast, { op: "add", pathname: `stores/f/p/${at}.mp3`, bytes: 1000, contentType: "audio/mpeg", title, notes: "Notes", at });
    if (!added.ok) throw new Error("no episode");
    podcast = added.podcast;
  }
  is("two out", podcast.episodes.length, 2);
  const removed = editPodcast(podcast, { op: "remove", id: podcast.episodes[1].id });
  is("deleting one says which audio goes", removed.ok && removed.removed?.pathname, "stores/f/p/200.mp3");

  part("The feed");
  const xml = feedXml({ title: "Sourdough Radio", summary: "", author: "Harbor Kitchen", page: "https://x/p", image: null, episodes: podcast.episodes, audio: (e) => `https://x/play/${e.id}.mp3` });
  is("kept out of directories", xml.includes("<itunes:block>Yes</itunes:block>"), true);
  is("newest first", xml.indexOf("Shaping") < xml.indexOf("Starter"), true);
  is("titles escaped", xml.includes("Starter &lt;basics&gt; &amp; more"), true);
  is("each episode through its own address", xml.includes(`url="https://x/play/${podcast.episodes[0].id}.mp3" length="1000" type="audio/mpeg"`), true);
  is("an app button for each", appLinks("https://marktmorgen.com/f.xml").map((a) => a.href), [
    "podcast://marktmorgen.com/f.xml",
    "overcast://x-callback-url/add?url=https%3A%2F%2Fmarktmorgen.com%2Ff.xml",
    "pktc://subscribe/marktmorgen.com/f.xml",
  ]);

  part("Who may listen");
  const token = await feedToken(store, show.product.id, "Dana@Example.com");
  is("one feed per address", await feedToken(store, show.product.id, "dana@example.com"), token);
  is("the token names the address", (await readFeedToken(token!))?.e, "dana@example.com");
  is("the creator always", await mayListen(store, show.product.id, "owner@example.com"), true);
  is("a stranger never", await mayListen(store, show.product.id, "dana@example.com"), false);
  await grantImported(store.statsId!, "gift:gft_x", [{ email: "hal@example.com", productId: show.product.id, items: null }]);
  await setPastBuyers("owner@example.com");
  store = (await storeForEmail("owner@example.com"))!;
  is("somebody given it", await mayListen(store, show.product.id, "hal@example.com"), true);

  part("What a feed costs, and what it is counted as");
  let commands = 0;
  const real = redis.pipeline.bind(redis);
  (redis as unknown as { pipeline: typeof redis.pipeline }).pipeline = ((list: (string | number)[][]) => {
    commands += list.length;
    return real(list);
  }) as typeof redis.pipeline;
  const ask = (t: string) => feed(new Request(`https://marktmorgen.com/api/store/podcast/feed/${t}.xml`) as never, { params: Promise.resolve({ token: `${t}.xml` }) });
  const folder = await storeFolder("owner@example.com");
  const hal = (await feedToken(store, show.product.id, "hal@example.com"))!;
  const first = await ask(hal);
  is("a subscriber's feed is answered", [first.status, first.headers.get("content-type")], [200, "application/rss+xml; charset=utf-8"]);
  is("and the CDN may keep it, under its own secret address, for a few hours", first.headers.get("cache-control"), `public, max-age=0, s-maxage=${FEED_SHARED_SECONDS}`);
  is("the subscriber is that day's visit to the store", await visitsIn(folder, windowId((await storeForEmail("owner@example.com"))!)!), 1);
  await ask(hal);
  is("once, however often the app asks", await visitsIn(folder, windowId((await storeForEmail("owner@example.com"))!)!), 1);
  const ivy = "ivy@example.com";
  await grantImported(store.statsId!, "gift:gft_y", [{ email: ivy, productId: show.product.id, items: null }]);
  const ivys = (await feedToken(store, show.product.id, ivy))!;
  // Measured on a subscriber's first feed of a day, which also writes the
  // day's visit, and not on the month's first visit to the store, which
  // writes a little more once (lib/traffic.ts, markMonth).
  commands = 0;
  await ask(ivys);
  const built = commands;
  commands = 0;
  await ask(ivys);
  const again = commands;
  is("another subscriber is another", await visitsIn(folder, windowId((await storeForEmail("owner@example.com"))!)!), 2);
  is("putting a feed together stays inside what it is costed at, the day's first time and after", [built <= COMMANDS.feedFirst + REQUEST_COMMANDS, again <= COMMANDS.feed + REQUEST_COMMANDS, again > 0], [true, true, true]);
  await ask((await feedToken(store, show.product.id, "owner@example.com"))!);
  is("the creator's own feed is never counted", await visitsIn(folder, windowId((await storeForEmail("owner@example.com"))!)!), 2);
  const stranger = await ask((await feedToken(store, show.product.id, "dana@example.com"))!);
  is("an address that does not hold it gets an empty list, and is no visit", [stranger.status, /<item>/.test(await stranger.text()), await visitsIn(folder, windowId((await storeForEmail("owner@example.com"))!)!)], [200, false, 2]);
  const asked: number[] = [];
  for (let i = 0; i < FEED_READS_A_DAY; i += 1) asked.push((await ask(hal)).status);
  is("a feed is put together only so often in a day", [asked.filter((code) => code === 200).length, asked[asked.length - 1]], [FEED_READS_A_DAY - 2, 429]);
  is("which is what a day's visit pays for", feedDayCost(FEED_READS_A_DAY) <= visitCost(), true);
  is("and the CDN asks less often than that", (24 * 3600) / FEED_SHARED_SECONDS < FEED_READS_A_DAY, true);
  is("a feed that is not one is not found", (await ask("0".repeat(48))).status, 404);
  console.log(`      (a feed took ${built} commands the day's first time and ${again} after)`);

  done();
}

void main();

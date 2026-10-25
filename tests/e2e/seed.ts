/**
 * A store for tests/e2e/run.mjs to open in a browser: five products with a
 * link each, cut into three sections, with a line of news, able to sell, and
 * a session for its owner. Written through the same functions the studio
 * uses, into the stand-in database.
 */
import { setPayPalSeller } from "@/lib/store";
import { addProduct, addStoreLink, claimHandle, createStore, ensureStatsId, setProductPage, setAnnouncement, setProductExtras, setProductImage, setLinkImage, setProductLink, setReviewed, setSections, storeForEmail, setStripeAccount, setSubscription, setMailSettings, storeRef } from "@/lib/store";
import { openSession } from "@/lib/auth";
import { saveReview, setReviewPhoto } from "@/lib/reviews";
import { refreshStoreQuotes } from "@/lib/store-quotes";
import { writePage } from "@/lib/sales-page-store";
import { parsePage } from "@/lib/sales-page";

const OWNER = "owner@example.com";

const PRODUCTS = [
  ["Weeknight Dinners", "Thirty dinners that take half an hour.", "19"],
  ["Sunday Baking", "Twelve loaves and cakes for a slow morning.", "24"],
  ["Meal Planner", "A week of meals and one grocery list.", "27"],
  ["Pantry Checklist", "What to keep in the cupboard, on one page.", "9"],
  // A long summary, so the card pasted into a website has to cut it at a whole line.
  ["Knife Skills", "Ten short lessons on cutting safely and fast: holding the knife, the claw grip, onions without tears, herbs, a whole chicken, and keeping the edge sharp at home.", "49"],
] as const;

async function main(): Promise<void> {
  const claimed = await claimHandle(OWNER, "localshop", "Harbor Kitchen Local", "Simple family meals. A store on this computer only, for checking pages.");
  if (!claimed.ok) throw new Error(`the address was refused: ${claimed.reason}`);
  await ensureStatsId(OWNER);
  await setStripeAccount(OWNER, "acct_1LocalHarbor0001", true);
  await setSubscription(OWNER, { active: true, tier: "creator", cycle: "month", subscriptionId: null, customerId: null, trialEnds: 0 });
  const ids: Record<string, string> = {};
  for (const [title, summary, price] of PRODUCTS) {
    const made = await addProduct(OWNER, title, summary, price, null);
    if (!made.ok) throw new Error(`${title} was refused: ${made.reason}`);
    ids[title] = made.product.id;
    const linked = await setProductLink(OWNER, made.product.id, `https://example.com/${made.product.id}`);
    if (!linked.ok) throw new Error(`${title} could not be given its link`);
  }
  // A picture on one product, so the card pasted into a creator's site is
  // drawn with one. Its file is not in this stand-in, so it shows as missing;
  // what is checked is the room the card gives it.
  const pictured = await setProductImage(OWNER, ids["Knife Skills"], { path: `images/${"a".repeat(24)}/${"b".repeat(32)}.jpg`, width: 1200, height: 800, alt: "A chef's knife on a board", bytes: 1, small: null });
  if (!pictured.ok) throw new Error("the picture was refused");
  // Two boxes at checkout on one product, each at a price of its own.
  for (const [slot, [title, cents, pitch]] of ([["Pantry Checklist", 500, "The list I shop with."], ["Sunday Baking", 1500, "For the weekend."]] as const).entries()) {
    const boxed = await setProductExtras(OWNER, ids["Weeknight Dinners"], { bump: { productId: ids[title], priceCents: cents, pitch }, slot });
    if (!boxed.ok) throw new Error(`the box for ${title} was refused: ${boxed.reason}`);
  }
  const sections = await setSections(OWNER, [
    { title: "Recipe books", at: ids["Weeknight Dinners"] },
    { title: "Planning", at: ids["Meal Planner"] },
    { title: "Courses", at: ids["Knife Skills"] },
  ]);
  if (!sections.ok) throw new Error("the sections were refused");
  const news = await setAnnouncement(OWNER, { text: "New: Knife Skills, ten short lessons", product: ids["Knife Skills"] });
  if (!news.ok) throw new Error("the line of news was refused");
  // Three verified reviews on one product, oldest first, for picking which show first.
  const seeded = await ensureStatsId(OWNER);
  const statsId = seeded?.statsId;
  if (!seeded || !statsId) throw new Error("the store has no statsId");
  const reviews: string[] = [];
  for (const [n, rating, text] of [[1, 5, "The rye loaf alone was worth it."], [2, 4, "Clear steps, though the cake took longer."], [3, 5, "My Sunday mornings smell like bread now."]] as const) {
    const saved = await saveReview(statsId, { productId: ids["Sunday Baking"], email: `reader${n}@example.com`, reference: `cs_test_seed${n}`, pi: `pi_seed${n}`, rating, text, name: `Reader ${n}` }, seeded, Date.now() - (10 - n) * 86_400_000);
    if (saved.state !== "created") throw new Error(`review ${n} was refused: ${saved.state}`);
    reviews.push(saved.review.id);
  }
  // The newest with a buyer's photo on it, as the review route puts one on.
  // Only its record: there is no Blob here, so the picture itself is not served.
  const photo = await setReviewPhoto(statsId, ids["Sunday Baking"], reviews[2], { path: `images/${"a".repeat(24)}/${"d".repeat(32)}.jpg`, width: 1200, height: 900 });
  if (typeof photo === "string") throw new Error(`the review's photo was refused: ${photo}`);
  // As the review route notes a store's first review, so its pages read the numbers.
  await setReviewed(OWNER);
  // And keeps the newest of them for "What buyers say" on the store page, as the route does after each.
  const reviewedStore = await storeForEmail(OWNER);
  if (reviewedStore) await refreshStoreQuotes(reviewedStore);
  // A page with three pictures, written as the studio would have kept it,
  // for the picture viewer. Their files are not in this stand-in.
  const shot = (n: number, alt: string, caption: string) => ({ path: `images/${"a".repeat(24)}/${String(n).padStart(32, "c")}.jpg`, width: 1200, height: 900, alt, caption });
  const withPictures = parsePage({
    blocks: [
      { id: "hero0003", kind: "hero", headline: "Bake on Sundays", sub: "", media: "none", video: null },
      { id: "pics0003", kind: "pictures", heading: "A look inside", items: [shot(1, "The rye loaf, sliced", "Week one: rye"), shot(2, "A lemon cake", "Week two: lemon cake"), shot(3, "Cinnamon rolls on a tray", "")] },
    ],
  });
  await writePage(statsId, ids["Sunday Baking"], withPictures, seeded);
  const marked = await setProductPage(OWNER, ids["Sunday Baking"], true);
  if (!marked.ok) throw new Error("the page could not be marked");
  // A long store, past one page of products, for its search.
  const LONG = "long@example.com";
  const long = await claimHandle(LONG, "longshop", "Long Pantry", "Thirty recipes, one at a time.");
  if (!long.ok) throw new Error(`the long store's address was refused: ${long.reason}`);
  await setStripeAccount(LONG, "acct_1LocalLong00001", true);
  await setSubscription(LONG, { active: true, tier: "creator", cycle: "month", subscriptionId: null, customerId: null, trialEnds: 0 });
  // Its buyers can pay with PayPal too, into the owner's own PayPal account (lib/paypal-sales.ts).
  await setPayPalSeller(LONG, "7KNGBPH2U58GQ");
  for (let n = 1; n <= 30; n++) {
    const kind = ["Soup", "Bread", "Salad"][n % 3];
    const made = await addProduct(LONG, `${kind} recipe ${n}`, n === 7 ? "With roasted tomatoes and crème fraîche." : `Recipe number ${n}.`, "3", null);
    if (!made.ok) throw new Error(`long store product ${n} was refused`);
    await setProductLink(LONG, made.product.id, `https://example.com/long/${n}`);
  }
  // A link with its own picture beside its words (lib/store-link.ts, LinkImage).
  const pod = await addStoreLink(LONG, "The pantry podcast", "https://example.com/podcast");
  if (!pod.ok) throw new Error("the long store's link was refused");
  const podPicture = await setLinkImage(LONG, pod.store.links[0].id, { path: `images/${"a".repeat(24)}/${"e".repeat(32)}.webp`, width: 320, height: 320, bytes: 1 });
  if (!podPicture.ok) throw new Error("the long store's link picture was refused");
  // A second store of the same owner's with nothing on it yet, for the first draft written with AI.
  const fresh = await createStore(OWNER, "freshshop", "Fresh Kitchen", "");
  if (!fresh.ok) throw new Error(`the fresh store was refused: ${fresh.reason}`);
  // On Pro, so its studio writes to a list (app/studio/email).
  await setSubscription(storeRef(fresh.store), { active: true, tier: "pro", cycle: "month", subscriptionId: null, customerId: null, trialEnds: 0 });
  await setMailSettings(storeRef(fresh.store), { fromName: "Fresh Kitchen", address: "1 Main St, Austin, TX 78701" });
  console.log(JSON.stringify({ ids, reviews, fresh: fresh.store.sid, session: await openSession(OWNER), statsId, longSession: await openSession(LONG) }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

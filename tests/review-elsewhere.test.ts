/**
 * The creator's public review page in the review-request email
 * (lib/review-elsewhere.ts; HighLevel gap matrix H19, added 18 October
 * 2026): only Google, Trustpilot and Facebook pages on https; kept with the
 * store; named in every request after the store's own link, the same for
 * every buyer and in every language; nothing offered for it.
 */
import { parseReviewElsewhere, REVIEW_SITES, MAX_REVIEW_URL } from "@/lib/review-elsewhere";
import { parseReviewAsk } from "@/lib/review-ask";
import { requestText } from "@/lib/review-requests";
import { GIVING_WORDS } from "@/lib/buyer-words/giving";
import { claimHandle, setReviewAsk, storeForEmail, type Store } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

part("Which pages");
is("a Google review link", parseReviewElsewhere("https://g.page/r/CdEf123/review"), { site: "google", url: "https://g.page/r/CdEf123/review" });
is("a Google Maps place", parseReviewElsewhere("https://www.google.com/maps/place/Bakery")?.site, "google");
is("but not any Google search", parseReviewElsewhere("https://www.google.com/search?q=bakery"), null);
is("a Trustpilot page", parseReviewElsewhere(" https://www.trustpilot.com/review/example.com ")?.url, "https://www.trustpilot.com/review/example.com");
is("a country Trustpilot", parseReviewElsewhere("https://uk.trustpilot.com/evaluate/example.com")?.site, "trustpilot");
is("a Facebook page", parseReviewElsewhere("https://www.facebook.com/examplebakery/reviews")?.site, "facebook");
is("the fragment is dropped", parseReviewElsewhere("https://g.page/r/CdEf123/review#top")?.url, "https://g.page/r/CdEf123/review");
for (const bad of [
  "http://g.page/r/CdEf123/review",
  "https://www.yelp.com/writeareview/biz/abc",
  "https://g.page.evil.example/r/x",
  "https://evil.example/?u=https://g.page/r/x",
  "https://user:pass@g.page/r/x",
  "https://g.page:8443/r/x",
  "javascript:alert(1)",
  "g.page/r/x",
  "https://g.page/r/ x",
  `https://g.page/r/${"a".repeat(MAX_REVIEW_URL)}`,
  "",
  42,
]) is(`refused: ${String(bad).slice(0, 50)}`, parseReviewElsewhere(bad), null);
is("Yelp is not one of the sites", Object.values(REVIEW_SITES).some((s) => s.hosts.some((h) => h.includes("yelp"))), false);

part("Kept with the store's setting");
is("kept with the days", parseReviewAsk({ days: 7, elsewhere: { site: "google", url: "https://g.page/r/CdEf123/review" } }), { days: 7, elsewhere: { site: "google", url: "https://g.page/r/CdEf123/review" } });
is("kept while the email is off, so switching on again keeps it", parseReviewAsk({ days: 0, elsewhere: { site: "google", url: "https://g.page/r/CdEf123/review" } }).elsewhere?.site, "google");
is("a stored page that is no longer allowed is dropped", parseReviewAsk({ days: 7, elsewhere: { site: "google", url: "https://www.yelp.com/biz/x" } }), { days: 7 });
is("a setting from before has none", parseReviewAsk({ days: 7 }), { days: 7 });

async function main() {
  redis.clear();
  const owner = "elsewhere-owner@example.com";
  await claimHandle(owner, "elsewhere", "Example Bakery", "");
  await setReviewAsk(owner, { days: 5, elsewhere: { site: "trustpilot", url: "https://www.trustpilot.com/review/example.com" } });
  const store = (await storeForEmail(owner)) as Store;
  is("read back from the store record", store.reviewAsk, { days: 5, elsewhere: { site: "trustpilot", url: "https://www.trustpilot.com/review/example.com" } });

  part("In the email, after the store's own link, for everybody");
  const own = "https://example.com/@elsewhere/review?ask=abc";
  const text = requestText(store, ["Sourdough course"], 1_760_000_000, own).body;
  is("names the site and the page", text.includes("on Trustpilot") && text.includes("https://www.trustpilot.com/review/example.com"), true);
  is("after the store's own review link", text.indexOf(own) < text.indexOf("https://www.trustpilot.com/review/example.com"), true);
  is("says it is the same for everyone and up to them", text.includes("the same for everyone asked, and entirely up to you"), true);
  is("offers nothing", /\b(discount|coupon|free|gift|reward|code)\b/i.test(text), false);
  is("the email has no input that could change it by rating: the same for two orders", requestText(store, ["Bread kit"], 1_760_100_000, own).body.split("\n").slice(4, 7), text.split("\n").slice(4, 7));
  const none = requestText({ ...store, reviewAsk: { days: 5 } }, ["Sourdough course"], 1_760_000_000, own).body;
  is("without a page the email is as before", none.includes("trustpilot") || none.includes("Trustpilot"), false);
  const forged = requestText({ ...store, reviewAsk: { days: 5, elsewhere: { site: "google", url: "https://evil.example/x" } } } as Store, ["Sourdough course"], 1_760_000_000, own).body;
  is("a stored address is read again and refused if it is not a review page", forged.includes("evil.example"), false);
  for (const language of Object.keys(GIVING_WORDS) as (keyof typeof GIVING_WORDS)[]) {
    const body = requestText({ ...store, language }, ["Sourdough course"], 1_760_000_000, own).body;
    is(`in ${language}: the site's name and the page`, body.includes("Trustpilot") && body.includes("https://www.trustpilot.com/review/example.com"), true);
  }
  done();
}
main().catch((error) => { console.error(error); process.exit(1); });

/**
 * The picture shared with a link to any page of the site that has none of
 * its own. Each page's own title and description go with it: the root
 * layout names only the picture and the site, never the home page's words.
 */
import { feeWords } from "@/lib/fee-words";
export const SITE_OG_IMAGE = {
  url: "/og.png?v=5",
  width: 1200,
  height: 630,
  alt: "Marktmorgen: your store, your Stripe, your money. A paid Stripe checkout and a delivered file, " + feeWords().ogAlt + ".",
};

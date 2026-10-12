/**
 * Every sentence on the site about what Marktmorgen takes from a sale, in
 * one place, in two versions: the one true today, while the plans are a
 * subscription and nothing more, and the one true the day the share of each
 * sale is switched on (lib/plan.ts COMMISSION_LIVE).
 *
 * They live here so that the switch changes every one of them at once. A
 * page that wrote "0% of your sales" in its own words would go on saying it
 * after the switch, which is a price advertised that the checkout does not
 * charge — the thing this whole site is built not to do. So no other file
 * may say it (tests/fee-words.test.ts reads them all), and the version for
 * after the switch is held to never saying it either.
 *
 * Nothing here may read an environment variable or a secret: client pages
 * import it, as they import lib/plan.ts.
 */
import { COMMISSION_BPS, COMMISSION_LIVE, PLAN_PRICES, PRICES_WITH_COMMISSION, PRICES_WITHOUT_COMMISSION, type Tier } from "@/lib/plan";

/** "6.25%", "2.75%". */
function percent(bps: number): string {
  return `${(bps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}

/** "$22", "$1,490". */
function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** What a plan takes from each sale, in words: "6.25% of each sale", or "nothing from a sale". */
export function shareOfSaleWords(tier: Tier, live = COMMISSION_LIVE): string {
  const bps = live ? COMMISSION_BPS[tier] : 0;
  return bps > 0 ? `${percent(bps)} of each sale` : "nothing from a sale";
}

export type FeeWords = ReturnType<typeof feeWords>;

/** Every sentence about what is taken from a sale. */
export function feeWords(live = COMMISSION_LIVE) {
  const store = percent(COMMISSION_BPS.creator);
  const studio = percent(COMMISSION_BPS.pro);
  const p = live ? PRICES_WITH_COMMISSION : PRICES_WITHOUT_COMMISSION;
  // The $27 file on Gumroad and here (lib/site-pages.ts), worked out rather than typed.
  const card = 1.08;
  const ours = live ? Math.floor(2700 * COMMISSION_BPS.creator / 10_000) / 100 : 0;
  const kept = (27 - card - ours).toFixed(2);
  const perSale = 3.2 - ours;
  const evenAt = Math.round(p.creator.month / 100 / perSale);
  const atHundred = p.creator.month / 100 + ours * 100;

  if (!live) {
    return {
      /** A chip or a line in a list. */
      short: "0% of your sales",
      /** One sentence: what Marktmorgen takes. */
      takes: "Marktmorgen takes 0% of your sales.",
      /** The same, about a creator, for a search engine. */
      takesOfCreator: "Marktmorgen takes 0% of the sale.",
      /** The pricing table's line about fees. */
      feesRow: "0% of your sales. Stripe charges its own processing fee, on your own account.",
      /** Under the buy box in the product editor. */
      editor: "Marktmorgen takes no cut of the sale.",
      /** The 404 page's card about pricing. */
      pricingCard: "Two plans to start on, and 0% of your sales on every plan.",
      /** The mission page's promise about charging. */
      missionPromise: "One subscription, written in one line. No cut of your sales, no fee that appears at the last screen, no feature listed on the site that does not exist in the product.",
      /** The mission page, on how we make money. */
      missionMoney: "We take 0% of your sales and make money one way only — a flat subscription, the same price whether you sell three files or three thousand.",
      /** The Terms, on what we charge. */
      termsCharge: "Marktmorgen takes 0% of a creator's sales; what we charge a creator is a subscription for the store itself.",
      /** The Terms, on the money. */
      termsMoney: "We never hold, route, or take a cut of your sales revenue.",
      /** The studio's "What you pay us". */
      studioPay: "A plan, and 0% of what you sell, because what you sell never passes through us. The subscription is the same whether you sell three files or three thousand.",
      /** The answer to "what does Marktmorgen take from a sale?". */
      fromASale: "Nothing. 0% of your sales, with no asterisk. Our only income is the subscription.",
      /** The answer to "what does it take from a renewal?". */
      fromARenewal: "Nothing. 0% of every payment, the first and every one after it. Stripe charges its own card fee on your account.",
      /** The answer to "what does it take from an offer after checkout?". */
      fromAnOffer: "No. 0%, as on every other sale. Stripe charges its own card fee on your account.",
      /** The end of a sentence about memberships: "...and" + this. */
      renewals: "we take 0% of the renewals too.",
      /** The answer to "does it take a cut of affiliate sales?". */
      fromAffiliateSale: "No. 0% of every sale, as on any other. The full amount lands in your Stripe account, and the affiliate's share is yours to pay.",
      /** The answer to "does it take a cut of Klarna or other methods?". */
      fromAMethod: "No. 0%, as on every sale. Stripe charges its own fee for each method on your account, published on its pricing page.",
      /** The card about it on the page about payments. */
      cardTitle: "0% of your sales",
      cardBody: "Our only income is your plan. Stripe charges its own card fee on your account, line by line.",
      /** Who holds the money, in one answer. */
      whoHolds: "You do, in your own Stripe account. We take 0% of your sales and charge only a subscription, paid monthly or yearly.",
      whoHoldsLong: "You do. Payments go to your own Stripe account through direct charges, so payouts follow your Stripe settings and we never sit between you and your buyer's money. We charge a monthly subscription and take 0% of your sales.",
      /** "...a buyer can pay for it on your account, with nothing taken on top." */
      onTop: "with nothing taken on top",
      /** The invite page. */
      inviteLead: "and we take 0% of your sales, on every plan.",
      inviteMeta: "with 0% of your sales taken",
      inviteCardTitle: "0% of your sales",
      inviteCardText: "Only Stripe's card fee, paid to Stripe.",
      /** The blog's closing card. */
      blogCta: "Your buyer pays into your own Stripe account, and we take 0% of the sale.",
      /** The share card for social sites. */
      ogAlt: "with 0% of the sale taken",
      /** A plan's line on the invoice and at Stripe. */
      storeProduct: "One store, 0% of your sales.",
      /** The topic pages' closing line about the smallest plan. */
      planLine: (price: string) => `${price} a month and 0% of your sales`,
      /** PayPal, on the comparison with Stan. */
      paypal: "Yes, on every plan. The buyer pays into your own PayPal account and we take nothing",
      /** The comparison with Stan: where the two charge alike. */
      sameAsStan: { title: "Where we are the same", body: `0% of each sale, the same ${dollars(p.creator.month)} and ${dollars(p.pro.month)} a month, or ${dollars(p.creator.year)} and ${dollars(p.pro.year)} a year, and a 14-day free trial on both.` },
      /** The $27 file, on Gumroad and here. */
      gumroad: {
        ours: `We take nothing. Stripe charges you its own published rate on your own account — about $${card.toFixed(2)} on $27 — so you keep $${kept}, and you pay us a fixed monthly price.`,
        evenOut: `The difference is $3.20 a sale, which is exactly Gumroad's cut, because the card fee is paid either way. At ${dollars(p.creator.month)} a month the two cost you the same at about ${evenAt === 9 ? "nine" : evenAt} sales of $27. Below that, Gumroad is cheaper for you. Above it, the gap grows every month and never stops.`,
        hundred: `Gumroad's cut is $320 that month. Ours is ${dollars(p.creator.month)}, whether you sell a hundred files or a thousand.`,
      },
      /** The $27 file, on Beacons and here. */
      beacons: {
        ours: `Our cut is 0%, Stripe takes about $${card.toFixed(2)}, so you keep $${kept} — and you pay ${dollars(p.creator.month)} that month.`,
        evenOut: `The 9% costs $2.43 a sale, so their free plan and our ${dollars(p.creator.month)} cost you the same at about 12 sales of $27 a month. At a hundred sales, their 9% is $243 that month and ours is ${dollars(p.creator.month)}. Against their $30 plan there is no money in it at all: one dollar.`,
      },
      /** The help center's answer to "what will it cost?". */
      costLine: `One subscription — ${dollars(p.creator.month)} a month, or ${dollars(p.pro.month)} a month on Pro, less if you pay yearly — and 0% of your sales. The card fee your payment processor charges is paid to them, on your own account, and we never take a cut on top of it.`,
      /** What you pay Marktmorgen, in one answer. */
      whatYouPay: `Your plan — ${dollars(p.creator.month)} a month, or ${dollars(p.pro.month)} on Pro — and nothing from your sales. The first 14 days are free, and you cancel in two clicks from your studio.`,
      /** The post comparing us with Stan. */
      blogMoney: "The money. On Marktmorgen, the buyer pays into your own Stripe account. We never hold your balance and we take 0% of your sales — not 0% with an asterisk that points at a cut somewhere else. What we charge is the subscription, and that is the whole of what we charge.",
      blogStan: "Stan also advertises 0% transaction fees on their home page, and charges a subscription. On that point we are the same, and we would rather say so than pretend otherwise. Where we differ is whose payment account the sale lands in, which decides who controls payouts, receipts and refunds.",
    };
  }

  const scaleAt = dollars(p.scale.month);
  return {
    short: `A share of each sale: ${store}, ${studio} or none`,
    takes: `Marktmorgen takes the share of each sale your plan sets: ${store}, ${studio}, or none on Scale.`,
    takesOfCreator: `Marktmorgen takes the share of each sale the creator's plan sets: ${store}, ${studio}, or none.`,
    feesRow: `${store} of each sale on Store, ${studio} on Studio, none on Scale, taken by Stripe from the sale itself. Stripe charges its own processing fee, on your own account.`,
    editor: `Your plan's share of the sale, ${store} on Store, is taken from it by Stripe.`,
    pricingCard: `Three plans, each a monthly price and a share of each sale: ${store}, ${studio}, or none on Scale.`,
    missionPromise: "One subscription and one share of each sale, both written in one line. No fee that appears at the last screen, no feature listed on the site that does not exist in the product.",
    missionMoney: `We make money two ways, both on the pricing page: a subscription, and a share of each sale that gets smaller as you sell more — ${store} on Store, ${studio} on Studio, and none on Scale.`,
    termsCharge: `What we charge a creator is a subscription for the store and the share of each sale their plan sets (${store} on Store, ${studio} on Studio, none on Scale), which Stripe deducts from the sale as an application fee. No share is taken on a sale made in the free trial, and the share of a sale that is refunded, or lost to a dispute, is given back.`,
    termsMoney: "We never hold or route your sales revenue. The one thing taken from a sale is your plan's share, which Stripe deducts as an application fee and pays to us.",
    studioPay: `A plan, and its share of each sale: ${store} on Store, ${studio} on Studio, none on Scale. Stripe takes the share from the sale itself, so what you sell never passes through us, and a refund gives back its part.`,
    fromASale: `Your plan's share of each sale, after any discount and before tax and shipping: ${store} on Store, ${studio} on Studio, none on Scale. Nothing on a sale made in your free trial, and the share of a refunded sale comes back to you.`,
    fromARenewal: `Your plan's share of each payment, as on any sale: ${store}, ${studio}, or none on Scale. Stripe charges its own card fee on your account.`,
    fromAnOffer: `Your plan's share, as on every other sale: ${store}, ${studio}, or none on Scale. Stripe charges its own card fee on your account.`,
    renewals: "your plan's share is taken from each renewal as from any sale.",
    fromAffiliateSale: "Only your plan's share, as on any other sale. The rest lands in your Stripe account, and the affiliate's share is yours to pay.",
    fromAMethod: `Your plan's share of the sale, the same as for a card. Stripe charges its own fee for each method on your account, published on its pricing page.`,
    cardTitle: "One share, set by your plan",
    cardBody: `${store}, ${studio} or none of each sale, taken by Stripe from the sale. Stripe charges its own card fee on your account, line by line.`,
    whoHolds: `You do, in your own Stripe account. We charge a subscription, monthly or yearly, and the share of each sale your plan sets, which Stripe takes from the sale.`,
    whoHoldsLong: `You do. Payments go to your own Stripe account through direct charges, so payouts follow your Stripe settings and we never sit between you and your buyer's money. We charge a subscription and the share of each sale your plan sets: ${store}, ${studio}, or none on Scale.`,
    onTop: "with only your plan's share taken from it",
    inviteLead: `and your plan's share of each sale is the only thing we take from it: ${store}, ${studio}, or none on Scale.`,
    inviteMeta: "with your plan's share of each sale and nothing more",
    inviteCardTitle: `${store} of each sale on Store`,
    inviteCardText: `Less as you sell more: ${studio} on Studio, none on Scale. Stripe's card fee is paid to Stripe.`,
    blogCta: `Your buyer pays into your own Stripe account, and your plan's share of the sale, ${store} on the first plan, is taken from it by Stripe.`,
    ogAlt: "with the plan's share of the sale taken",
    storeProduct: `One store, ${store} of each sale.`,
    planLine: (price: string) => `${price} a month and ${store} of each sale`,
    paypal: "Yes, on every plan. The buyer pays into your own PayPal account",
    sameAsStan: { title: "Where we charge differently", body: `Stan charges $29 or $99 a month and nothing from a sale. We charge ${dollars(p.creator.month)} a month and ${store} of each sale, ${dollars(p.pro.month)} and ${studio}, or ${scaleAt} and nothing, so a store that sells little pays less here and one that sells a lot moves to a plan with a smaller share. Both have a 14-day free trial.` },
    gumroad: {
      ours: `Our share is ${store}, $${ours.toFixed(2)}, and Stripe charges you its own published rate on your own account — about $${card.toFixed(2)} on $27 — so you keep $${kept}, and you pay us a monthly price.`,
      evenOut: `The difference is $${perSale.toFixed(2)} a sale, because the card fee is paid either way. At ${dollars(p.creator.month)} a month the two cost you the same at about ${evenAt} sales of $27. Below that, Gumroad is cheaper for you. Above it, the gap grows every month.`,
      hundred: `Gumroad's cut is $320 that month. Ours is ${dollars(Math.round(atHundred * 100))}: the plan and our share of a hundred sales.`,
    },
    beacons: {
      ours: `Our share is ${store}, $${ours.toFixed(2)}, Stripe takes about $${card.toFixed(2)}, so you keep $${kept} — and you pay ${dollars(p.creator.month)} that month.`,
      evenOut: `The 9% costs $2.43 a sale and our share $${ours.toFixed(2)}, so their free plan and our ${dollars(p.creator.month)} cost you the same at about ${Math.round(p.creator.month / 100 / (2.43 - ours))} sales of $27 a month. At a hundred sales, their 9% is $243 that month and ours is ${dollars(Math.round(atHundred * 100))}. Against their $30 plan, which takes nothing from a sale, ours costs less below about ${Math.round((30 - p.creator.month / 100) / ours)} sales of $27 a month and more above it.`,
    },
    costLine: `One subscription and a share of each sale — ${dollars(p.creator.month)} a month and ${store} of each sale, ${dollars(p.pro.month)} and ${studio} on Studio, or ${dollars(p.scale.month)} and nothing on Scale, less if you pay yearly. The card fee your payment processor charges is paid to them, on your own account.`,
    whatYouPay: `Your plan — ${dollars(p.creator.month)} a month and ${store} of each sale, ${dollars(p.pro.month)} and ${studio} on Studio, or ${dollars(p.scale.month)} and nothing on Scale. The first 14 days are free, with no share taken, and you cancel in two clicks from your studio.`,
    blogMoney: `The money. On Marktmorgen, the buyer pays into your own Stripe account. We never hold your balance. What we charge is the subscription and the share of each sale your plan sets — ${store} on Store, ${studio} on Studio, none on Scale — and that is the whole of what we charge.`,
    blogStan: "Stan advertises 0% transaction fees on their home page, and charges a subscription. We charge a smaller subscription and a share of each sale, so the two cost a creator differently depending on how much they sell; the pricing page shows both. Where we differ most is whose payment account the sale lands in, which decides who controls payouts, receipts and refunds.",
  };
}

/** What each plan is called by its price where a page compares plans: "$29", "$99", "$249" today. */
export const PLAN_AT: Record<Tier, string> = {
  creator: dollars(PLAN_PRICES.creator.month),
  pro: dollars(PLAN_PRICES.pro.month),
  scale: dollars(PLAN_PRICES.scale.month),
};

/** The same, with what it takes from a sale when it takes something: "$22 + 6.25% of each sale". */
export function planPriceWords(tier: Tier, cycle: "month" | "year" = "month", live = COMMISSION_LIVE): string {
  const p = live ? PRICES_WITH_COMMISSION : PRICES_WITHOUT_COMMISSION;
  const bps = live ? COMMISSION_BPS[tier] : 0;
  return `${dollars(p[tier][cycle])} a ${cycle}${bps > 0 ? ` + ${percent(bps)} of each sale` : ""}`;
}

/** A comparison table's row about our monthly price. */
export function monthlyRow(live = COMMISSION_LIVE): string {
  if (!live) return `${dollars(PRICES_WITHOUT_COMMISSION.creator.month)} and ${dollars(PRICES_WITHOUT_COMMISSION.pro.month)}, free for the first 14 days`;
  const p = PRICES_WITH_COMMISSION;
  return `${dollars(p.creator.month)} + ${percent(COMMISSION_BPS.creator)} of each sale, ${dollars(p.pro.month)} + ${percent(COMMISSION_BPS.pro)}, or ${dollars(p.scale.month)}, free for the first 14 days`;
}

/** A comparison table's row about our yearly price. */
export function yearlyRow(live = COMMISSION_LIVE): string {
  if (!live) return `${dollars(PRICES_WITHOUT_COMMISSION.creator.year)} and ${dollars(PRICES_WITHOUT_COMMISSION.pro.year)} a year`;
  const p = PRICES_WITH_COMMISSION;
  return `${dollars(p.creator.year)}, ${dollars(p.pro.year)} or ${dollars(p.scale.year)} a year, with the same share of each sale`;
}

/** What paying a plan yearly saves over twelve months of it: "$48". */
export function yearSavingWords(tier: Tier): string {
  return dollars(PLAN_PRICES[tier].month * 12 - PLAN_PRICES[tier].year);
}

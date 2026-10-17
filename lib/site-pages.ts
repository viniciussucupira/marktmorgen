// Content for every page behind a menu item. One entry per page, so that
// each menu item opens something different and real.
import { AI_PLANS_WORDS } from "@/lib/ai-rules";
import { isDomainsConfigured } from "@/lib/domains";
import { PRO_MONTHLY_EMAILS } from "@/lib/plan";
import { paypalSalesConfigured } from "@/lib/paypal-sales";
import type { IconName } from "@/components/icons";
import type { VisualKey } from "@/components/feature-visuals";
import { CREATOR_PAGES, FEATURE_PAGES } from "@/lib/feature-pages";
import { INVITE_PROGRAM_OPEN, INVITE_PAUSE_NOTICE, INVITE_BONUS_CENTS, INVITE_HOLD_DAYS, INVITE_SHARE_PERCENT } from "@/lib/creator-invite-rules";
import { PLAN_AT, feeWords, monthlyRow, planPriceWords, yearlyRow } from "@/lib/fee-words";

const INVITE_BONUS = `$${INVITE_BONUS_CENTS / 100}`;

/** Whether stores can be put on their own domain on this deployment. */
const DOMAINS = isDomainsConfigured();
/*
  Whether a buyer can pay with PayPal here.

  Read rather than written down, for the same reason DOMAINS is: PayPal hands
  a platform its partner credentials only after approving it, so this is
  false until that day and true from it, and the comparison rows below have
  to say whichever is true on the day they are read. They said "no PayPal"
  flatly for months after lib/paypal-sales.ts was finished, which is the same
  fault as claiming a feature that does not exist, pointing the other way.
*/
const PAYPAL = paypalSalesConfigured();

export type Block =
  | { kind: "lead"; text: string }
  | { kind: "cards"; title: string; items: { emoji: string; title: string; body: string; tint: string }[] }
  | { kind: "steps"; title: string; items: { title: string; body: string }[] }
  | { kind: "facts"; title: string; items: { value: string; label: string; tone: string }[] }
  | { kind: "table"; title: string; note?: string; head: [string, string, string]; rows: [string, string, string][] }
  | { kind: "quote"; text: string; source: string }
  | { kind: "note"; title: string; body: string }
  | { kind: "storecard"; title: string; creator: string; tagline: string; photo: string; alt: string; items: { label: string; detail: string; price: string }[] }
  /** Three numbered steps side by side: how the thing works, start to end. */
  | { kind: "how"; title: string; items: { title: string; body: string }[] }
  /** What it does, one card each, optionally leading to its own page. */
  | { kind: "features"; title: string; intro?: string; items: { icon: IconName; title: string; body: string; href?: string }[] }
  /** Who it is for, in their own situation. */
  | { kind: "uses"; title: string; items: { icon: IconName; who: string; what: string }[] }
  /** What it does not do, said before anyone has to find out. */
  | { kind: "limits"; title: string; intro?: string; items: string[] }
  | { kind: "faq"; title: string; items: { q: string; a: string }[] }
  /** From the first free thing to the biggest sale, for one kind of creator. */
  | { kind: "ladder"; title: string; intro?: string; items: { step: string; title: string; price: string; body: string; href: string; icon: IconName }[] };

export type TopicPage = {
  slug: string;
  section: "platform" | "for" | "proof";
  eyebrow: string;
  title: string;
  highlight: string;
  intro: string;
  badge: { label: string; tone: "live" | "building" | "proof" };
  accent: string;
  blocks: Block[];
  /** The drawing of the real screen shown beside the heading. */
  visual?: VisualKey;
  /** The plan it comes with: on $29 (and so on Studio too), or on Studio only. */
  plan?: "creator" | "pro";
  /** Where a feature sits in the menu and on the features page. */
  group?: "sell" | "paid" | "deliver" | "grow";
  /** How the menu and the features page name it. */
  menu?: { label: string; description: string; icon: IconName };
  /** Other feature pages worth reading next. */
  related?: string[];
  /**
   * A photograph of the work this page is about, shown behind the example
   * store in the heading. Licensed stock, and the page says so beside it:
   * nobody in these pictures is a customer of ours.
   */
  photo?: { id: string; alt: string };
};

const PROOF = { label: "Checked and dated", tone: "proof" as const };

export const PAGES: TopicPage[] = [
  ...FEATURE_PAGES,
  ...CREATOR_PAGES,

  /* ------------------------------------------------ proof ------------- */
  {
    slug: "compare",
    section: "proof",
    eyebrow: "Proof",
    title: "Side by side",
    highlight: "with Stan",
    intro:
      "Checked on Stan's own pricing, terms and help center in September 2026. When it changes, this page changes.",
    badge: PROOF,
    accent: "from-violet-brand to-pink-brand",
    blocks: [
      {
        kind: "features",
        title: "The short version",
        intro: "Four lines before the long table. Every one of them is backed by a row below or on the feature-by-feature page, with its source.",
        items: [
          { icon: "bank", title: "Where we are ahead: the money", body: "Sales land in a full Stripe account in your own name, with its own login and payout schedule. Stan's creators get an account Stan manages, and cash out inside Stan." },
          { icon: "tag", title: `Where we are ahead: the ${PLAN_AT.creator} plan`, body: "Several prices on one product, discount codes in percent or dollars, sales and landing pages, offers before and after paying, payment plans, ad pixels and an affiliate program, most of which Stan keeps for its $99 plan. And pay what you want, free trials on memberships, reviews only buyers can write, 15 currencies, a team with roles, bundles that hand over each product as itself, and past buyers brought over from a file, none of which Stan's help center describes. Since September 30: one search box across the whole community, a public API, an offer made once to a member who presses Cancel, and points, levels and a leaderboard in the community, with a course handed over at a level, none of which Stan's help center describes either." },
          { icon: "scale", ...feeWords().sameAsStan },
          { icon: "info", title: "Where Stan is ahead", body: `${PAYPAL ? "" : "PayPal at checkout, "}affiliates paid with no PayPal account of your own, automatic Instagram replies, Zoom links made for each booking and webinar, an iPhone app, and as many products as you like where we stop at 2,000. If you need those today, Stan is the better tool today.` },
        ],
      },
      {
        kind: "table",
        title: "The part that decides",
        note: "Sources: Stan's help center articles 'Creator vs. Creator Pro', 'How to Connect Stan with Stripe', 'How to Cash Out Inside Stan', 'Experiment: How to Connect an Existing Stripe Account' and 'How to Subscribe on the Stan Mobile App', read on September 18, 2026; 'Can I Create More Than One Stan Store?' and 'How to Change Your Stan Username or Email', read on September 19, 2026. The rows on products, prices, trials and the customer area re-checked on Stan's help center on September 26, 2026; 'Can I Create More Than One Stan Store?' re-read, and 'Can I Grant Administrative Access to a Team Member?' and 'How Can I Add My Customer Reviews?' read on September 27, 2026, and the rows on ways to pay and currency re-checked the same day. The rows on live events, bundles and moving from another platform from 'How to Add an Integrated Webinar to Community', 'Webinar Product', the Digital Downloads category, 'How to Import Your Existing Email List into Stan' and 'How Do I Manually Give Access or Add a Customer to a Product?', read on September 27, 2026. Stan's 14-day free trial from their article 'Stan Store Pricing 2026', read on September 28, 2026, the same day every other row was re-checked on their help center and the rows on the line about you and the customer area were corrected from 'How to Add or Update Your Profile Bio' and 'Common Feature Requests On Our Radar'. The row on inviting other creators from 'What is Stan's Referral Program?', read on September 30, 2026.",
        head: ["", "Stan", "Marktmorgen"],
        rows: [
          ["Monthly price", "$29 and $99, free for the first 14 days", monthlyRow()],
          ["Paid yearly", "$300 and $948 a year", yearlyRow()],
          ["Cut of each sale", "0% platform fee", feeWords().short],
          ["Logging in", "An account with a password. Their own signup asks for name, email and password", "A link sent to your email, or a passkey if you add one. No password to invent, and none kept here to be stolen"],
          ["Ways to be paid", "Stripe or PayPal, for every creator", PAYPAL ? "Stripe or PayPal, both paying straight into your own account, with the ways to pay you switch on in Stripe: cards, Apple Pay, Google Pay, Link, Klarna, Afterpay, Affirm, iDEAL and more" : "Stripe, with the ways to pay you switch on in it: cards, Apple Pay, Google Pay, Link, Klarna, Afterpay, Affirm, iDEAL and more. No PayPal yet: it is built and waits on PayPal approving us as a platform"],
          ["Currency", "One per store, chosen from ten", "Any one of 15 per store, from US dollars and euros to yen and Mexican pesos"],
          ["Whose Stripe account", "One they manage. Their own help center: you cannot connect an existing Stripe account", "A full Stripe account in your own name, opened from your studio, with its own Stripe login. It stays yours"],
          ["Getting paid", "Cash out inside Stan, $10 minimum, whole balance only", "Your own Stripe payout schedule"],
          ["Where you see your money", "Their Income tab. A Stripe Custom account has no Stripe login", "stripe.com, like any other business of yours"],
          ["Phone app", "iPhone and iPad, for running your store. Not on Android", "No app-store app — they are ahead here. The studio installs from the browser and sends notifications of sales and bookings, on Android and on iPhone with iOS 16.4 or later. Each store installs to the home screen on both, as an app with its own name and icon"],
          ["Products on one store", "As many as you like", "Up to 2,000, and up to 100 links — they are ahead here"],
          ["Several prices for one product", "Listed as a top feature request, not available", "Up to 50, compared side by side, each with its own file or link"],
          ["Pay what you want", "Not in their help center", `Yes: a minimum of at least $1 and a suggested price, on the ${PLAN_AT.creator} plan`],
          ["Free trial on a membership", "Not in their help center", "1 to 90 days, with the card taken at the start and nothing charged until it ends"],
          ["A line about you on the page", "A short profile bio, and no separate About Me page", "On every store, under your name"],
          ["Your own domain", "Not available", DOMAINS ? `Yes, on the ${PLAN_AT.pro} Studio plan, with the certificate handled for you` : "Not available"],
          ["Changing your store address", "Any time. Their help center says old links are forwarded on a best-effort basis, cannot be guaranteed, and advises resending them", "Any time. Old addresses stay with the store and keep working until you choose to let one go. A store holds up to 10 addresses at once, its current one included"],
          ["Customer area for all purchases", "A login for courses only. Other purchases show in a Purchases tab inside the creator's community, if there is one","A buyer's purchases from a store, up to the 40 most recent, listed on one page the buyer reaches with an emailed link: downloads, links, courses and booked calls. No account and no password"],
          ["Several stores in one account", "Not in one account. Several accounts, each with its own email and its own subscription", "Up to five in one account, each with its own address, Stripe account and plan"],
          ["Inviting other creators", "20% of each payment they make, in cash through Stripe or PayPal, for as long as they stay subscribed, 3 to 5 days after each renewal once their 14-day trial ends, and only while you pay Stan too. No bonus for the creator you invite in their help center", INVITE_PROGRAM_OPEN ? `${INVITE_SHARE_PERCENT}% of each payment they make, for as long as they pay, as credit on your own plan \u2014 not cash \u2014 added ${INVITE_HOLD_DAYS} days after each payment. The creator you invite gets ${INVITE_BONUS} of credit after their first payment` : INVITE_PAUSE_NOTICE],
          ["A team with roles", "Not for the store: their help center says the only way to give someone admin access is to share your login. Admins and moderators exist inside the community only", "Up to five people per store, as Admin, Editor or Support, each signing in with their own email, checked on our server, with an activity log"],
          ["Reviews", "Added by the creator. Their help center says customers cannot write one", "Written only by buyers whose payment your Stripe account confirms. You can answer or hide one, never edit or delete it; hidden reviews still count in the average, and a full refund takes the stars out"],
          ["Live events in the community", "Webinars added to the community as a product members sign up for, with Zoom or Google Meet links made automatically", "Live events members RSVP to, with a cap of 1 to 5,000, reminders, a private Jitsi Meet room shown on the page, your own link or a Google Meet made on your connected Google Calendar, and replays. No Zoom link made for you yet — they are ahead there"],
          ["Bundles", "Their Digital Downloads help section lists bundles among the files you can sell as one download. No product type that hands over other products in their help center", "2 to 20 of your one-off products at one price, each delivered as itself: its download or link, its course and its license key. Not with memberships or calls"],
          ["Moving from another platform", "A list of up to 5,000 imported contacts per store in all, each sent an email to opt in again. Buyers given access one at a time", "Up to 50,000 contacts a file, only people you confirm agreed; up to 500 products a file, as drafts; and up to 20,000 past buyers a file, who keep what they bought, with one email to them if you choose"],
        ],
      },
      {
        kind: "quote",
        text: "In order to use Stripe with Stan, you will be prompted to create a new Custom Stripe account that is managed by Stan. You will not be able to connect an existing Stripe account.",
        source: "Stan help center, 'How to Connect Stan with Stripe', read September 18, 2026",
      },
      {
        kind: "note",
        title: "One correction to that, from their own help center",
        body: "Stan is running an experiment that does let some creators connect a Stripe account they already own. Their article says it is open only to a share of new creators who signed up after May 1, 2025 and go through onboarding on a phone browser, and it warns that if you use it, Stan's own Income tab may not show your earnings correctly. So it exists, it is not the normal path, and it costs you part of their product.",
      },
      {
        kind: "note",
        title: "Where Stan is ahead, and we say so",
        body: `Stan has things we do not: ${PAYPAL ? "" : "PayPal at checkout, "}affiliates paid with no PayPal account of your own, automatic Instagram replies, Zoom links made for each booking and webinar, an app for iPhone and iPad, stores with no limit on products, and a support team with years of experience behind it. We now have a community with live events, an affiliate program paid from your own PayPal in one press, sales and landing pages, offers after paying, Google Meet links made on your own Google Calendar and a private video room for each booking and event, but none of those. If you depend on them today, Stan is the better tool today.`,
      },
    ],
  },
  {
    slug: "gumroad",
    section: "proof",
    eyebrow: "Proof",
    title: "Side by side",
    highlight: "with Gumroad",
    intro:
      "Fees checked against Gumroad’s pricing page and official help text on October 16, 2026. Other operational details below were checked in September 2026 and may change; confirm eligibility and terms before switching.",
    badge: PROOF,
    accent: "from-mint-brand to-violet-brand",
    blocks: [
      {
        kind: "lead",
        text: "Gumroad is one of the oldest and simplest ways to sell a file on the internet, and for a first sale it is hard to beat: nothing to pay until you sell something. The difference between the two of us is not the store page. It is what happens to the money.",
      },
      {
        kind: "facts",
        title: "Gumroad's own numbers",
        items: [
          { value: "10% + $0.50", label: "Standard direct-sale fee, before separate processing", tone: "bg-pink-brand/10 text-pink-brand" },
          { value: "30%", label: "Discover fee, including payment processing", tone: "bg-amber-brand/15 text-amber-brand" },
          { value: "$100", label: "Minimum balance before they pay you", tone: "bg-violet-brand/10 text-violet-deep" },
          { value: "7 days", label: "A sale waits in their balance on weekly, monthly and quarterly payouts", tone: "bg-sky-brand/15 text-sky-brand" },
        ],
      },
      {
        kind: "table",
        title: "The part that decides",
        note: "Sources: Gumroad's pricing page and their help center articles 'Gumroad's fees', 'Getting paid by Gumroad', 'Connect your Stripe account to Gumroad' and 'Sales tax on Gumroad', read on September 28, 2026. Direct, Discover and high-volume fee conditions re-checked on October 16, 2026.",
        head: ["", "Gumroad", "Marktmorgen"],
        rows: [
          ["Cut of each sale", "10% + $0.50 direct; new direct sales become 5% + $0.50 after $20,000 in paid sales that calendar month. Discover: 30%. Custom account fees can differ", feeWords().short],
          ["Card fee on top of that", "Direct sales add card processing at 2.9% + $0.30, or PayPal fees. Discover’s 30% includes processing", "Stripe processing fees, plus the published plan share"],
          ["Monthly price", "None", monthlyRow()],
          ["Whose payment account", "Gumroad is the merchant of record. New connections to a seller’s own Stripe are restricted; check current country eligibility", "Your own Stripe, from the first sale"],
          ["When the money reaches you", "Into their balance, then paid out on the schedule you pick there, with a 7-day hold on weekly, monthly and quarterly payouts", "In your own Stripe balance at the moment of sale, then paid out on your Stripe schedule"],
          ["Minimum to be paid", "$100, higher in some countries", "Whatever your own Stripe is set to"],
          ["Instant payout", "United States only, 3% fee, after a first payout and 60 days of processing", "Not needed — the account is already yours"],
          ["Disputes", "They handle them for you", "Yours, in your own dashboard"],
          ["Who is the seller of record", "Gumroad. They are the merchant of record on every sale", "You are. The charge is on your account, in your name"],
          ["Sales tax, VAT and GST", "They collect and remit it worldwide, according to their own help center", "Worked out and collected by Stripe Tax on your own account, when you switch it on. Filing it is yours, because you are the seller"],
          ["A marketplace that sends buyers", "Discover, at 30% of the sale", "None"],
          ["Several prices for one product", "Versions and pay-what-you-want", "Price options and pay what you want, both working today"],
        ],
      },
      {
        kind: "quote",
        text: "We no longer support new user-connected Stripe accounts except for users from Brazil.",
        source: "Gumroad help center, 'Connect your Stripe account to Gumroad', read September 18, 2026",
      },
      {
        kind: "steps",
        title: "A $27 direct-sale example before the volume discount",
        items: [
          { title: "On Gumroad", body: "10% of $27 is $2.70, plus $0.50, so $3.20 goes to Gumroad. Their own fees page says that figure does not include credit card processing, so card processing at 2.9% + $0.30 — about $1.08 — comes out as well. You keep $22.72." },
          { title: "On Marktmorgen", body: feeWords().gumroad.ours },
          { title: "The honest break-even", body: feeWords().gumroad.evenOut },
          { title: "At a hundred sales", body: feeWords().gumroad.hundred },
        ],
      },
      {
        kind: "note",
        title: "Compare the work behind each payment",
        body: "Gumroad includes merchant-of-record administration for the indirect taxes it is responsible for. With Marktmorgen, you remain the seller and manage your own payment account and applicable registrations and filings. Compare those responsibilities as well as the subscription, sales share and payment fees. The example excludes refunds, currency conversion and other account-specific charges.",
      },
      {
        kind: "note",
        title: "Where Gumroad is ahead of us today",
        body: `A marketplace that can send you buyers;${DOMAINS ? "" : " your own domain;"} a Zapier app; and a mobile app. We have none of those. We now have fair prices by country (their purchasing power parity, worked out the same way), affiliates (paid from your own PayPal, not by us), license keys, PDF stamping and reviews from buyers, webhooks that Zapier can catch instead of an app of our own, and a public API, which on our side reads and changes nothing. Email to your list we have on our ${PLAN_AT.pro} Studio plan; Gumroad includes it at no extra charge. They have been doing this since 2011 and it shows.`,
      },
    ],
  },
  {
    slug: "beacons",
    section: "proof",
    eyebrow: "Proof",
    title: "Side by side",
    highlight: "with Beacons",
    intro:
      "Every number here was read on Beacons' own pricing page and help center in September 2026, and the page says where each one came from. When they change one, this page changes.",
    badge: PROOF,
    accent: "from-sky-brand to-violet-brand",
    blocks: [
      {
        kind: "lead",
        text: "Beacons is the closest competitor to us on the one thing we care most about: the money goes straight into the seller's own Stripe or PayPal account, at the moment of the sale. Their help center is explicit about it. So the argument between us is not custody. It is the 9%, and what it costs to make it stop.",
      },
      {
        kind: "facts",
        title: "Beacons' own numbers",
        items: [
          { value: "9%", label: "Their cut on the free plan and the $10 plan", tone: "bg-pink-brand/10 text-pink-brand" },
          { value: "$30", label: "The monthly plan where their cut becomes 0%", tone: "bg-violet-brand/10 text-violet-deep" },
          { value: "2.9% + $0.30", label: "Stripe's own fee, charged on top of theirs", tone: "bg-amber-brand/15 text-amber-brand" },
          { value: "$0", label: "Their free plan really is free to start", tone: "bg-mint-brand/15 text-mint-deep" },
        ],
      },
      {
        kind: "table",
        title: "The part that decides",
        note: "Sources: Beacons' pricing page and their help center articles 'Beacons Products Transaction Fees' and 'When will I receive my payout from Product/Store Sales?', read on September 18, 2026. Plan prices, the fee quoted below and the rows on order bumps, memberships and courses re-checked on their pricing page and help center on September 28, 2026.",
        head: ["", "Beacons", "Marktmorgen"],
        rows: [
          ["Cut of each sale", "9% on the free and $10 plans. 0% from the $30 plan up", feeWords().short],
          ["Monthly price", "$0, $10, $30 and $100", monthlyRow()],
          ["Whose payment account", "Your own Stripe or PayPal", "Your own Stripe"],
          ["Ways to be paid", "Stripe or PayPal", PAYPAL ? "Stripe or PayPal, both paying straight into your own account" : "Stripe, with the ways to pay you switch on in it. No PayPal yet: it is built and waits on PayPal approving us as a platform"],
          ["When the money reaches you", "At the moment of sale, into your own account", "At the moment of sale, into your own account"],
          ["Card fee", "Stripe's 2.9% + $0.30, on top of their 9%", "Stripe processing fees, plus the published plan share"],
          ["What you are buying", "A whole suite: link in bio, websites, media kit, email, an affiliate network, AI tools", "One store, built to sell: files, courses, memberships, calls, a community for your buyers, and a media kit for brands"],
          ["A free plan", "Yes, and you can sell on it", "None"],
          ["Order bumps and upsells", "Order bumps on every plan, the free one included", "Yes \u2014 up to three boxes the buyer checks at checkout, and one click after paying on the same card"],
          ["Memberships and courses", "Memberships from the $30 plan. Courses on every plan, but only one, with no video hosting, below the $30 plan", `Yes, both, on the ${PLAN_AT.creator} plan`],
        ],
      },
      {
        kind: "quote",
        text: "The 9% fee applies to users on the free plan or the $10/month Creator plan.",
        source: "Beacons help center, 'Beacons Products Transaction Fees', read September 18, 2026",
      },
      {
        kind: "steps",
        title: "The same $27 file, on both",
        items: [
          { title: "On their free or $10 plan", body: "9% of $27 is $2.43, and Stripe takes about $1.08 on top. You keep $23.49." },
          { title: "On their $30 plan", body: "Their cut is 0%, Stripe still takes about $1.08, so you keep $25.92 — and you pay $30 that month." },
          { title: "On Marktmorgen", body: feeWords().beacons.ours },
          { title: "The honest break-even", body: feeWords().beacons.evenOut },
        ],
      },
      {
        kind: "note",
        title: "Where Beacons is ahead of us, and it is not close",
        body: `For $30 they give you 0% and, with it, websites, a media kit that updates itself, email marketing, an affiliate network of 12,000 brands and a pile of AI tools. We give you a store page with courses, memberships, calls, a community, an affiliate program of your own, the checkout tools and a media kit whose numbers you type yourself, and on our ${PLAN_AT.pro} Studio plan email to your list, but none of the other extras. Compare the subscription and sales fee together; the cheaper option depends on your sales.`,
      },
      {
        kind: "note",
        title: "So when should you not use us?",
        body: "If you are selling a handful of files a month, take their free plan: 9% of almost nothing is cheaper than any monthly price, ours included. And if you want the whole suite in one login, buy their $30 plan. Come to us when what you want is a fast, focused store page that pays into your own account, and you would rather not run a suite to get it.",
      },
    ],
  },
  {
    slug: "speed",
    section: "proof",
    eyebrow: "Proof",
    title: "A slow store is",
    highlight: "a store people leave",
    intro:
      "Measured with Google PageSpeed Insights on a simulated phone, on October 5, 2026. You can run the same test yourself on any store, ours included.",
    badge: PROOF,
    accent: "from-sky-brand to-mint-brand",
    blocks: [
      {
        kind: "facts",
        title: "Performance score on mobile",
        items: [
          { value: "93–94", label: "Marktmorgen demo store, measured twice", tone: "bg-mint-brand text-ink" },
          { value: "58–59", label: "Two Stan stores, measured the same day", tone: "bg-ink text-white" },
          { value: "46", label: "A third Stan store, same test", tone: "bg-ink text-white" },
        ],
      },
      {
        kind: "steps",
        title: "How the test was run",
        items: [
          { title: "Same tool for everyone", body: "Google PageSpeed Insights, mobile, simulated slow 4G, Lighthouse 13.5.0." },
          { title: "Stan stores from Stan's own list", body: "Three public stores of creators Stan named in its \"25 in 25\" winners post: the first on the list and every sixth after it. Measured on the same day, one run each." },
          { title: "Our store measured twice", body: "Because the score moves a few points between runs. It scored 93 and 94." },
          { title: "A real store, with its photos", body: `The demo store was measured as an ordinary store on the ${PLAN_AT.creator} plan, drawn by the same pages as every creator's, with a portrait and a product picture on it. Since October 17, 2026 it is on the ${PLAN_AT.pro} plan, so it can show the AI features too; it has not been measured on it yet. A store with more or heavier pictures can score lower.` },
          { title: "The number we retired", body: "Until October 5, 2026 this page said 97 to 100. That was measured on September 17 on an earlier demo, a simpler page with no photos that was not built the way a store is. It is gone, and so is its score." },
        ],
      },
      {
        kind: "note",
        title: "Why it is money, not vanity",
        body: "The buyer opens your link inside Instagram, on a phone, on mobile data. Every second of loading is a share of that traffic that never sees the price.",
      },
    ],
  },
  {
    slug: "promises",
    section: "proof",
    eyebrow: "Proof",
    title: "What we will",
    highlight: "never do to you",
    intro:
      "Every line here answers a complaint creators have published about platforms in this market. They are commitments, written before we have customers, so you can hold us to them.",
    badge: PROOF,
    accent: "from-amber-brand to-pink-brand",
    blocks: [
      {
        kind: "lead",
        text: "We read hundreds of public reviews and complaints from creators about the platforms they use to sell. The same failures come back again and again. This is our answer to each one.",
      },
      {
        kind: "cards",
        title: "The commitments",
        items: [
          { emoji: "🏦", title: "We never hold your sales", body: "Your money is charged on your own Stripe account, so there is no Marktmorgen balance to freeze, delay or set a minimum on.", tint: "bg-mint-brand/15 text-mint-deep" },
          { emoji: "🙋", title: "A person answers you", body: "Support is a human writing back. No chatbot standing between you and your money.", tint: "bg-violet-brand/10 text-violet-deep" },
          { emoji: "🚪", title: "You can always leave", body: "Download your sales history, with each buyer's email address, and your email list as files whenever you want, free, without asking us.", tint: "bg-sky-brand/15 text-sky-brand" },
          { emoji: "🌐", title: "Your domain stays yours", body: "If you bring a domain, you remain the owner of it and keep access to its settings. No exit fee.", tint: "bg-pink-brand/10 text-pink-brand" },
          { emoji: "✉️", title: "Your list is yours", body: "Your buyers are on your own Stripe account, and the addresses your free products collect download as a CSV from your studio whenever you like. The price does not go up as the list grows.", tint: "bg-amber-brand/15 text-amber-brand" },
          { emoji: "📜", title: "No silent changes", body: "Price and rule changes are announced in advance, in writing, and never applied retroactively to money already earned.", tint: "bg-violet-brand/10 text-violet-deep" },
          { emoji: "🔌", title: "No surprise shutdown", body: "If your account ever has to be paused, you get the reason in writing and a way to answer before the store goes dark, unless the law or an urgent risk to buyers means acting at once.", tint: "bg-mint-brand/15 text-mint-deep" },
          { emoji: "🧾", title: "One line for the real cost", body: "The subscription, plus Stripe's own fees shown as Stripe charges them. No fee that only appears on the statement.", tint: "bg-pink-brand/10 text-pink-brand" },
        ],
      },
      {
        kind: "note",
        title: "Where these came from",
        body: "Public reviews and complaints from creators on Trustpilot, G2, Capterra, the Better Business Bureau, app stores and creator blogs, about Stan, Beacons, Linktree, Gumroad, Payhip, Kajabi and Podia, read in September 2026. We are not repeating the accusations here; we are answering the pattern.",
      },
      {
        kind: "note",
        title: "What we cannot promise yet",
        body: "We cannot promise a support team that answers at three in the morning, or a feature list as long as that of a platform with years of work behind it. We can promise that a person answers, and that everything listed as working really works.",
      },
    ],
  },
  {
    slug: "everything",
    section: "proof",
    eyebrow: "Proof",
    title: "Feature by feature,",
    highlight: "against Stan",
    intro:
      "Everything Stan publicly offers, and exactly where Marktmorgen stands on each line. Stan's side was read from its own help center, app store listings and blog on September 17, 2026; the rows on the store, what you can sell, checkout and marketing were re-checked on its help center on September 26, and the rows on stores, teams, reviews, calls, ways to pay, currency, funnels, email platforms, webinars, bundles and imports on September 27. On September 28, the rows were read against its help center again, and the rows on the line about you, sales pages, teams, physical products and quizzes were corrected. The row on inviting other creators was read from Stan's referral program article on September 30, the row on packages of sessions from its coaching call article the same day, and the row on members switching plans from its article on membership prices. Everything in the Marktmorgen column works today; nothing there is a promise.",
    badge: PROOF,
    accent: "from-violet-brand to-mint-brand",
    blocks: [
      {
        kind: "lead",
        text: "The goal is to offer everything Stan offers and more. This page is the scoreboard for that goal, and it is deliberately uncomfortable: every line where we do not have something says so, in the same size of type as the lines where we do.",
      },
      {
        kind: "table",
        title: "Apps and devices",
        note: "Stan's help center, article 406, read September 17, 2026: the Stan app is \u201ccurrently only available on iPhone and iPad through the iOS App Store.\u201d",
        head: ["", "Stan", "Marktmorgen"],
        rows: [
          ["iPhone app", "Yes \u2014 a creator app, rated 4.9 stars on the App Store", "Not available \u2014 Stan is ahead here. The studio installs to the home screen instead, and sends notifications of sales and bookings on iOS 16.4 or later"],
          ["Android app", "No \u2014 none, by their own documentation", "Not available. The studio installs to the home screen instead, and sends notifications of sales and bookings"],
          ["Buyer app", "Yes, on iPhone only: the Stan Community app, for members of a creator's community", "No app-store app. Each store installs to the home screen on both phones as an app of its own, with the store's name, icon and color"],
          ["Annual plan inside the app", "Not possible \u2014 browser only", "Same price on every device"],
          ["Add to home screen", "Not advertised", "Yes, on Android and iPhone: the studio, with notifications, and every store as its own app"],
        ],
      },
      {
        kind: "table",
        title: "The store",
        head: ["", "Stan", "Marktmorgen"],
        rows: [
          ["Store page on a phone", "Yes", "Yes, and faster (93\u201394 against 46\u201359 on PageSpeed, October 5, 2026)"],
          ["Themes and colors", "Yes, limited", "Yes \u2014 four themes, ten colors or any color of your own, five pairings of letters, and your photo. Every color is checked for contrast before your page uses it"],
          ["A line about you on the page", "A short profile bio, and no separate About Me page", "Every store, under your name"],
          ["Products on one store", "No numeric cap stated", "Up to 2,000 products and 100 links, 24 products a page on the store and search in your studio — Stan is ahead here"],
          ["Sections on the store", "Yes — named sections, dragged into order and hidden when empty (their help center, read October 7, 2026)", "Yes — up to 20 headings, each starting at a product you pick, and one line of your own news across the top"],
          ["Product pictures", "Yes — thumbnails shown as Button, Callout or Preview", "Yes — a picture on each product, shown as Button, Callout or Preview, the same three"],
          ["Several prices for one product", "Not available", "Up to 50 on one product, each with its own file or link, compared side by side with one marked as your pick"],
          ["Sales pages for a product", "A checkout page for each product, with a description and a video, which can be made a private landing page on every plan. Funnels of several pages on the $99 plan", `Yes, on the ${PLAN_AT.creator} plan: up to 30 blocks per product \u2014 hero, video from YouTube, Vimeo or Loom, your own pictures, benefits, what is inside, who it is and is not for, how it works, a comparison table, bonuses, numbers counted by the store, about you, questions, guarantee, a countdown to a real deadline, buttons and reviews, from six templates or an AI draft (on ${AI_PLANS_WORDS}) \u2014 with its own search title and description and a share picture drawn for it`],
          ["Reviews", "Added by the creator. Their help center says customers cannot write one", "Written only by paying buyers, checked on your Stripe account. You can answer or hide one, never edit or delete it; hidden reviews still count in the average, and a full refund takes the stars out"],
          ["Your own domain", "Not available", DOMAINS ? `Yes, on the ${PLAN_AT.pro} Studio plan, with the certificate handled for you` : "Not available"],
          ["Custom code on the page", "Explicitly not supported", "Not available"],
          ["Selling on your own website", "Not available: the checkout is only at stan.store/<name>", "One product at a time, as a card with its picture, price, rating and buy button that opens Stripe's checkout in a new tab, or as a plain button in your color. Pasted into any page that takes HTML. The whole store cannot be put inside another site"],
          ["Several stores in one account", "Not in one account. Several accounts, each with its own email and its own subscription", "Up to five in one account, each with its own address, Stripe account and plan, switched at the top of the studio"],
          ["A team with roles", "Not for the store: their help center says the only way to give someone admin access is to share your login. Admins and moderators exist inside the community only", "Up to five people per store, as Admin, Editor or Support, each signing in with their own email, checked on our server, with an activity log"],
        ],
      },
      {
        kind: "table",
        title: "What you can sell",
        head: ["", "Stan", "Marktmorgen"],
        rows: [
          ["Digital downloads", "Yes, up to 5 GB", "Yes, up to 5 GB"],
          ["Selling something bigger", "Their help center: host it on Google Drive or Dropbox and use Redirect to URL", "Sell it as a link. Same escape hatch, and we say so on the product itself"],
          ["How much your buyers may download", "No figure in their help center", "200 GB a month, published, and shown in your account as it is used"],
          ["Courses with drip and analytics", "Yes", "Yes \u2014 modules, videos up to 5 GB that stay upright when filmed upright, text, downloads, free preview lessons, modules that open over time with an email to the student, and each student's progress"],
          ["Memberships and subscriptions", "Yes \u2014 daily, weekly, monthly, annually, and can end after a set number of payments. No free trial in their help center", "Yes \u2014 daily, weekly, monthly, yearly, on your own Stripe, with a free trial of 1 to 90 days and an end after 2 to 36 payments if you want them. Members cancel on their own, through Stripe, without writing to you, and files, courses and the community close when a membership ends"],
          ["Members switching plans", "Not in their help center: existing members stay at the price they bought at (article 132, read September 30, 2026)", "Yes \u2014 2 to 6 memberships as tiers; members move up or down on their own, see Stripe's exact amount first, pay the difference at once or get a credit on their next payments, and what each plan includes opens and closes with it"],
          ["An offer when a member cancels", "Not in their help center, read September 30, 2026", `Yes, on the ${PLAN_AT.creator} plan: a discount you choose, 10% to 50% off one to three payments, offered once per membership on Stripe's own cancellation page and declined in one press. An offer of more than one payment only on memberships charged monthly`],
          ["A come-back offer after a member leaves", "Not in their help center, read September 30, 2026", `Yes, on the ${PLAN_AT.creator} plan: one email 3 to 21 days after a membership ends, with 10% to 50% off one to three payments, only to former members who agreed to hear from you and have not come back, and a link that opens your checkout with the discount applied`],
          ["When a member's card fails", "Reminders for payment plans, by their help center", `One email per failed renewal, on the ${PLAN_AT.creator} plan, with a link that pays it and makes the card that worked the one used next time. It says when the card is tried again, or that it will not be`],
          ["Video link for each booking", "Yes \u2014 Zoom or Google Meet links created automatically", "Google Meet links made automatically once you connect your Google Calendar, or your own meeting link, or a private Jitsi Meet room made for each booking. The first person in a Jitsi room may be asked to sign in to Jitsi to start it. No Zoom link is made for you yet \u2014 Stan is ahead on Zoom"],
          ["Coaching calls with a calendar", "Yes \u2014 with Google Calendar and reminder emails", "Yes \u2014 your hours in your time zone, times shown to each buyer in theirs, held while they pay, a calendar file emailed to both of you, reminders a day and an hour before, and buyers who move their own booking up to twice. Busy times in up to three Google, Outlook or iCloud calendars hide call times; bookings reach your calendar as a feed you subscribe to, and only calls set to Google Meet are written into your connected Google Calendar as events"],
          ["Group calls", "Yes \u2014 a maximum number of attendees", "Yes \u2014 1 to 50 people per time slot, with the seats left shown to buyers"],
          ["Packages of sessions", "Not in their help center: a coaching call product books one call per purchase (article 15, read September 30, 2026)", "Yes \u2014 2 to 20 sessions of a weekly call at one price, with a time limit you choose or none, paid once and booked one at a time from the buyer's own link, each with the reminders, meeting link and moves of any booking. Not for live sessions on dates"],
          ["Live webinars", "Yes", "Yes \u2014 live sessions on dates you set, up to 50 dates per product and 1 to 500 seats each, held in a Google Meet made on your connected Google Calendar, on the meeting service whose link you give, or in a Jitsi Meet room made for each session. And free live events for your community's members. No streaming or recording built in"],
          ["Lead magnets", "Yes", "Yes \u2014 anything priced at 0 is given for an email address, each address confirmed by its owner, and the list downloads as a CSV at any time"],
          ["Community", "Yes, one per account, with webinars inside it", `Yes, one per store, on the ${PLAN_AT.creator} plan: up to 20 spaces, each for the whole community or for the buyers of some products, posts with a picture that can be edited, polls, comments, likes, @mentions, pinned posts, a live room, private messages, notifications on a computer or phone, an opt-in member directory, reports and moderation, open only to the buyers you choose. Announcements by email on Studio`],
          ["Questions and a welcome for new members", "Not among the community features in their help center, read September 30, 2026", `Yes, on the ${PLAN_AT.creator} plan: up to three questions every member answers once before their first post or comment, read only by you, and a welcome message sent privately from you on their first visit`],
          ["Points, levels and a leaderboard", "Not in their help center, read September 30, 2026", `Yes, on the ${PLAN_AT.creator} plan: one point for every like a member's post or comment gets, 9 levels shown beside every name, a leaderboard for 7 days, 30 days and all time, spaces that open for posting at a level, and a course of yours handed over free at a level`],
          ["Search in the community", "Not in their help center, read September 30, 2026", "Yes — one box across posts and comments, course lessons, events, the member directory, the room and a member's own messages, each result shown only to somebody who may open it. What is said inside a video is not searched"],
          ["Webinars inside the community", "Yes \u2014 a webinar product added to the community, which members sign up for on its landing page, with Zoom or Google Meet links made automatically", "Yes \u2014 live events: up to 50 coming up, RSVPs with a cap of 1 to 5,000, the way in on the event's page from 15 minutes before, in a private Jitsi Meet room shown on the page, at your own link or in a Google Meet made on your connected Google Calendar, reminders a day and an hour before, emails when one moves or is canceled, and replays from YouTube, Vimeo or Loom. Free to members, not sold on its own, and no Zoom link made for you yet \u2014 Stan is ahead there"],
          ["Bundles", "Their Digital Downloads help section lists bundles among the files you can sell as one download. No product type that hands over other products in their help center", "Yes \u2014 2 to 20 of your one-off products at one price, each delivered as itself, with \u201cwhat they cost on their own\u201d shown only when it is true. Not with memberships or calls"],
          ["External links on your page", "Yes, as one of their product types", "Yes, as their own list — no price on them and nothing to check out"],
          ["Physical products", "Not built in. Their help center suggests a custom product with address fields at checkout, with shipping and stock handled by hand", `Yes, on the ${PLAN_AT.creator} plan: Stripe asks for an address in the countries you ship to and adds your shipping cost; you mark each order as shipped and the buyer is emailed, with a tracking link`],
          ["Course quizzes and certificates", "Not in their help center", "Yes \u2014 up to 20 questions after any lesson, a pass mark and a number of tries, and a certificate with a page of its own that anyone can open to check it. The certificate is printed or saved as a PDF from the browser"],
        ],
      },
      {
        kind: "table",
        title: "Checkout and money",
        head: ["", "Stan", "Marktmorgen"],
        rows: [
          ["Cut of each sale", "0%", feeWords().short],
          ["Whose Stripe account", "One managed by the platform", "Yours"],
          ["Getting paid", "Manual cash-out, $10 minimum", "Your Stripe payout schedule"],
          ["PayPal", "Yes, for every creator", PAYPAL ? feeWords().paypal : "Built, and off until PayPal approves us as a platform. Until then, Stan is ahead here"],
          ["Klarna and Afterpay", "Yes, on the $99 plan", `Yes, on the ${PLAN_AT.creator} plan, with Affirm, Apple Pay, Google Pay, Link, iDEAL, Bancontact and more: the ways to pay you switch on in your own Stripe account, where Stripe offers them`],
          ["Currency", "One per store, chosen from ten", "Any one of 15 per store: US, Canadian, Australian, New Zealand, Singapore and Hong Kong dollars, euros, pounds, Swiss francs, Swedish kronor, Norwegian and Danish kroner, Polish zloty, yen and Mexican pesos"],
          ["Private podcast", "Not in their help center: a URL product can link to a podcast elsewhere (searched September 30, 2026)", `Yes, on the ${PLAN_AT.creator} plan: sold once or as a membership, with a private feed for each buyer in their own podcast app, emptied when a refund or the membership ends it`],
          ["A sale across the store", "Discount codes that can expire, on the $99 plan, which buyers have to know and type (article 43, read September 30, 2026). No price crossed out on the store", `Yes, on the ${PLAN_AT.creator} plan: a percentage off from a start to an end you pick, shown with the old price crossed out and when it ends, taken off at checkout with no code, and stopped by itself at the end`],
          ["Discount codes", "Yes, on the $99 plan, a percentage off only", `Yes, on the ${PLAN_AT.creator} plan, a percentage or an amount off \u2014 kept on your own Stripe account`],
          ["Pay what you want", "Not in their help center", `Yes, on the ${PLAN_AT.creator} plan: a minimum of at least $1 and a suggested price. Not with memberships, price options, payment plans, the box at checkout, calls or discount codes`],
          ["Questions at checkout", "Yes \u2014 including phone number and checkbox", "Up to three: a short answer, a number or a list to choose from. No phone-number or checkbox question"],
          ["Order bumps and upsells", "Yes, on the $99 plan. One order bump per product (their blog, updated September 16, 2026)", `Yes, on the ${PLAN_AT.creator} plan: up to three boxes the buyer checks at checkout, each its own product at its own price, and one click after paying, charged to the same card`],
          ["Limited quantity", "Yes, on the $99 plan", "Yes \u2014 the count shown is the real one, and a unit someone is paying for is held so the last one is never sold twice"],
          ["Payment plans", "Yes, on the $99 plan", `Yes, on the ${PLAN_AT.creator} plan: 2 to 12 weekly or monthly payments, ending by themselves after the last`],
          ["Sales tax collection", "Yes", "Yes \u2014 Stripe Tax on your own account, once your Stripe tax setup is done"],
          ["Logging in", "An account with a password, by their own signup page", "A link sent to your email that works once, for 15 minutes, or a passkey if you add one, and no password kept here. Log out of all devices in one click"],
          ["What a full refund closes", "Not something we can check from outside", "On Marktmorgen: the download at once, the course within 10 minutes, the community within 5, and the license key revoked within about 5. On a payment plan, a full refund of its first payment does the same"],
        ],
      },
      {
        kind: "table",
        title: "Marketing",
        head: ["", "Stan", "Marktmorgen"],
        rows: [
          ["Email broadcasts and flows", "Yes, on the $99 plan only", `Yes, on the ${PLAN_AT.pro} Studio plan: one-off emails, emails scheduled for later and sequences that send themselves, with steps that give or take off a label and start another sequence, up to ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} a month, only to people who agreed`],
          ["Abandoned-checkout email", "Yes \u2014 a flow with an abandoned-cart trigger, on the $99 plan", `One reminder per checkout, on the ${PLAN_AT.creator} plan, only to buyers who asked for it: on Stripe's page where Stripe offers its box (accounts in the United States), or on the page a buyer returns to after leaving the checkout, in every country. Off until you switch it on. Not for calls or live sessions`],
          ["Instagram auto-DM", "Yes, on the $29 plan", "Not available"],
          ["Funnels up to 20 pages", "Yes, on the $99 plan, since June 2026 \u2014 landing pages, checkout and upsells", `Yes, on the ${PLAN_AT.creator} plan: up to 20 of your own pages and products' pages in order from one address, counted step by step, with a box at checkout and up to five one-click offers after paying, each with a path for yes and for no. The thank-you page is the store's own, with a button to the next step`],
          ["Email platforms", "Mailchimp and other email tools through Zapier", `Mailchimp, Kit, beehiiv and MailerLite built in, on the ${PLAN_AT.creator} plan, one per store, passing on only people who agreed`],
          ["Affiliates paid automatically", "Yes, on the $99 plan, out of your sale, which Stan holds for 7 business days first (article 340, read September 30, 2026)", `Yes, on the ${PLAN_AT.creator} plan, from your own PayPal: everyone owed in one press, or by itself on your payday. Your sale lands in full in your Stripe account at once and is never held. Needs a PayPal Business account with Payouts switched on; PayPal charges you its own fee on each payment`],
          ["A share for one affiliate", "Yes, on the $99 plan: edit an affiliate's commission (article 378, read September 30, 2026)", `Yes, on the ${PLAN_AT.creator} plan: 1% to 90% for one affiliate, on every product except those you set to 0%`],
          ["Where affiliates are paid", "Affiliates connect their own Stripe or PayPal, and need a Stan account (article 402, read September 30, 2026)", "Affiliates need no account anywhere: each chooses on their own page the PayPal address you pay them at, and the address they joined with is told of every change. Or pay by Wise or bank transfer from the file"],
          ["Buyers become affiliates", "Yes, on the $99 plan: every customer becomes an affiliate automatically, through Affiliate Share", `Yes, on the ${PLAN_AT.creator} plan, when you switch it on: everyone who buys is offered their own link on the thanks page and in the purchase email, approved at once. Paid from your own PayPal, in one press or on your payday`],
          ["Inviting other creators", "20% of each payment they make, in cash through Stripe or PayPal, for as long as they stay subscribed, 3 to 5 days after each renewal once their 14-day trial ends, and only while you pay Stan too. No bonus for the creator you invite in their help center", INVITE_PROGRAM_OPEN ? `${INVITE_SHARE_PERCENT}% of each payment they make, for as long as they pay, as credit on your own plan \u2014 not cash \u2014 added ${INVITE_HOLD_DAYS} days after each payment. The creator you invite gets ${INVITE_BONUS} of credit after their first payment` : INVITE_PAUSE_NOTICE],
          ["Waitlist before launch", "Not in their help center: its \u201cProduct coming soon!\u201d notice only means no way to pay is connected yet (article 367), read September 30, 2026", `Yes, on the ${PLAN_AT.creator} plan: a product marked coming soon takes addresses confirmed from the inbox, and the day you put it on sale each gets one email with its link and price`],
          ["Advertising pixels", "Yes, on the $99 plan", `Yes \u2014 Meta, Google, TikTok and Pinterest, on the ${PLAN_AT.creator} plan, with each purchase and its amount. Visitors are asked first where the law says so`],
          ["Recurring revenue and churn", "Not in their help center, read September 30, 2026", `Yes, on the ${PLAN_AT.creator} plan: monthly recurring revenue, paying members and trials, churn over 30 days and the share of trials that became paying, overall and by membership, read from your own Stripe account`],
          ["Visits, sources and conversion", "Yes", "Yes \u2014 7, 30 and 90 days and all time, with UTM tags, counted without cookies, sales read from your own Stripe account, and CSV files of sales, visits and sources"],
          ["Public API and webhooks", "None published", `Both, on the ${PLAN_AT.creator} plan. Webhooks: up to five addresses, eight events, signed, for Zapier's Catch Hook, Make or your own server. An API that reads your list, members, a course's students, your affiliates and your bookings, with up to five keys; a key made to write also adds people who agreed to your list, changes their labels, and gives or takes back products`],
          ["Importing your list", "A CSV, up to 5,000 imported contacts per store in all, each sent an email to opt in again", "A CSV, up to 50,000 rows a file on a list of up to 100,000, only people you confirm agreed, never anyone who unsubscribed here. Nobody is emailed because of it"],
          ["Importing products", "Not in their help center", "A CSV, up to 500 a file, as drafts: title, price, description and link. Files, pictures and lessons are added afterward"],
          ["Past buyers from another platform", "Access granted one customer at a time, to downloads, courses and the community, with no bulk undo", "A CSV, up to 20,000 a file: files, links, courses, bundles and the community, and one email to them if you choose. Not calls, and no undo in one step. Members are emailed a link of their own to keep their membership here, first paying on the day it would have renewed"],
        ],
      },
      {
        kind: "note",
        title: "Where things stand today",
        body: "New paid plans and payment activation are paused while we review the full costs and tax requirements. A Stripe connection alone does not enable selling. You can try the demo before deciding; demo payments use a test card and do not charge real money. Existing accounts keep their contracted rights and access to recovery, export and cancellation. Published plan prices describe the planned offer, not an invitation to start paying today. We have not announced an opening date.",
      },
      {
        kind: "note",
        title: "About the app stores",
        body: "A real App Store and Google Play app is not a design job; it is a compliance job. Apple charges $99 a year and takes a cut of subscriptions bought inside an app, and Stan's help center says an annual plan cannot be bought in its app, only in a browser. Google Play charges $25 once. The installable web app has none of that, works on both systems, and is what we ship first.",
      },
    ],
  },
  {
    slug: "questions",
    section: "proof",
    eyebrow: "Proof",
    title: "Questions,",
    highlight: "including the awkward ones",
    intro:
      "If a question is missing, write it to us and the answer goes on this page, whether it flatters us or not.",
    badge: { label: "Straight answers", tone: "proof" as const },
    accent: "from-violet-brand to-amber-brand",
    blocks: [
      {
        kind: "steps",
        title: "The short answers",
        items: [
          { title: "Can I sign up and sell today?", body: "New paid plans and payment activation are currently paused. Connecting Stripe does not bypass this pause. You can explore the demo with test payments; no opening date has been announced. If you already have an account, your contracted rights, recovery, exports and cancellation remain available." },
          { title: "Who holds the money from my sales?", body: feeWords().whoHolds },
          { title: "What happens if Marktmorgen closes?", body: "Your Stripe account, your customers and your files were never ours. Your list downloads from your studio at any time, and a shutdown comes with at least 30 days' notice in writing." },
          { title: "Who is behind this?", body: "Marktmorgen’s creator also handles support, in English and in writing." },
          { title: "Can my store look like mine?", body: "Yes. Put up your photo, pick one of four themes, a color \u2014 one of ten, or your own \u2014 and one of five pairings of letters, and the studio shows the page before you save it. Every color is checked so the words on your page stay easy to read." },
          { title: "What do I do if something breaks?", body: "You write to support and a person answers. If a sale is affected, you have the Stripe dashboard as the source of truth, independently of us." },
        ],
      },
    ],
  },
];

export function findPage(section: TopicPage["section"], slug: string) {
  return PAGES.find((p) => p.section === section && p.slug === slug);
}

export function slugsFor(section: TopicPage["section"]) {
  return PAGES.filter((p) => p.section === section).map((p) => ({ slug: p.slug }));
}

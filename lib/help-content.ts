/**
 * The help center's questions and answers, kept apart from its page so the
 * studio's help assistant (lib/help-ask.ts) answers from the very same words
 * the page shows. Each answer is plain text; numbers come from the rules they
 * describe, so the two can never disagree.
 */
import { CENTS_PER_MINUTE, GIVE_UP_HOURS, MIN_CENTS, dollars } from "@/lib/auto-captions-rules";
import { isDomainsConfigured } from "@/lib/domains";
import { PRO_MONTHLY_EMAILS, REFUND_DAYS, TRIAL_MONTHLY_EMAILS, SCALE_MONTHLY_EMAILS } from "@/lib/plan";
import { PAID_MONTHS_BEFORE_PAUSE, PAUSE_MONTHS } from "@/lib/plan-pause-rules";
import { healthRuleWords, rampRuleWords } from "@/lib/mail-health-rules";
import { formatMoney } from "@/lib/money";
import { INVITE_BONUS_CENTS, INVITE_HOLD_DAYS, INVITE_SHARE_PERCENT } from "@/lib/creator-invite-rules";
import { EXPECTATION, MAX_PAGES_READ, OPEN_COUNTRIES_WORDS, PITCHES_PER_DAY, REPITCH_DAYS } from "@/lib/outreach-rules";

/** An anchor for one answer, from its question. */
export function answerId(q: string): string {
  return q.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export type HelpSection = {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  tone: string;
  items: { q: string; a: string[] }[];
};

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "getting-started",
    emoji: "🚀",
    title: "Getting started",
    blurb: "What Marktmorgen is right now, and what it costs to start.",
    tone: "bg-lilac",
    items: [
      {
        q: "What is Marktmorgen today?",
        a: [
          "You sign up, take your own store address and build the page: its name, its description, and what you sell with its price. You connect your own Stripe account, and once Stripe has cleared it and your plan or free trial is running, your page can take a card. The money is charged on your account, not ours.",
          "You can see the whole path before signing up. The demo store has price options on a product, a Stripe checkout made on the creator's own account, and the file delivered the second the payment clears. You can buy from it with a test card.",
          "The mission page lists everything that is built and everything that is not, in two columns, so nobody signs up expecting the wrong thing.",
        ],
      },
      {
        q: "Can I put my own products on my store?",
        a: [
          "Yes. In your studio you write the name of the store, the line under it, and each thing you sell with what the buyer gets and the price. It is on your page the moment you save it, and you can reorder or remove any of it.",
          "A store holds up to 2,000 products and up to 100 links. Products are priced in your store's currency — one of 15, US dollars unless you choose another — with one price each, up to 50 if you want the buyer to choose, or a price the buyer chooses, at or above your minimum. You can also put the file itself on each one, and open it again to check it is the right one. A long store shows 24 products a page, and your studio finds any product by name. You can cut the list into up to 20 sections with a heading over each, and put one line of your own news across the top of the page, leading to one of your products if you like.",
          "Each product can have a picture, shown on its card in one of three ways (no picture? press Make a cover under the product: six designs drawn in your store's color and letters from its title, a short line saying what it is and a line under it, each word readable whatever your color), and a page of its own at your store address followed by /p/ and the product's name in words (knife-skills, then a short code), with a long description of up to 5,000 characters. That page has its own title and preview card, so a link to one product shared anywhere unfolds into that product. Rename the product and its address follows; every link shared before keeps working. Share it from the studio: the link to copy, a QR code to download for print or slides, and X, Facebook, LinkedIn, WhatsApp and email, each opening that site's own page to post from, with each link tagged so your numbers show which one brought visitors and sales. You can also build it as a sales page, from blocks.",
          "Your page can take a card as soon as two things are true: Stripe has cleared your connected account, and your subscription is running — the trial counts. Until then the page says so plainly, to you and to anyone who opens it.",
        ],
      },
      {
        q: "What file can I sell, and how big?",
        a: [
          "Up to 5 GB, in any of these: PDF, ePub, ZIP, PNG, JPG, GIF, WebP, SVG, MP3, WAV, M4A, MP4, MOV, WebM, TXT, CSV, Markdown, Word, Excel and PowerPoint. Anything over about 20 MB is uploaded in parts, so a dropped connection costs you one part rather than the whole thing.",
          "Bigger than that, or not a file at all? Sell it as a link. You paste an https address \u2014 a Google Drive folder, a private video page, a Notion page \u2014 and the buyer is sent there the moment they pay, with the address shown on the page and kept in their receipt. There is no size limit on that, because the files stay where you already keep them.",
          "A product carries one or the other, never both, so a buyer who has paid is shown one thing to open rather than a choice.",
          "Anything that runs — a program, an installer, a script — is refused. A store that hands out software is a store that hands out malware the day an account is taken over.",
          "The file goes straight from your browser to storage that needs a key to read. It is never named or linked on your public page, and the only way it comes out is through us, after we have checked who is asking. You can open it yourself from your studio to be sure it is the right one.",
        ],
      },
      {
        q: "What does it cost to start?",
        a: [
          "Nothing to sign up. Your store address, your page, the editor and connecting Stripe are free and stay free. Without a plan, your page is shown for 500 visits a month.",
          `What the subscription switches on is your checkout: your page taking a card, and handing out what you give away for an email address. It is $29 a month, or $300 a year, which is $48 less than paying monthly. Pro, which adds email to your list${isDomainsConfigured() ? " and your own domain" : ""}, is $99 a month or $948 a year. Scale, which is Pro for a list that sends up to ${SCALE_MONTHLY_EMAILS.toLocaleString("en-US")} emails a month instead of ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")}, is $249 a month or $2,388 a year. The first 14 days are free on any plan, monthly or yearly. Stripe takes your card details when the trial starts and first charges the card when the 14 days end; we email you a week before that charge, and if you cancel before it, from your studio, it is never charged. So you can put a product up and make a sale before you decide whether it is worth paying for.`,
        ],
      },
      {
        q: "What will it cost?",
        a: [
          "One subscription — $29 a month, or $99 a month on Pro, less if you pay yearly — and 0% of your sales. The card fee your payment processor charges is paid to them, on your own account, and we never take a cut on top of it.",
          "Two things are charged by use, and only if you reach them, both added to your next invoice. Lesson video watched past 400 hours in a month is $0.03 for each hour. Visits to your store past what your plan covers are $0.50 for each thousand. Your studio shows both as they are counted, and neither ever takes your store down or cuts a student off. Downloads are never charged for.",
          "The price is published on the home page. If it ever changes, existing subscribers are told before it applies to them.",
        ],
      },
      {
        q: "Can I switch between monthly and yearly, or between the plans?",
        a: [
          "Yes to both, from your studio, whenever you like. Monthly to yearly charges the year that day, less what is left of the month you already paid for. Yearly to monthly keeps what is left of your year as credit on your account, and that credit pays your months until it runs out.",
          "Moving up to Pro charges that day the difference for what is left of the period you already paid for; going back to the $29 plan keeps what is left of Pro as credit on your account. Inside the trial, no switch charges anything.",
          "On a yearly plan we email you about a month before it renews, with the date, the amount and the link to cancel.",
        ],
      },
      {
        q: "Can I run more than one store, or have someone help me?",
        a: [
          "Both. One account runs up to five stores, each with its own address, products, buyers, Stripe account and plan, and you switch between them at the top of your studio. The 14-day free trial is for an account's first store; each other store is charged from the day its plan starts, and canceling one touches no other.",
          "Each store can have a team of up to five people, invitations still waiting included, each signing in with their own email: an Admin runs everything except the plan, the Stripe connection, the team and deleting the store; an Editor looks after products, courses, calls, bundles, sales pages, the store page and the community's live events, moderates the community and reviews, and writes email drafts without sending them; Support reads orders and bookings, sends purchase emails again, sees who is coming to live events and moderates the community and reviews. What each role may do is checked on our server for every request. You are emailed when someone joins or changes role, and the activity log shows the last 500 changes and downloads your team made.",
          "Stan's help center, read on September 28, 2026, says the only way to give a team member admin access there is to share your login.",
        ],
      },
      {
        q: "Can I move my store from Stan, Gumroad or another platform?",
        a: [
          "Yes, from a spreadsheet, in three imports from “Moving from another platform” in your studio, on every plan. Your list: up to 50,000 rows a file, and only people who agreed to hear from you \u2014 you confirm it each time, a consent column in the file narrows it further, nobody who unsubscribed here is added back, and nobody is emailed because of it. Your products: up to 500 a file, each made a draft that waits in your studio until you publish it, with its title, price, description and link. Your past buyers: up to 20,000 a file, each given what they bought on your store's list of purchases, marked as brought over from another platform, with no payment and no receipt.",
          "Bring products first, because the buyers' file names them by their title or their ID here, then add each product's file or lessons. A buyer brought over for a product that opens your community is let in. If you check “Email each buyer once,” each buyer gets one email from your store's name saying what moved and how to open it \u2014 up to 20,000 buyers per store in 30 days \u2014 and nothing more is sent because of it. The studio reads the file in your browser, you say which column is which, and every row that is not brought in is listed with its row number and the reason, as a spreadsheet you download.",
          "What it does not do: files, pictures and lessons are not imported; memberships, calls and products with several prices cannot be given to past buyers; buyers brought over get no license key here and are not counted as sales, sent to webhooks, credited to affiliates or able to review; and an import cannot be undone in one step. You and your Admins can import. Stan's help center, read on September 28, 2026, allows up to 5,000 imported contacts per store in all, has you send them an opt-in email, and grants a customer access to a product one at a time.",
        ],
      },
      {
        q: "Is it open, or is this a waiting list?",
        a: [
          "Open. You can take an address and be selling the same day.",
          "It is also young, and the mission page lists what is built and what is not, in two columns, so you can see what you are signing up to before you do. That page is updated the day something new actually works, not the day it is planned.",
        ],
      },
    ],
  },
  {
    id: "demo-store",
    emoji: "🧪",
    title: "The demo store",
    blurb: "How to test a real checkout without spending anything.",
    tone: "bg-cream",
    items: [
      {
        q: "How do I try it?",
        a: [
          "Open the demo store, pick a price option and pay with the Stripe test card 4242 4242 4242 4242, any future expiration date, any three digits for the security code and any ZIP code.",
          "The checkout is a real Stripe checkout running in test mode. No real money moves, and no real card is ever charged.",
        ],
      },
      {
        q: "Is the file real?",
        a: [
          "Yes. The sample planner is a real PDF, and the page delivers the file that matches the option you paid for — the one-week file for the one-week price, the five-week file for the five-week price.",
        ],
      },
      {
        q: "Can I put my own file in it?",
        a: [
          "Not in the public demo, which is a fixed sample everyone shares. Your own store is where your file goes: take an address, upload it, and the page and the file are yours.",
        ],
      },
    ],
  },
  {
    id: "money",
    emoji: "💳",
    title: "Money, fees and payouts",
    blurb: "Who charges the buyer, who holds the money, and when you get it.",
    tone: "bg-mint-brand/12",
    items: [
      {
        q: "Whose account is the buyer charged on?",
        a: [
          "Yours. You connect your own Stripe account and the charge is made on it directly. The receipt and the line on your buyer's card statement carry your business name, not ours.",
        ],
      },
      {
        q: "What does Marktmorgen take from a sale?",
        a: [
          "Nothing. 0% of your sales, with no asterisk. Our only income is the subscription.",
          "Stripe charges its own processing fee on each payment, published on Stripe's own pricing page, and that is taken on your account by Stripe.",
        ],
      },
      {
        q: "When am I paid?",
        a: [
          "On your own Stripe payout schedule, which you set in your own Stripe dashboard. We never hold a balance for you, so there is nothing for us to release.",
        ],
      },
      {
        q: "Can I give someone a discount code?",
        a: [
          "Yes, and it is on the $29 plan. On Stan, discount codes are on the $99 Creator Pro plan, according to its help center, read on September 28, 2026.",
          "You pick the word, say whether it takes a percentage or an amount off, and cap how many times it can be used if you want to. The buyer types it at checkout and Stripe works out the new total.",
          "Or share it as a link: add ?code= and the word to your store's address or any product's page, like marktmorgen.com/@yourname?code=SPRING. Whoever opens it has the code applied at checkout without typing it, for a week. If the code has ended, is used up or does not fit that order, the checkout opens with the box as usual.",
          "The code is a coupon on your own Stripe account, not a record of ours. So the count of how many times it has been used is Stripe's count, a code you switch off in your own dashboard is off here too, and if you ever leave, your codes leave with you.",
          "One limit, said plainly: a code comes off the payment it is typed into. On a membership that is the first charge, not every renewal forever.",
        ],
      },
      {
        q: "Can my buyers pay with PayPal?",
        a: [
          "Do not count on it. Marktmorgen runs on Stripe and only Stripe, and your buyers are offered the ways to pay you switch on in your own Stripe account. Every sale here is a direct charge on that account, and Stripe's documentation, read on September 28, 2026, lists PayPal as not supported for direct charges. Stripe also offers PayPal only to accounts in the EU (except Hungary), the UK, Switzerland, Norway and Liechtenstein. So even if your Stripe dashboard shows PayPal as on, your buyers should not expect it at checkout here.",
          "Stan lets creators take PayPal, Beacons offers it too, and on this one we are behind them. The other road would be a second, separate integration with PayPal, which means a second checkout, a second refund path and a second dispute queue to keep working. We would rather have one that never breaks than two that sometimes do.",
          "Two things follow from that, and you should know them before you sign up. You need a Stripe account in one of the 43 countries the studio offers \u2014 the United States, Canada, the United Kingdom, Australia, Japan, Singapore, Mexico and most of Europe among them, but not everywhere. And a buyer who has only a PayPal balance and no card, wallet or other way to pay cannot buy from you here.",
        ],
      },
      {
        q: "Which currencies and ways to pay can I offer?",
        a: [
          "Your store charges in one of 15 currencies: US, Canadian, Australian, New Zealand, Singapore and Hong Kong dollars, euros, pounds, Swiss francs, Swedish kronor, Norwegian and Danish kroner, Polish zloty, Japanese yen or Mexican pesos, among those your Stripe account can charge in. You or an Admin choose it in your studio, and you are emailed when it changes. Changing it keeps every price's number, so check your prices; it cannot be changed while a membership or payment plan is still running.",
          "The ways to pay are the ones you switch on in your own Stripe account: cards, Apple Pay, Google Pay, Link, and where they fit the buyer and the amount, Klarna, Afterpay or Clearpay, Affirm, iDEAL, Bancontact and others. Your studio lists what is on, read from Stripe, and links to where you switch more on. Memberships and payment plans show only the ways Stripe can charge again each period.",
          "Ways to pay that are not confirmed while the buyer waits \u2014 ACH, SEPA and Bacs Direct Debit, bank transfers, Boleto, OXXO, Konbini, Multibanco, stablecoins \u2014 are left out on purpose, because what your buyers pay for is handed over the moment the payment is confirmed. And one-click offers after paying are shown only to buyers who paid by card, Apple Pay or Google Pay.",
        ],
      },
      {
        q: "Who handles refunds and disputes?",
        a: [
          "You do, in your own Stripe dashboard, with the same tools any business has. Because the charge was made on your account, a refund is a refund you issue, not a request you file with us.",
        ],
      },
      {
        q: "What about refunds on the Marktmorgen subscription itself?",
        a: [
          `Ask within ${REFUND_DAYS} days of a charge and we refund that charge in full, for any reason or none — renewals and yearly payments included, each with its own ${REFUND_DAYS} days. You can cancel at any time and keep access until the end of the period you already paid for. The refund policy page has the exact wording.`,
        ],
      },
      {
        q: "Can I take a break instead of canceling?",
        a: [
          `Yes, on a monthly plan that has been paid for at least ${PAID_MONTHS_BEFORE_PAUSE} months, once a year. In your studio, under What you pay us, choose Take a break instead and ${PAUSE_MONTHS.map((m) => (m === 1 ? "1 month" : `${m} months`)).join(" or ")}. Your store keeps taking payments until the end of the period you already paid for. Then nothing is charged and your checkout is closed, while your page stays up, everything you put up is kept and buyers can still download what they bought. On the last day your plan starts again by itself, at the price it had, on the card you pay with; we email you a week before, and you can say no in one click. To sell sooner, start your plan again from the studio on any day.`,
        ],
      },
      {
        q: "Do I get anything for inviting another creator?",
        a: [
          `Yes: ${INVITE_SHARE_PERCENT}% of every payment they make to us, for as long as they pay, on any plan, monthly or yearly. Your invite link is in your studio, under Invite creators. It counts when they accept it and then make their first store, and not for an account that paid us before, or one of your own.`,
          `It is credit on your own Marktmorgen plan, not cash. It is added ${INVITE_HOLD_DAYS} days after each of their payments, once its refund window has closed, and Stripe takes it off your next bills by itself; two creators on the same plan as yours pay for it, and anything left over stays on your account. If you have not started your plan yet, it waits until you do.`,
          `The creator you invite gets ${formatMoney(INVITE_BONUS_CENTS, "usd")} of credit on their own plan ${INVITE_HOLD_DAYS} days after their first payment. For comparison, Stan pays 20% of each payment in cash, only while you pay Stan too, and names no bonus for the creator invited, in its help center article 'What is Stan's Referral Program?', read on September 30, 2026.`,
        ],
      },
    ],
  },
  {
    id: "your-store",
    emoji: "🏪",
    title: "Your store",
    blurb: "What it can hold today, and what it cannot.",
    tone: "bg-sky-brand/12",
    items: [
      {
        q: "Is there a limit on how much my buyers download?",
        a: [
          "Your plan covers 200 GB of downloads a month for your store. Your studio shows what you have sent out so far, counted from the moment each download starts.",
          "If you go past it, nothing is cut off. Somebody paid you for that file and they get it — we are not going to take a sale and then break it to protect our own bill. Your studio marks the month as past what your plan covers, and your store keeps selling as usual.",
          "For a sense of scale: 200 GB is two hundred copies of a one-gigabyte course, or forty thousand copies of a five-megabyte guide, in a single month.",
        ],
      },
      {
        q: "How many visits does my plan cover?",
        a: [
          "Storefront covers 3,000 visits a month, Storefront & Email 10,000, and Storefront & Email for a big list 50,000. A visit is one person opening your store on one day, however many of its pages they look at. You are never counted when you are signed in, and neither is a robot that says it is one.",
          "A buyer who comes back counts the same way: a student or a member who opens a course or your community on a day is that day's visit, once. A subscriber to a private podcast is one visit on each day their app checks for episodes. Your community's live room checks for new messages for as long as it is open in front of a member, so it counts by the 10 minutes it is open, for each member: 2.6 visits while people are talking, when it checks every 5 seconds, and 0.6 of a visit while the room is quiet. A room in a background tab, or one nobody has touched for 20 minutes, checks nothing and counts nothing.",
          "Past your plan's figure, visits are $0.50 for each thousand, counted to the visit and added to your next invoice. Your store is never taken down for it. We email you the first time a month passes it, and your studio shows the count as it grows.",
          "A store with no paid plan has nothing a charge can be added to, so its public pages rest past its visits until the plan is paid or the month turns: 3,000 visits a month in the free trial, and 500 a month before a plan starts and after one ends. A visitor is told the page will be open again soon. What your buyers already have stays open: their orders, downloads, lessons, podcasts and memberships. The live room of such a store stops checking by itself, and shows new messages when a member presses a button.",
        ],
      },
      {
        q: "How much can my store hold?",
        a: [
          "A store on a paid plan holds up to 200 GB of files and lesson videos. In a plan's free trial it holds 50 GB. A store with no plan, before one is started or after one has ended, holds 5 GB.",
          "Past its figure a store is asked to delete something before adding more. While a plan runs, nothing already there stops working and nothing already sold is touched.",
        ],
      },
      {
        q: "What happens to my files if my plan ends?",
        a: [
          "Your store stays: its page, your products and their prices, your lessons' text and quizzes, your contacts and your orders. Your buyers go on downloading what they bought. A store that keeps 5 GB or less of files and lesson videos is not touched at all, and cannot add past that until a plan is started again.",
          "A store that keeps more than 5 GB has a date. 60 days after your plan ended, what it keeps is removed: the files your products hand over, your lessons' videos and downloads, and your podcast's episodes. From that day your buyers can no longer download those files or watch those videos.",
          "We email you when the plan ends, 30 days before that day and 7 days before it, each time with the date, and nothing is removed sooner than a week after the last of those emails. Your studio shows the date too.",
          "Two things stop it, either one: start a plan again, or delete enough for your store to keep 5 GB or less. If the day passes, you can put a file back on each product and a video back on each lesson once a plan is started again.",
        ],
      },
      {
        q: "What can I sell?",
        a: [
          "Digital files, courses, memberships that charge on a schedule, paid calls, one-on-one or in groups of up to 50, live sessions on dates you set, and bundles of 2 to 20 of your products at one price. What is too big to upload, or is not a file at all, is sold as a link to where it already lives. And anything can be given away for free, in exchange for an email address.",
          "One product can carry up to 50 prices — one week and five weeks, personal and commercial — and each one hands over its own file or its own link. A course or private podcast can have several prices too, unless it is sold as a membership: every price opens it, and a file or link on one is what that one adds. Write a few lines on what each price includes and the buyer sees them side by side; mark one as recommended and it opens chosen. The buyer picks on the card, and what they are charged is read from what you saved rather than from the page they are looking at.",
          "Your page also holds links that are not for sale, with no price and no checkout on them: the channel, the podcast, the profile, the booking page you already pay someone else for.",
        ],
      },
      {
        q: "Can I give something away for an email address?",
        a: [
          "Yes. Set a product's price to 0 and it becomes free: a visitor types their email, we send them a link to it, and when they use that link their address joins your list. Because the link has to be opened from their own inbox, every address on the list is real \u2014 no typos, and nobody signed up by someone else.",
          "Under the email field there is a box, empty until the visitor checks it, that says they want to hear from you. Your list keeps the two apart: you can download everyone who asked for something, or only the people who checked the box, as a CSV file that email tools can import. It is yours to take at any time, with nothing to ask for.",
          "Free products are handed out while your subscription or trial is on, and they do not need Stripe, because no money moves. A list holds up to 100,000 addresses.",
        ],
      },
      {
        q: "Can it write my descriptions, outlines and emails?",
        a: [
          "Yes, as a first draft. In your studio, a box under a product's name, above a course's modules and at the top of a new email takes a few words from you and fills in the product's short and long description, a course outline of up to 8 modules of up to 8 lessons, or an email's subject and body. Under your store's name and description, it suggests three lines about your store, from what it sells, to pick from.",
          "It writes in your store's language (American English for a store in English) from only what you typed and what the product is. It is told never to invent a review, a testimonial, a number of students or sales, a result, a guarantee, a discount or a deadline, and nothing is saved, added or sent until you press the button that does it. Read it before you publish: it goes out under your name.",
          "Each store gets 20 drafts a month on the free trial, 100 on Creator, 400 on Pro and 1,000 on Scale, shared by all the writing help, and a draft that fails is not counted. Translating a whole sales page takes one for every 4,000 characters of it, and says how many before it runs. The drafts are written by Anthropic's Claude, which receives what you typed, the product's name, price and kind, and your store's name, and nothing about your buyers, members or list.",
        ],
      },
      {
        q: "Can I sell a private podcast?",
        a: [
          "Yes, on the $29 plan. Under a paid product in your studio, choose \u201cSell this as a private podcast,\u201d then put out episodes as MP3 or M4A files. It can be sold once or as a membership, and goes on sale with its first episode.",
          "Each buyer gets a feed of their own, from the thanks page, their confirmation email or their list of purchases, and adds it to Apple Podcasts, Overcast, Pocket Casts or most other apps in one tap; new episodes arrive there like any show's, within about four hours of going out. Spotify does not take private feeds. Every time an episode is fetched, we check that the buyer still has the podcast, so a refund or a membership that ends stops every episode from playing within minutes; the list of episodes in their app empties within about four hours. Podcast directories and search engines are told to keep out.",
          "A podcast app checks its feed about once an hour whether or not anybody is listening, so each subscriber counts as one visit to your store on a day their app checks, however often it does.",
        ],
      },
      {
        q: "Can I run a sale, like Black Friday?",
        a: [
          "Yes, on the $29 plan. In your studio, under \u201cA sale across the store,\u201d pick a percentage, when it starts and ends (at most 31 days), and whether it covers every product it can or only some. While it runs, your store and each product's page show the old price crossed out, the new one and when it ends, and Stripe takes it off at checkout with no code to type.",
          "It ends by itself at the time you set: the prices go back, and the discount stops working at Stripe too. It covers products bought once at one price. Memberships, calls, products with price options or a price the buyer chooses keep their price, and on a product with a payment plan the sale price is for paying in full, as its page says.",
        ],
      },
      {
        q: "Can my buyers give something as a gift?",
        a: [
          "Yes, on any paid product bought once that hands over a file, a link, a course or a bundle. Under the buy button on its page there is \u201cBuy it as a gift\u201d: the buyer types the recipient's email, their own name and a message, and pays on Stripe's page as for anything else, on your own Stripe account.",
          "The recipient gets one email with the buyer's name, the message and a link to open it. It is theirs on their own address, as if they had bought it: the download, the course with its modules opening from the day it was paid, the community it opens. The buyer gets the receipt and does not get a copy. A full refund takes the gift back within minutes.",
          "A product with price options can be given at any of them: the buyer picks which one, pays that price, and that option is what the recipient owns. Memberships, calls, a price the buyer chooses and license keys cannot be given.",
        ],
      },
      {
        q: "Can buyers in poorer countries pay less?",
        a: [
          "Yes, if you switch it on, for the countries you choose, at the level you choose and on the products you choose. In your studio, under \u201cFair prices by country,\u201d check the box. It is off on every store until its creator turns it on.",
          "Then pick how. Automatic: every country gets what the World Bank's price levels for 2024 suggest, up to the most you allow (20% to 60% off), and you can change or remove any country. India, for example, gets the most you allow; Brazil and Mexico about half off; the United States, Canada, the UK, most of Western Europe, Australia, Japan and the other high-income countries nothing. Or only the countries you list, each at its own level from 5% to 90% off.",
          "A buyer in one of those countries sees your price lowered with a line saying why, and pays that on Stripe's page with no code to type. It covers products bought once at one price, the same ones a sale covers: every one of them, or only the ones you pick, so a small file can keep its price while a course is lowered. When a sale is running, the larger of the two comes off, never both. One thing to know: the country comes from the internet connection, so somebody using a VPN can be shown another country's price, and the card's country is not checked before paying. The levels you set are what that can cost you.",
        ],
      },
      {
        q: "Can my store have a blog?",
        a: [
          "Yes, on every plan. In your studio, open Blog and write a post: a title, then plain text where a blank line starts a paragraph, a line starting with \u201c## \u201d is a heading and one starting with \u201c- \u201d is a point in a list. Publish it, or keep it as a draft that only your studio shows. Each post can end on one of your products, with its card.",
          "Posts are at your store's address followed by /blog, each with its own address in words, its own title and description for search engines, and the blog has an RSS feed at /blog/feed.xml. Your store page links to the blog once a post is published. A blog holds up to 200 posts of up to 20,000 characters each, and AI can draft one from a few words about the topic.",
        ],
      },
      {
        q: "Can my store speak another language to my buyers?",
        a: [
          "Yes: English, Spanish, French, German, Italian, Dutch or Portuguese (Portugal). In your studio, under \u201cYour store\u2019s language,\u201d pick one and press Save. Every store speaks English until its creator picks another. Drafts written with AI come in the language you pick, and a sales page written in another can be translated into it with AI in one step.",
          "From then on your buyers read it everywhere: your store and product pages, Stripe's checkout, the page after paying, their purchases, bookings, courses, memberships, your community, and every email your store sends them, with dates, numbers and prices written that language's way. Your studio stays in English.",
          "What you write yourself is shown exactly as you wrote it: product names, descriptions, lessons, posts and emails you compose. Write them in the same language, so a page never mixes two. One store speaks one language; a page does not switch by each visitor's browser.",
        ],
      },
      {
        q: "Can I sell a product from my own website or blog?",
        a: [
          "Yes, one product at a time. In your studio, under \u201cSell from your own website,\u201d pick the product and copy the code: a card with its picture, price, buyers' rating and buy button, or a plain button in your store's color that leads to the product's page. Paste it into a block that takes HTML, called Embed, Code or Custom HTML in most website builders.",
          "The card is drawn by us on every visit, so a new price, a sale or a sell-out shows on your site at once. Its button opens Stripe's checkout in a new tab, on your own Stripe account, and your site stays open behind it. A product with options to pick, a time to book or an email to give opens its own page instead.",
          "Give the place a name, such as blog, and sales made through that code are listed under it in your numbers, in Where the money came from. Nothing is counted as a visit and no cookie is set on your site. The whole store cannot be put inside another site, only one product per code.",
        ],
      },
      {
        q: "Can a company buy one of my products for its whole team?",
        a: [
          "Yes, and you do nothing. Under the buy button on a product's page there is \u201cBuy it for a team\u201d: the buyer types how many people, from 2 to 200, and pays once on Stripe's page, your price times that many, on your own Stripe account. A sale or a discount code comes off the same way as on any purchase, and if you switched on tax numbers and invoices, the company gets those too.",
          "Right after paying, the buyer gets one link, on the page and in their receipt, to pass on. Each person opens it and types their own email address; a link arrives in their inbox, and opening it puts the product on that address as if they had bought it: the download, the course with its modules opening from the day they took their place, the community it opens. A mistyped address takes no place, the page shows how many places are left, and it never hands out one more than was paid for. The buyer takes a place the same way.",
          "In your sales the order reads \u201c(for 5 people)\u201d. A full refund takes every place back within minutes; a partial refund takes none. It is offered wherever a gift is, except on products with a limited quantity or a private podcast. On a product with price options the buyer picks one for everybody.",
        ],
      },
      {
        q: "Can I take a waitlist before something goes on sale?",
        a: [
          "Yes, on any paid product. In your studio, check \u201cComing soon, with a waitlist\u201d under the product: its card and its page then take an email address instead of a payment, and no checkout opens. Each address is confirmed from its own inbox before it counts, and the box to hear more from you starts empty.",
          "When it is ready, press \u201cPut it on sale and tell the waitlist.\u201d It goes on sale that moment, and everyone who confirmed gets one email with its link, its price and a note from you if you write one, with the postal address US law asks for at the bottom. That is the only email a waitlist sends; afterward its addresses are deleted, and whoever checked the box is on your list.",
          "You see how many are waiting and how many confirmed. The emails go out in batches every five minutes and do not count toward your monthly email allowance.",
        ],
      },
      {
        q: "Can I sell something before it is ready, as a pre-order?",
        a: [
          "Yes, on any paid product with one price, sold once: a file, a link or a course. Mark it coming soon, then under \u201cPre-orders\u201d choose the day it is expected, from tomorrow to a year ahead, and check that you refund every pre-order in full if it does not come out. Its page then offers \u201cPre-order\u201d at its price, with the day and that promise, and the waitlist stays for whoever would rather wait.",
          "Buyers pay at once on your own Stripe account, with nothing added at checkout and no offer after it, and get a receipt with the day. Nothing opens before it comes out. When you put it on sale, every pre-order still paid is handed over at that moment and its buyer is emailed the way in; one you refunded is not. It cannot go on sale while it has nothing in it, and it cannot be deleted while pre-orders wait for it.",
          "Pre-orders stop by themselves after the expected day; set a new day to take more. Memberships, calls, bundles, private podcasts, products with several prices, a limited number, license keys or a price the buyer chooses cannot be pre-ordered, and a pre-order cannot be a gift or bought for several people. Pre-order buyers cannot leave a review.",
        ],
      },
      {
        q: "Can I sell a physical product, like a printed book or merch?",
        a: [
          "Yes, on any paid product sold once that hands over nothing else, at one price or at several for sizes or versions (S, M, L; signed or not). Under the product, choose \u201cShip it: a physical product, sent by you\u201d, then set the shipping cost per order (0 for free shipping), where it ships (the United States, the United States and Canada, the EU, Europe, everywhere Stripe ships, or only the countries you list) and, if you like, when it ships.",
          "Its page says what shipping costs and where it goes before anybody pays. Stripe's own page asks the buyer for an address in one of those countries and adds the shipping as its own line; with sales tax on, the product is taxed as goods and the shipping as shipping. The address is on the page after paying, in the buyer's confirmation email, on the sale in your studio and in your Stripe dashboard.",
          "You send it yourself. On the sale, \u201cMark as shipped\u201d emails the buyer that it is on its way, with a tracking link if you paste one, once. A limited quantity and the boxes at checkout work as on any product; a product you ship cannot also be a gift, part of a cart or bundle, have a payment plan or a price the buyer chooses.",
        ],
      },
      {
        q: "Can I sell a membership?",
        a: [
          "Yes. Any product can charge on a schedule instead of once: daily, weekly, monthly or yearly. The subscription is created on your own Stripe account, like every other charge here, so the member is your customer, in your dashboard, and we take 0% of the renewals too.",
          "Members cancel on their own. Under every membership on your page there is a link: the member types the email they pay with, we send them a link, and it opens Stripe's own page for their membership, where they cancel it themselves. It ends at the end of the period they have paid for, and nobody has to write to you or wait for you. They can change their card and see their receipts there too.",
          "A membership can start with a free trial of 1 to 90 days: the card is taken when they join, nothing is charged until the trial ends, and your page and the buyer's confirmation say so. It can also run for a set number of payments, 2 to 36, and then end by itself; the member can still cancel before that.",
          "A monthly membership can have a yearly price beside it, below twelve monthly payments. Buyers pick Monthly or Yearly in the buy box before paying, Yearly shows what it saves, and the subscription is made at that price, once a year; the thank-you page and the confirmation say \u201ca year\u201d. It is not offered beside an introductory price, on a membership with a set number of payments or several prices, or on memberships members switch between.",
          "Or it can start with an introductory price instead of a trial: what the first payment costs, or the first 1 to 12 months of a monthly membership, always less than the regular price. Your page, its button, the course page and Stripe's checkout say both prices, \u201c$5 the first month, then $20 a month\u201d; Stripe takes the difference off with a coupon on your own account, and the regular price starts by itself. It is not offered beside a free trial, on a membership with a set number of payments or several prices, or on memberships members switch between, and a come-back offer replaces it.",
          "When a membership ends \u2014 canceled, or unpaid once Stripe has stopped retrying \u2014 its file, its course and your community close by themselves, and the member is shown a page that says so, with the way to join again. While Stripe is still retrying a failed payment, they keep access.",
          "Your studio's Membership numbers page shows your monthly recurring revenue, paying members and trials, churn over the last 30 days and the share of trials that became paying, overall and for each membership, read from your own Stripe account.",
          "Members can move between your memberships, up or down, on their own. In your studio, under Membership tiers, pick 2 to 6 memberships that run until canceled at one price. On their membership page, a member then sees \u201cSwitch plan\u201d with the others, and before anything happens, the exact amount from Stripe: moving up charges the new price less what was left of their last payment, at once, to the card they pay with; moving down turns what was left into a credit taken off their next payments. What the new plan includes opens as soon as it is paid and what only the old one included closes. If the card is declined, nothing changes and nothing is owed. A member in a free trial switches without paying, and the new price starts when the trial ends. They get a receipt and you get an email. Memberships that end after a set number of payments, or have price options or pay what you want, cannot be tiers.",
          "Three things keep members, if you switch them on. A member who presses Cancel is offered a discount you choose, once, on Stripe's own page. A member can pause instead of cancelling, for up to the one, two or three months you allow: what they paid for stays open to the last day, then nothing is charged and the membership is closed until the pause ends and starts again by itself with a payment; coming back early takes a payment that day, and it works on monthly memberships, once a year each. And some days after a membership ends, somebody who agreed to hear from you gets one email with a discount to come back, and a link that opens your checkout with it applied; never somebody who already came back.",
          "One thing it cannot do, said plainly: if what you deliver is a link to somewhere else, that link keeps working, so remove the member's access wherever you actually keep it. Your Stripe dashboard is where you see who is still paying.",
        ],
      },
      {
        q: "Can I sell paid calls?",
        a: [
          "Yes. Any one-off product with a price can be sold as a call. You pick how long it lasts, your time zone and the hours you take calls on each day of the week, with up to two stretches a day. You also choose how much notice you need, how far ahead people can book, a gap between calls, and where the call happens: a Google Meet link made for each booking once you connect your Google Calendar, the meeting link you already use, or a private Jitsi Meet room made for each booking.",
          "A call can take one person at each time, or a group of up to 50. Or sell live sessions on dates you set instead of weekly hours: up to 50 dates on one product, each with 1 to 500 seats, its own length and its own link, with sales closing when you say, up to 72 hours before. Buyers see how many seats are left.",
          "The buyer sees the free times in their own time zone, picks one and pays on your own Stripe account. The time is held for them for about 30 minutes while they pay, so two people can never pay for the same time. Once it is paid, you both get an email with a calendar file, the call appears in your studio under Upcoming calls, and the buyer's thank-you page and list of purchases have the link to join.",
          "Every buyer gets a reminder a day before and an hour before, in their time zone, with the link to join; you get one for each time, listing everyone booked. A buyer can move their booking to another open time themselves, up to twice, from the link in their email, until the notice you set before the call.",
          "Your own calendars can close times too. Paste the private iCal address of up to three calendars \u2014 Google's secret address, an Outlook calendar published as ICS, an iCloud public calendar \u2014 and the times you are busy there, up to 120 days ahead, stop being offered, usually within about ten minutes. Only the busy times are kept, never a title or a guest. The other way round, your studio gives you a private calendar address that lists your upcoming bookings, for Google, Outlook or Apple Calendar to subscribe to.",
          "Google Meet links can be made for you. Connect your own Google Calendar in your studio under Video calls, then pick \u201cGoogle Meet (automatic)\u201d under \u201cWhere the call happens\u201d on a call, a group call or live sessions. Each booking then gets an event with a Google Meet link on your primary calendar, with the buyer on its guest list; a group call or a session has one event per time, with up to 200 guests who do not see one another. Google emails nobody: buyers get the link in our booking email, reminders and calendar file. A moved booking moves its event, and a full refund deletes a one-to-one call's event or takes the buyer off a group's guest list. Only the store's owner and Admins can connect or disconnect it, and the owner is emailed each time; disconnecting withdraws our access. Google has not finished reviewing our app yet, so it shows a \u201cGoogle hasn't verified this app\u201d screen when you connect: click Advanced, then continue. If a meeting cannot be made, the booking gets your own link or a private Jitsi Meet room, and we keep trying for about 16 hours; if it works more than two hours before the call, the new link is emailed to those booked, up to 20 (a bigger group keeps the link it has). On a free personal Google account, Google ends meetings of three or more people after 60 minutes.",
          "What it does not do, said plainly: apart from calls set to Google Meet, nothing is written into your calendar as an event: bookings arrive through the feed you subscribe to, which your calendar app refreshes on its own schedule, and busy times are read only from the private addresses you paste. And a buyer cannot cancel on their own: they reply to their confirmation email, which reaches you, and a refund is made from your own Stripe dashboard. Unlike on Stan, Zoom links are not made for you yet: our Zoom app is waiting for Zoom to approve it, and until then you type your own Zoom link. Jitsi Meet is a free service run by a third party, not by us; nobody needs an account to join, but the first person to open a room may be asked to sign in to Jitsi to start it, so open it a few minutes early. The call itself happens on that service; nothing is streamed or recorded here.",
        ],
      },
      {
        q: "Can I sell a package of sessions, like 5 calls booked one at a time?",
        a: [
          "Yes, on a call with weekly hours. Under the call in your studio, open \u201cAlso sell a package of sessions\u201d and choose how many sessions (2 to 20), the price for all of them, and how long the buyer has to use them: 30, 60, 90, 180 or 365 days, or no limit. The call's page then offers the package beside the single session, with what it saves when it saves anything.",
          "The buyer pays once, on your own Stripe account, and gets an email with a link of their own. Each time they open it, they pick a free time on the call's page and confirm it on Stripe's page with nothing to pay. Every session is a booking like any other: the calendar file, the reminders, the meeting link, moving it up to twice, and Upcoming calls in your studio. Their list of purchases shows how many sessions are left.",
          "A session counts from the moment its time is held; if the buyer leaves Stripe's page without confirming, it comes back within an hour. After the last day to use them, or after a full refund of the package, no more sessions can be booked; sessions already booked stay booked. A group call with weekly hours can be sold as a package too, one seat per session; live sessions on dates cannot. The box for a discount code is not shown when booking from a package.",
        ],
      },
      {
        q: "Can I offer something extra, before or after they pay, or sell a limited number?",
        a: [
          "Yes, all three. Under any one-off product you can offer up to three of your other products, each at a price of your own: the buyer sees a box above the buy button for each, checks the ones they want, and the button says the new total. None is ever checked for them. Everything checked is paid in one checkout and delivered on the thank-you page.",
          "Or offer it right after they pay: the thank-you page shows it, and one press charges the card they just used, on your own Stripe account. It only works in the browser that paid, for an hour, so a forwarded link can never charge anyone. If the bank wants the buyer to confirm, they confirm it, and nothing is handed over until the payment is through.",
          "After a product you can line up to five such offers, shown one at a time: a funnel. For each one you choose where yes leads and where no thanks leads, so a no can meet the same product for less. Each offer has its own headline, text, picture and price, never above what that product costs on its own, and each one taken gets its own confirmation email. Offers after paying are shown only to buyers who paid by card, Apple Pay or Google Pay, and while sales tax is on, they are paused. Before the checkout, a sales page or a landing page for something free can lead the way, but there is no editor that chains pages into one funnel.",
          "You can also limit how many of a product can be sold. Your page shows how many are left, counted from real payments, and stops selling at zero. A buyer who is paying right now holds one for about 30 minutes, so the last one is never sold to two people; if they do not pay, it comes back.",
        ],
      },
      {
        q: "Can buyers put several products in a cart?",
        a: [
          "Yes, on every plan, once two or more of your products could go in one. Each product's card and page then shows \u201cAdd to cart\u201d under its buy button, and the cart appears at the top of your store with each product at its price now \u2014 a sale or a fair price for the buyer's country already taken off \u2014 and the total. Buyers pay for up to four products in one payment, on your own Stripe account, and each is handed over exactly as if bought on its own: its download or link, its course, its license key, its place on their list of purchases.",
          "What can go in a cart: a paid product at one price, sold once \u2014 a file, a link, a course with lessons or a bundle. Not memberships, calls, products with several prices, a limited number, a price the buyer chooses or questions asked at checkout, products coming soon, or a bundle the buyer builds. A discount code box is shown only when nothing in the cart is already on sale. The cart is kept only in the buyer's own browser, and emptied once paid. With checkout reminders on, a cart left at its checkout gets the same one reminder a product does, naming everything in it with a link that puts the cart back as it was.",
          "\u201cBuy more, save more\u201d, in your studio next to your sale and fair prices, takes a percent you choose, from 5% to 50%, off every product in a cart once it holds 2 or more (or 3, or 4, as you choose), on top of any sale or fair price. Every \u201cAdd to cart\u201d then says so, the cart tells the buyer how many more it takes, and shows what the deal took off before they pay. It is off until you switch it on, and the order records the percent, so your numbers and any refund add up.",
        ],
      },
      {
        q: "Can I sell a bundle of products?",
        a: [
          "Yes, on every plan. Make a product the bundle, give it a price, and choose 2 to 20 of your one-off products to go in it: those with one price and a file, a link or a course with lessons. The buyer gets every one exactly as if bought on its own \u2014 its download or link, its course, its license key, its stamped PDF, its place on their list of purchases and the right to review it \u2014 and your community, if one of them opens it. Your store shows what the products cost on their own next to the bundle's price, worked out from their prices today, only when they really cost more.",
          "What a buyer gets is written onto their order when they pay, so changing the bundle later changes it for the next buyer and nobody loses what they paid for. A bundle can be offered in the box at checkout, and as an offer after paying unless it holds a course. Memberships, calls, free products, products with several prices or pay what you want, and other bundles cannot go in one, and a bundle itself has one price, charged once. Any product can also be unpublished and kept as a draft, and a draft can still go in a bundle.",
          "Or let each buyer build their own: check \u201cLet each buyer choose which ones they get\u201d and say how many, at least 2 and fewer than the bundle holds \u2014 \u201cany 3 of these 8 for $49.\u201d Its page lists the products with what each costs on its own; the buyer ticks that many, sees what those cost on their own beside the bundle's price, and gets exactly those, written onto their order. Such a bundle is bought from its own page only: not in the box at checkout, as an offer after paying, as a gift, for several people or through PayPal.",
        ],
      },
      {
        q: "Can buyers pay in installments?",
        a: [
          "Yes. Under any one-off product, offer a payment plan: two to twelve payments, weekly or monthly, of an amount you choose, adding up to at least the full price. On a product with several prices, you set what each payment is for each price, and each price shows its own payments beside it. The buyer picks between paying in full and the plan, and the button says what is charged today.",
          "They get the product after the first payment. The rest are charged to the same card on your own Stripe account, and the plan's end date is set as soon as the first payment is through \u2014 and checked again every day for anyone who paid and closed the page \u2014 so no buyer is ever charged one payment more than they agreed to. A plan is not a membership, so it is not canceled from your page; a buyer who needs to change something replies to their order confirmation email, which reaches you.",
        ],
      },
      {
        q: "Can the buyer choose the price?",
        a: [
          "Yes, on a product with one price, sold once. Your price becomes the minimum \u2014 at least $1, or the smallest price in your store's currency \u2014 and you add a suggested price, which is already in the box on Stripe's page. The buyer types what they want to pay, and Stripe refuses anything under the minimum.",
          "It does not mix with a membership, price options, a payment plan, the box at checkout, a call or discount codes: the buyer already names the price. A one-click offer after paying, a limited quantity, sales tax and a course all work with it.",
        ],
      },
      {
        q: "Can I ask buyers something before they pay?",
        a: [
          "Yes. Up to three questions on any paid product, shown on Stripe's page under the card: a short answer, a number, or a list to choose from, each required or optional. Or the buyer's phone number, in Stripe's own phone box with their country, which is always required. The answers are in your list of sales and in your Stripe dashboard, and for a call they are in your booking email too.",
          "There is no phone-number or checkbox question, and nothing is asked for a free product, which never reaches Stripe.",
        ],
      },
      {
        q: "Does a buyer who leaves the checkout get a reminder?",
        a: [
          "If you switch it on, and only if they agreed. Stripe's checkout asks the buyer whether they want to hear from you; a buyer who said yes and left without paying gets one email about an hour later with a link back to the product. One per checkout, at most one per buyer and product in a week, and none to anyone who has paid for it since.",
          "It is off until you switch it on, needs your postal address, and needs a Stripe account in the United States, because Stripe asks for that consent only on checkouts of US businesses. While it is on, a checkout left open closes after an hour instead of Stripe's usual day. For a call or a live session, the time the buyer picked goes back on sale when its checkout closes, so the reminder names that time, says it was not kept, and leads to the times still open; it is not sent when none is left.",
        ],
      },
      {
        q: "Is sales tax or VAT added?",
        a: [
          "If you switch it on. Stripe Tax works out sales tax or VAT from each buyer's address, for the places where you have told Stripe you are registered, and adds it at checkout, on your own Stripe account, for one-off sales, offers at checkout, payment plans, memberships and calls. You choose whether your prices already include it or it is added on top.",
          "It switches on once Stripe says your tax setup is complete: your head office address, what you sell, and where you are registered, all set in your own Stripe dashboard. You are the seller, so filing and paying the tax stays yours, with Stripe's reports of what was collected. Stripe charges for Stripe Tax on your account at its own published price. While tax is on, the one-click offer after paying is paused, because tax cannot be added to a one-click charge.",
        ],
      },
      {
        q: "Can I see how my store is doing?",
        a: [
          "Yes. Your studio shows the last 7, 30 or 90 days, or all time: visitors, page views, checkouts started, sales, revenue and conversion, renewals of memberships and payment plans apart from new sales, where your visitors came from, and each product and link on its own line, with how many times each product's page was opened and how many sales every 100 of those views brought. Sales, visits day by day and sources each download as a CSV file; a sales file holds up to 5,000 sales and says so when there are more.",
          "Visits are counted without cookies. A visitor is one person on one device on one day, told apart by a one-way fingerprint that is never stored, and your own visits while logged in are not counted. Instagram and TikTok open links in their own browsers, which hide where a visit came from, so we read the app's name instead. To follow a link of your own, add ?utm_source= and a word to it, and its visits are counted under that word; utm_medium and utm_campaign are counted too.",
          "Sales are read from your own Stripe account, not counted by us: new purchases and new members, before Stripe's fee and any refund. Renewals are in your Stripe dashboard.",
        ],
      },
      {
        q: "Can I add my Meta, Google, TikTok or Pinterest pixel?",
        a: [
          "Yes, on the $29 plan. Paste the pixel ID in your studio and your store's pages tell that platform about every page view, every checkout started, every lead from a free product, and every purchase with its amount, so your ads can learn who buys.",
          "Those platforms set cookies, so visitors in the European Economic Area, the UK, Switzerland and Brazil, and anyone whose country we cannot tell, are asked first, in plain words, and nothing loads unless they say yes. Everywhere else the pixels load unless the visitor's browser sends Global Privacy Control. The ads and what they measure are yours: say in your own privacy notice that you use them.",
        ],
      },
      {
        q: "Can I sell a course?",
        a: [
          "Yes. Turn any paid product into a course from your studio and add modules and lessons. A lesson can have a video of up to 5 GB, text, up to five downloads and a link, and any lesson can be a free preview on your store. Upright phone videos stay upright.",
          "A module can open a set number of days after each student joins, and the student gets an email the day it does. Students open the course right away in the browser they paid in, and on any other device with a link sent to the address they paid with, so nobody makes a password. Your studio shows who opened it and how many lessons each marked done, and you can take a student off the course.",
          "Any lesson can end with a quiz: up to 20 questions, each with one right answer or several (or drafted with AI from the lesson's text, for you to read, change and save), a pass mark, a number of tries, and if you want, later lessons locked until it is passed. It is marked on our side, so the answers are not in the page. Switch certificates on and a student who finishes gets one in the name they type, with a page of its own on your store that anyone can open to check it; they download it as a PDF file or print it, add it to their LinkedIn profile with LinkedIn's form filled in, or share it in a LinkedIn post, where its link shows a picture of the certificate.",
          "Under every lesson, students can ask questions and answer each other, under a name they choose; their email address is never shown, and only the course's students and you can read what they write. You answer as the creator from the lesson itself or from the course's page in your studio, the student gets an email with your answer, and your phone can tell you when a comment comes. You can hide or delete any comment, or switch comments off for the course without deleting them.",
          "The course can be sold once, in a payment plan, or as a membership that stays open while the member pays.",
          "Lesson videos are covered for 400 hours watched a month across your store, counted by the player as your students watch. Past that it is $0.03 for each hour watched, on your next invoice, and a student is never cut off for it. A store with no paid plan has nothing a charge can be added to, so its lesson videos pause past its hours until the plan is paid or the month turns: 400 hours a month in the free trial, and 10 hours a month before a plan starts and after one ends.",
          `Captions can be uploaded as a .vtt or .srt file in any of 28 languages, or written by AI from what is said in the video: in the language spoken and up to two more, ${dollars(CENTS_PER_MINUTE)} a minute of video for each language, never less than ${dollars(MIN_CENTS)} a request. The price is shown before you confirm and charged then to the card your plan is paid with; anything not delivered within ${GIVE_UP_HOURS} hours is refunded. Read them before your students rely on them: a machine wrote them.`,
        ],
      },
      {
        q: "Can my store have pages besides its products, like an About page?",
        a: [
          "Yes, on every plan: up to 10 pages of your own, from Your pages in the studio. Each is built from the same blocks as a sales page (a headline, text, pictures, a video, steps, who it is for, questions, things said about you elsewhere, your products, a countdown and buttons) and follows your store's look.",
          "A page has its own address under your store, such as /@yourname/about, and on your own domain, such as yourname.com/about. Its buttons lead to your store, or to one product you choose. Put it in the menu at the top of your store and of your other pages, or keep it out of the menu and share its link. A new page stays out of sight until you switch it on, or until a moment you set.",
        ],
      },
      {
        q: "Can I email the people on my list?",
        a: [
          "Yes, on Pro. From your studio you write one-off emails to everyone who agreed to hear from you, or only to those who got one product, and send them now or at a time you choose. Sequences go out by themselves: a welcome when someone joins, a few emails in the days after someone buys. Each person goes through a sequence once. A sequence can end for anyone who buys, or gets one product, so it stops selling to people who already have it; and any of its emails can go only to those who have a product or do not, who have bought or not yet, or who carry a label from your import, the others skipping it or leaving there. An email can also go only to those who used a link to your store in the email before, or did not: that is counted only for readers who allowed it, with a box of its own when they joined, and they can stop it from any email. There is no open tracking. AI can write a sequence's emails for you, 3 to 7 of them, from your products' names, prices and links, with only your store's own links kept; you read them and save. And when a product gets a new version, “Tell buyers about an update” under it emails everyone who bought it, once a week at most, with your words and the link to their orders.",
          "Only people who agreed are ever written to: those who checked the box when they got something free or bought from you, and those you import, where you confirm each time that they agreed. Every email carries a one-click unsubscribe, why the reader is getting it and your postal address, which US law requires; anyone who leaves is never written to again, whatever a later import says.",
          `An address that cannot be delivered to, or whose owner reports an email as spam, is taken off your list by itself. ${healthRuleWords()} Nothing waiting is lost. ${rampRuleWords()}`,
          `Emails go out under your name, and replies come to you. Pro sends up to ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} a month, one-off emails, sequences and community announcements together; during the free trial a store sends up to ${TRIAL_MONTHLY_EMAILS.toLocaleString("en-US")}, and the full ${PRO_MONTHLY_EMAILS.toLocaleString("en-US")} opens with the first payment. Your list stays downloadable as a file at any time.`,
          "An email can carry up to six pictures, each added under its box where the cursor is, with what it shows for readers who cannot see it. Each is made smaller on your device, kept as a JPEG on this site so every mail app shows it, and stays for as long as your store does, so an email opened years later still has it.",
          "Someone on your team with the Editor role can write drafts, up to 20 per store; you or an Admin read them and send them. And, if you switch it on, one email asks each buyer for a review, 3 to 30 days after buying, counted in the same monthly emails.",
        ],
      },
      {
        q: "Can I send my list to Mailchimp, Kit, beehiiv or MailerLite?",
        a: [
          "Yes, on every plan. Paste an API key from your account on the platform, pick the audience, form, publication or group, and choose who is sent: free sign-ups once they confirm, buyers of every product or of some, with up to three tags per product. Only people who agreed to hear from you are ever sent, and someone who unsubscribed on Mailchimp or beehiiv is never subscribed again.",
          "The key is checked, encrypted and kept; your studio shows only its last four characters, and disconnecting deletes it. What is sent is an email address, a first name when there is one, and the tags. One platform per store; it only adds people, reads nothing back, and does not send those who joined before you connected it, so download your list and import it for them. Stan's help center, read on September 28, 2026, connects Mailchimp, Flodesk and AWeber through Zapier; here Mailchimp, Kit, beehiiv and MailerLite are built in, with no Zapier.",
        ],
      },
      {
        q: "Can buyers leave reviews?",
        a: [
          "Yes, and only buyers can. A review is written from the thank-you page, the buyer's list of purchases or the one email that asks, and each of those first checks the order on your own Stripe account: paid, and not refunded in full. One review per buyer and product, 1 to 5 stars, up to 1,000 characters and one photo if they like (made smaller on their device before it is sent), under the name they choose or \u201cVerified buyer\u201d; their email is never shown.",
          "You can answer a review in public, hide one and take its photo off, but you cannot change a word of it or delete it. Hiding takes its words off the page but never its stars out of the average, and the page says how many are hidden. A refund in full takes its stars out. Booked calls and free products are not reviewed. On Stan, according to its help center, read on September 28, 2026, reviews are added by the creator, and customers cannot write one.",
        ],
      },
      {
        q: "Can I build a sales page or a landing page?",
        a: [
          "Yes, on every plan. Any product's own page can be built from up to 30 blocks: a hero with the product's picture or a video from YouTube, Vimeo or Loom (beside the words, centered, or the picture behind them, with a button if you want), your own pictures (up to 24 on a page, each with a description for people who cannot see it that AI can write from the picture), text, benefits, what is inside, a picture beside text, who it is for and who it is not for, how it works, a comparison table, bonuses, a card for another of your products, numbers your store counts by itself (lessons, buyers, the average rating), things said about it in public elsewhere (each with a link to where it was said, so visitors can check it), about you, questions, your guarantee, a countdown, buttons and reviews. Start from another of your products' pages (its blocks and words are copied, its pictures stay with it), from one of six templates, from a draft written with AI (which, for a PDF, can read its first ten pages first, so what is inside comes from the real contents), or from nothing, and drag the blocks into the order you want. Translate the whole page with AI into any of the store languages in one step; names, numbers and prices stay as they are, and nothing is saved until you press Save. Add a block from a gallery grouped by what it does, at the end or right between two others, keep one to phones or to computers and tablets, or duplicate one to start the next from it. The page as it was before each of your last five saves is kept for 30 days under Earlier versions, so a save can be taken back; while you edit, Undo and Redo (Ctrl+Z and Ctrl+Shift+Z) go back and forward a step at a time. On a wide screen the page is drawn beside its blocks, as visitors will see it on a phone, and redrawn as you type; press a part of it to open that block. In the reviews block you can pick up to three of your buyers' verified reviews to show first; each is marked as picked by you, and the average and the count stay those of every review. Keep it from visitors while you work on it (they see the product's plain page) and show it when it is ready, or have it show by itself at a moment you set. Choose its style: plain, in bands (every other section on a soft wash of your store's color) or in cards. It has its own title and description for search engines, and a share picture drawn from the product's picture, name, price and stars. For a free product the page asks for the email, and afterward can show one of your paid products next.",
          "You can also have visitors' questions answered on the page. Switch on \u201cAnswer buyers' questions with AI\u201d in your studio and each product page gets a box, \u201cA question before you buy?\u201d The answer comes only from what that page says and from your own notes, in the visitor's language, and it never states a price, a refund, a deadline or a result that is not there. When the page does not say, the visitor is told so and the question is listed in your studio, with nothing about who asked. A store gets 500 answers a month on Creator, 2,000 on Pro and 6,000 on Scale; past that the box closes until the next month and nothing is charged.",
          "Under each block of words there is \u201cImprove with AI\u201d: Clearer, Shorter, More specific or Warmer, in your store\u2019s language, with Undo. An empty block of benefits, who it is for, how it works or questions gets \u201cWrite it with AI\u201d: a first draft from your product\u2019s description and the rest of the page, never a refund promise, your story, bonuses or what is inside, which only you can say. It rewrites only your words and keeps the block\u2019s shape; a rewrite that brings a number or a promise your page does not already make is thrown away, and not counted.",
          "Above the blocks, the page coach gives the page a score out of 100 and lists what is missing, most important first, each with a button that adds the block. It also shows where most readers stop. With the writing help on, \u201cReview my page\u201d reads the page as visitors do and says what to change first, drafts three headlines (use one, or test it against yours), who it is for and not for, and the questions your page leaves open; nothing changes on your page until you press a button, and nothing is live until you save.",
          "Under the page editor of anything paid, \u201cAfter paying: a note from you\u201d puts your own words on the thank-you page, under what was bought, and in the confirmation email: what to do first, a welcome video from YouTube, Vimeo or Loom, and one button to an https page of yours, like your group or a booking. The button opens in a new tab with the site it leads to written under it.",
          "To test the whole page, press \u201cMake version B\u201d under the coach: version B starts as a copy of your page, and you change anything in it \u2014 blocks, their order, words, pictures, video \u2014 switching between Version A and Version B as you edit. Once saved, half your visitors read each, kept to the same one by a cookie. When each has been seen 200 times and one brings clearly more people to the checkout (95% confidence), your page shows that one to everybody by itself; the studio shows each version's views and checkouts, and \u201cKeep version A\u201d or \u201cKeep version B\u201d ends the test when you save. A page runs one test at a time, the price is the same for everyone, and changing either version starts the count again.",
          "A countdown runs to one moment you set, the same for every visitor and shown in their own time zone. It never starts again for each visitor, and it disappears once the moment has passed, so it can only count down to something real.",
          "Every block is plain text and your own pictures in your store's theme and letters and one of three page styles: no custom code or stylesheets. A button leads to the checkout the store already has, so a page can never state a price of its own.",
        ],
      },
      {
        q: "Can I run a community or a webinar?",
        a: [
          "A community, yes, one per store. You choose which products open it: any paid product, a membership while it is being paid for, and free products if you want. Members come in with a link emailed to the address they bought with, and that browser stays in for 90 days. Who bought what is checked against your own Stripe account on every visit, so a membership that ends loses access within five minutes.",
          "Inside: up to 20 spaces, each open to the whole community or kept for the buyers of the products you choose; posts with a title, up to 5,000 characters and one picture, which can be edited after they are written; polls of up to 12 answers; comments and one level of replies; likes on posts and comments; and up to three pinned posts and a Start here post. Members mention each other with @, and are told when somebody mentions them, comments on their post or answers their comment, in the community and, if they allow it, as a notification on their computer or phone (on iPhone, once the page is added to the home screen, as Apple requires).",
          "There is a room for talking live, which you can slow down, keep for your own messages, or close. Members can write to you privately, and to each other if you allow it, with a first message that waits to be accepted if you choose. One search box looks through the posts and every comment under them, the lessons of the courses a member has, the events, the people in the directory, the room and the member's own messages.",
          "You can ask up to three questions every member answers once, before their first post or comment, and only you read the answers; and send a welcome message privately, from you, the first time each member comes in.",
          "Every like a member's post or comment gets from somebody else is one point, and points make 9 levels, shown beside every name, with a leaderboard for 7 days, 30 days and all time. You can open a space for posting only from a level, and have a level hand over one of your courses, free; it stays the member's if their points fall later.",
          "Members choose the name they are seen by and whether to appear in the directory; other members never see their email address. They can report a post or a comment, and you hide or delete it, mute a member or take them out. Your announcements can also go by email to members who asked for them, on Pro.",
          "It also holds live events members RSVP to, with reminders, a private video room in the event's page or your own link, and replays \u2014 the next answer has the details. A webinar you want to sell to anyone, not only to members, you sell as a live session on the dates you set, with up to 500 seats each.",
          "What it does not have: search does not listen to what is said inside a video, only to titles and written text. Stan adds webinars to its community with Zoom or Google Meet links made automatically; ours makes Google Meet links once you connect your Google Calendar, and no Zoom links yet.",
        ],
      },
      {
        q: "How do live events in the community work?",
        a: [
          "From the community in your studio you schedule an event: a title, a few words, a start in your time zone and a length from 15 minutes to four hours, up to a year ahead, with an announcement in the feed if you want one. Up to 50 can be coming up at once, and up to 500 are kept with their replays. Members RSVP with one click, and you can cap the places at anything from 1 to 5,000. An event can be for every member, or only for the buyers of some of the products that open the community; the others see it but cannot RSVP or join.",
          "The way in shows on the event's page from 15 minutes before the start until the end, only to members who may come \u2014 and, with a cap, only to those with a place \u2014 checked again on every visit. It is a private Jitsi Meet room made for the event, which members open inside the page or in a tab of its own, your own meeting link, or a Google Meet made on your connected Google Calendar: one meeting with nobody on its guest list, so members ask to join and you let them in. Emails, calendar files and the feed point to the page, never to the room. Members who asked for the community's emails get a reminder a day and an hour before; a move or a cancellation is emailed once to everyone coming; and, if you have turned on phone notifications, you get one 15 minutes before. After it starts you can add a replay from YouTube, Vimeo or Loom.",
          "What it does not do: unlike Stan's webinars, it does not make Zoom links for you yet. On a free personal Google account, Google ends meetings of three or more people after 60 minutes. Jitsi Meet is run by a third party, and the first person to open a room may be asked to sign in to Jitsi to start it, so open it a few minutes early. Jitsi publishes no size limit for its free rooms, and big video calls there get unsteady, so for more than a few dozen people use your own meeting link. Nothing is streamed or recorded here, there is no chat beside the room and no waiting list, and an event is not sold on its own: to sell seats, sell live sessions on dates.",
        ],
      },
      {
        q: "Can I run an affiliate program?",
        a: [
          "Yes. Switch it on, set a commission of 1% to 90% for the store or product by product, and a window of 1 to 90 days after a click. People apply on your store's affiliate page with an email address they confirm, and you approve them; or you let everyone who buys take their own link at once, from the thanks page or their purchase email, without applying. Each gets a link and a page of their own with their clicks, sales, what they earned and what you paid them; they never see who the buyers were. Up to 1,000 people, applications included. You can give one affiliate a share of their own, 1% to 90%, which replaces the program's on every product except those set to 0%; and each affiliate can choose, on their own page, the PayPal address they are paid at.",
          "The part to know first: the money is yours, and so are the payments. Every sale lands in full in your own Stripe account and we never hold any of it. Connect an app from your own PayPal Business account, with PayPal's Payouts switched on, and your studio pays everyone owed from your PayPal in one press \u2014 or by itself on the payday you set, with an email saying what was sent. Each affiliate is paid at the email address they joined with; the book says paid once PayPal confirms it, anyone PayPal cannot pay stays owed, and nobody is sent twice. PayPal charges you its own fee on each payment. A PayPal account in Brazil can only send these payments in reais, to Brazil, so it cannot pay through us. Without PayPal, download the batch for PayPal or Wise, or pay however you agree, and mark it paid. On Stan, affiliates are paid out of your sale, which Stan holds for 7 business days first.",
          "Commission is worked out on what was paid before tax, and a refund on your Stripe account cancels it or reduces it. One-off sales and booked calls earn commission; memberships and payment plans do not. The last affiliate link a buyer followed wins, and nobody earns on their own purchase.",
          "To be found by people looking for something to promote, check \u201cList my program in the affiliate directory\u201d and save. Your program is listed at marktmorgen.com/affiliate-programs while your store can take payments and has a product that earns: your share, how long a click counts, your payment day and up to four products, each with what one sale earns at today's price. A second box, \u201cShow my program's numbers there too,\u201d adds your program's own figures: how many affiliates you have and since when, the clicks they brought, the sales those clicks made, what they earned before refunds and what you recorded as paid, with the share of clicks that became a sale and what 100 clicks earned once there are 100 clicks. Programs are listed by the highest share, then by how many products earn, then by name; nobody pays to be placed higher. Uncheck it and save, and it leaves the page at once. Every affiliate is asked, on your program page, on their own page and in the email that approves them, to say they earn from the link wherever they share it and to promise only what the product does. Approved affiliates can also have three posts drafted on their own page, for X, Instagram and LinkedIn, from the page of a product they pick, in your store's language; each ends with their link and a line saying they earn from it. Up to 3 a day each, each one of your writing jobs for the month and never more than a quarter of them together; switch it off under \u201cDraft posts for my affiliates.\u201d",
        ],
      },
      {
        q: "Can I connect Zapier, Make or my own server?",
        a: [
          "Yes, with webhooks. Add up to five https addresses in your studio and choose the events each one hears: a sale, a membership started or canceled, a lead confirmed for a free product, a call booked or moved, and a refund. Each message is JSON, signed with an HMAC-SHA256 in its Marktmorgen-Signature header, and tried again over about forty hours if the address does not answer. Your studio keeps a log of the last deliveries for up to a week, and a button sends a test.",
          "There is no Marktmorgen app in Zapier's directory: in Zapier, use Webhooks by Zapier with a Catch Hook. Events read from your Stripe account can take up to about five minutes to arrive.",
          "To read your store from your own tools instead — your list, your community's members, a course's students, your affiliates and your bookings — make an API key in your studio, on every plan. The API reads and changes nothing; the developers page lists every address and what it returns.",
        ],
      },
      {
        q: "Can I sell software with license keys?",
        a: [
          "Yes, on any paid one-off product that is not a membership, a call or a course. Upload the keys your own system made, up to 10,000 at a time, or have them made here in a shape you set. Each buyer gets one no one else has, on the thank-you page, in their email and in their list of purchases, and you are emailed when the pool runs low.",
          "Your software can ask a public address whether a key is valid, revoked or unknown; the answer says nothing about who bought it. There is no activation or seat counting: revoking a key is a record your software has to check.",
        ],
      },
      {
        q: "Can I put the buyer's email on a PDF?",
        a: [
          "Yes. Switch on stamping for a product, and every page of the PDF a buyer downloads carries one line along the bottom with their email, the date and their order. It discourages sharing; it does not stop it, and it is not copy protection. PDFs up to 50 MB are stamped; a bigger one, or one locked with a password, is handed over as uploaded and your studio tells you. Say on the product that the buyer's email is printed on it.",
        ],
      },
      {
        q: "Does it work on a phone?",
        a: [
          "That is the case it is designed for. Your store installs to the home screen on both iPhone and Android as an app of its own, with its name, its icon and its color, straight from the browser, with no app store in between. It opens on your store, not on ours.",
          "Your studio installs the same way, and from it you can turn on notifications of every sale, booking, community report, affiliate application, live event about to start and comment under a lesson, on Android and on a computer, and on iPhone and iPad with iOS or iPadOS 16.4 or later once it is on the home screen. It is not an app from the App Store or Google Play; Stan has a native iPhone app, and we do not.",
        ],
      },
      {
        q: "Can I use my own domain?",
        a: [
          ...(isDomainsConfigured()
            ? [
                "Yes, on Pro. In your studio, type the domain you own — shop.yourname.com, or yourname.com — and we show you the two records to add where you bought it: one that sends visitors to your store, and a TXT record that proves the domain is yours, so no other store can use it. When they show up, your store opens on that domain, with its certificate handled for you. Your marktmorgen.com address keeps working too, and if Pro ends, visitors to the domain are sent there.",
              ]
            : ["Not yet. It is next on the list, on Pro, and this page will say so on the day it works."]),
        ],
      },
      {
        q: "Can I change my store address later?",
        a: [
          "Yes, whenever you want, from your studio. Nobody has to be asked and there is nothing to wait for.",
          "Your store does not move: same page, same name, same description, same products. Only the address changes.",
          "Every address your store holds keeps working and sends people to the current one, so the link already in your bio, in old posts and in messages other people sent still leads to you. A store holds up to ten addresses at once. When it is full, you can still go back to one you already had; for a new one, let an old one go first. An address you let go stops working at once, leads nowhere for 30 days, and after that anyone may take it, so only let go of one you are sure was never given to anyone.",
        ],
      },
    ],
  },
  {
    id: "delivery",
    emoji: "📦",
    title: "Files and delivery",
    blurb: "What happens in the seconds after someone pays.",
    tone: "bg-pink-brand/10",
    items: [
      {
        q: "How does the buyer get the file?",
        a: [
          "On the screen, immediately after Stripe confirms the payment. There is no waiting for an email to arrive before they can open what they bought.",
          "An email follows anyway: every buyer gets a confirmation from your store's name, with what they bought, what they paid and the way back to it, and replies reach you. It goes out once, even if the buyer closed the page before it loaded. A booked call gets its own confirmation instead, with the time and a calendar file.",
        ],
      },
      {
        q: "Does the download link expire?",
        a: [
          "Yes. The link on the thank-you page works for three days and is tied to that order, so a link that leaks does not turn into a free copy for everyone. A large file is fetched through a signed link that expires in minutes, and where a file is stored is never shown.",
          "A buyer who loses it does not lose what they paid for, a week or a year later. At the bottom of every store page there is \u201cBought something here? Get it again\u201d: they type the address they paid with, and we email that address a link to a page with everything it bought from that store, up to the 40 most recent purchases \u2014 downloads, links and courses \u2014 ready to open again. No account, no password.",
          "The list is read from your own Stripe account each time it opens, so a sale you refunded in full, or a membership that has ended, is not on it, and its download stops working. The page answers the same whether or not the address bought anything, so nobody can use it to find out who your customers are.",
        ],
      },
      {
        q: "A buyer says the file never arrived. What now?",
        a: [
          "Send them to \u201cGet it again\u201d at the bottom of your store page, at your store address followed by /orders \u2014 they type the address they paid with and a link to everything they bought arrives in their inbox. That answers most of these without you doing anything.",
          "If it still does not appear, check the payment in your own Stripe dashboard: a payment that did not complete is the most common cause. If Stripe shows the payment succeeded and the file still did not arrive, email us with the order details and we will look at it with you.",
        ],
      },
    ],
  },
  {
    id: "outreach",
    emoji: "🤝",
    title: "Outreach",
    blurb: "Writing to a business that could sponsor you, sell for you or buy from you.",
    tone: "bg-lilac",
    items: [
      {
        q: "Can my store help me find sponsors and partners?",
        a: [
          `Yes, one business at a time. In your studio, Outreach takes the website of a business you name and what you would offer it. We read that website for an address the business prints there itself, write a short email from what you typed and what its own site says, and open it as a draft in your own Gmail or mail app. You read it, change it and press Send yourself. Nothing is ever sent from our side, and nothing goes out that you did not read.`,
          `It is for three things: a brand that would sponsor you, somebody with an audience who would sell your product for a share, and a company that would buy what you make. It is on every plan and uses the same monthly drafts as the other writing help: 20 on the free trial, 100 on Creator and 400 on Pro.`,
          EXPECTATION,
        ],
      },
      {
        q: "Who can I write to, and what are the rules?",
        a: [
          `Businesses only, never a private person, and only at an address that business published on its own website. An address found anywhere else is not used, and we keep which page printed it and when, so you can show where it came from.`,
          `For businesses in ${OPEN_COUNTRIES_WORDS}, where the law allows a first email to a business. For the United Kingdom and Sweden that means companies, not sole traders; and for the United Kingdom, Ireland, France and Sweden, only an address that names a desk, like partnerships@ or hello@, not a person. Germany, the Netherlands, Spain, Italy and Poland ask for the business's consent first, so nothing is written there, and for every other country we have not read the law yet, so nothing is written there either.`,
          `Every email ends with your name, your store address and your postal address, where the address was found, and a line saying that a reply stops it, with a link the business can press to stop it without you. Those lines are not yours to remove: each is something the law asks for. A page that says it does not want proposals is not written to. You can write at most ${PITCHES_PER_DAY} a day, and to the same business once in ${REPITCH_DAYS} days. When a business asks you to stop, one press in your studio records it, or the business presses its own link, and your store can never write to it again.`,
          "This is not legal advice, and the email is yours: you are its sender. If you are unsure whether you may write to somebody, do not.",
        ],
      },
      {
        q: "I run a website and saw MarktmorgenOutreach in my logs. What is it?",
        a: [
          `It is the reader behind Outreach. A creator typed your website's address because they want to propose something to your business, and we read up to ${MAX_PAGES_READ} pages of it, once, to see what you do and which address you publish for being written to. It follows your robots.txt: a path you disallow is not read, and “User-agent: MarktmorgenOutreach” with “Disallow: /” keeps it out entirely.`,
          "It does not crawl, does not come back on a schedule and does not build a list: what it read is kept only with the one email that creator wrote. No email is sent by us; the creator sends it from their own mailbox. If one reached you and you would rather it had not, press the link at the end of it: one button closes your business to that store, and a second closes it to every store here, for good. Or reply to the creator and say so: their studio has a button for exactly that.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    emoji: "🔒",
    title: "Your data",
    blurb: "What we keep, and how to have it removed.",
    tone: "bg-amber-brand/12",
    items: [
      {
        q: "What do you store about me?",
        a: [
          "For your store: the email address that logs you in, the store you build, and the Stripe account ID you connect. If you ask a store for something free: your email address, what you asked for, and whether you checked the box to hear from that store \u2014 kept for that store and nobody else. If you join a store's community or its affiliate program: your email address, the name you chose and what you write or earn there, for that store. If you review something you bought: your stars, your words, your photo if you add one, the name you chose and the order they came from. If you RSVP to a community's live event: that you are coming, for that event. If a store brought you over from another platform: the products it gave you, kept against a one-way hash of your address. If you are on a store's team: your email address, your role and the changes you make there. For the creator research form (“Tell us what you sell”): what you typed in it and, if you checked the box, your email address. The privacy page lists it in full.",
        ],
      },
      {
        q: "How are my store and my buyers protected?",
        a: [
          "Sales are charged on Stripe's own checkout, on your own Stripe account, and what a buyer is charged is worked out on our server from what you saved. You sign in with a link sent to your email that works once and stops working after 15 minutes, or with a passkey if you add one. Each sign-in starts a fresh session, and \u201cLog out of all devices\u201d at the bottom of your studio closes every session at once. When your Stripe account, your domain or your webhooks change, we email you saying what changed. What each role on your team may do is checked on our server for every request, the API key of an email platform you connect is stored encrypted, and reviews can be written only for orders your Stripe account says were paid.",
          "Store pages, on our address and on your own domain, the studio and signing in carry a strict Content-Security-Policy with a new nonce on every response, so text somebody typed cannot run as a script. Your ad pixels load only after consent where the law asks for it. Every request that changes something must come from this site, our cookies are HttpOnly and SameSite, and pages carry HSTS, nosniff, a referrer policy, Cross-Origin-Opener-Policy and a Permissions-Policy, and cannot be framed by other sites. Links we email point only at marktmorgen.com or your store's own domain.",
          "Files are handed over as downloads that cannot run anything in the browser. A full refund on your Stripe account closes what it paid for by itself: the download at once, the course within 10 minutes, the community within 5, and the license key within about 5; a partial refund keeps access. Checkouts are limited to 20 per 10 minutes per connection per store, and bookings and forms that send an email have limits too, so a script cannot sit on your limited stock or call times. Webhooks are signed, and calendar and webhook addresses cannot reach private networks.",
          "What it does not do: there is no two-factor sign-in, because there are no passwords, so keep your email inbox safe. On a payment plan only a refund in full of the first payment is detected, and a refunded membership closes when its subscription is canceled. If our database cannot be reached, the limits let requests through rather than stop a buyer from paying.",
        ],
      },
      {
        q: "Can I have it deleted?",
        a: [
          "Yes. Email us from the address you used and we remove what we hold about you. You do not have to give a reason.",
          "If you bought from a store or asked it for something free, that store's creator decides about its own records, and the payment itself stays in their Stripe account. Write to them first; if you write to us instead, we pass it on and tell you we did.",
        ],
      },
      {
        q: "Do you sell or share it?",
        a: [
          "We never sell it, to anyone, for any price.",
          "We share it only where running the product needs it: with Stripe for payments, with our host, database and email provider, with the store it belongs to, and with the services a creator connects. The privacy page lists each one and what it receives.",
        ],
      },
    ],
  },
];


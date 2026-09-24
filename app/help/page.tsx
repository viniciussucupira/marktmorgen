import type { Metadata } from "next";
import Link from "next/link";
import { Icon, iconFor } from "@/components/icons";
import { RevealOnScroll } from "@/components/home-parts";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { isDomainsConfigured } from "@/lib/domains";
import { HelpSearch } from "@/components/help-search";
import { CopyLink } from "@/components/copy-link";

/** An anchor for one answer, from its question. */
function answerId(q: string): string {
  return q.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const metadata: Metadata = {
  title: "Help centre — Nimbus Labs",
  description:
    "Straight answers about the store, the money, the files and what the subscription buys. If an answer is 'not yet', it says not yet.",
};

type Section = {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  tone: string;
  items: { q: string; a: string[] }[];
};

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    emoji: "🚀",
    title: "Getting started",
    blurb: "What Nimbus is right now, and what it costs to start.",
    tone: "bg-lilac",
    items: [
      {
        q: "What is Nimbus today?",
        a: [
          "You sign up, take your own store address and build the page: its name, its description, and what you sell with its price. You connect your own Stripe account, and once Stripe has cleared it your page can take a card. The money is charged on your account, not ours.",
          "You can see the whole path before signing up. The demo store has price options on a product, a Stripe checkout made on the creator account, and the file delivered the second the payment clears. You can buy from it with a test card.",
          "The mission page lists everything that is built and everything that is not, in two columns, so nobody signs up expecting the wrong thing.",
        ],
      },
      {
        q: "Can I put my own products on my store?",
        a: [
          "Yes. On your account page you write the name of the store, the line under it, and each thing you sell with what the buyer gets and the price. It is on your page the moment you save it, and you can reorder or remove any of it.",
          "A store holds up to twenty things, priced in US dollars — one price each, or up to three if you want the buyer to choose. You can also put the file itself on each one, and open it again to check it is the right one.",
          "Your page can take a card as soon as two things are true: Stripe has cleared your connected account, and your subscription is running — the trial counts. Until then the page says so plainly, to you and to anyone who opens it.",
        ],
      },
      {
        q: "What file can I sell, and how big?",
        a: [
          "Up to 5 GB, in any of these: PDF, ePub, ZIP, PNG, JPG, GIF, WebP, SVG, MP3, WAV, M4A, MP4, MOV, TXT, CSV, Markdown, Word, Excel and PowerPoint. Anything over about 20 MB is uploaded in parts, so a dropped connection costs you one part rather than the whole thing.",
          "Bigger than that, or not a file at all? Sell it as a link. You paste an https address \u2014 a Google Drive folder, a private video page, a Notion page \u2014 and the buyer is sent there the moment they pay, with the address shown on the page and kept in their receipt. There is no size limit on that, because the files stay where you already keep them.",
          "A product carries one or the other, never both, so a buyer who has paid is shown one thing to open rather than a choice.",
          "Anything that runs — a program, an installer, a script — is refused. A store that hands out software is a store that hands out malware the day an account is taken over.",
          "The file goes straight from your browser to storage that needs a key to read. It is never named or linked on your public page, and the only way it comes out is through us, after we have checked who is asking. You can open it yourself from your account page to be sure it is the right one.",
        ],
      },
      {
        q: "What does it cost to start?",
        a: [
          "Nothing to sign up. Your store address, your page, the editor and connecting Stripe are free and stay free.",
          "What the subscription switches on is the till: your page taking a card, and handing out what you give away for an email address. It is $29 a month, or $300 a year paid once, which is $48 less. Pro, which adds email to your list, is $99 a month or $948 a year. The first 14 days are free on either plan, monthly or yearly. Stripe takes your card when the trial starts and first charges it when the 14 days end; we email you a week before that charge, and if you cancel before it — one click in your studio — it is never charged. So you can put a product up and make a sale before you decide whether it is worth paying for.",
        ],
      },
      {
        q: "What will it cost?",
        a: [
          "One subscription — $29, or $99 on Pro — monthly or yearly, and 0% of your sales. The card fee your payment processor charges is paid to them, on your own account, and we never take a cut on top of it.",
          "The price is published on the home page. If it ever changes, existing subscribers are told before it applies to them.",
        ],
      },
      {
        q: "Can I switch between monthly and yearly, or between the plans?",
        a: [
          "Yes to both, from your studio. Moving up to Pro while you pay charges the difference that day, less what is left of what you already paid; going back to $29 keeps what is left of Pro as credit on your account. Inside the trial, neither charges anything.",
          "Yes, from your studio, whenever you like. Monthly to yearly charges the year that day, less what is left of the month you already paid for. Yearly to monthly keeps what is left of your year as credit on your account, and that credit pays your months until it runs out. Inside the trial, switching charges nothing.",
          "On a yearly plan we email you about a month before it renews, with the date, the amount and the link to cancel.",
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
          "Open the demo store, pick a price option and pay with the Stripe test card 4242 4242 4242 4242, any future expiry date, any three digits for the security code and any postcode.",
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
        q: "What does Nimbus take from a sale?",
        a: [
          "Nothing. 0% of your sales, with no asterisk. Our only income is the monthly subscription.",
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
          "Yes, and it is on the $29 plan — on Stan the same thing is on their $99 plan, read from their own pricing page on 20 September 2026.",
          "You pick the word, say whether it takes a percentage or an amount off, and cap how many times it can be used if you want to. The buyer types it at checkout and Stripe works out the new total.",
          "The code is a coupon on your own Stripe account, not a record of ours. So the count of how many times it has been used is Stripe\u2019s count, a code you switch off in your own dashboard is off here too, and if you ever leave, your codes leave with you.",
          "One limit, said plainly: a code comes off the payment it is typed into. On a membership that is the first charge, not every renewal for ever.",
        ],
      },
      {
        q: "Can my buyers pay with PayPal?",
        a: [
          "No. Nimbus runs on Stripe and only Stripe. Stan and Beacons both let you take PayPal as well, and on this one we are behind them.",
          "The reason is not laziness. Stripe's own documentation says PayPal through Stripe is not available to platforms that onboard other businesses to accept payments directly, which is exactly what we are. The other road is a second, separate integration with PayPal, and a second integration means a second checkout, a second refund path and a second dispute queue to keep working. We would rather have one that never breaks than two that sometimes do.",
          "Two things follow from that, and you should know them before you sign up. You need a Stripe account, in a country Stripe operates in — which covers the United States, Canada, the United Kingdom and the European Union, but not everywhere. And a buyer who has only a PayPal balance and no card cannot buy from you here.",
        ],
      },
      {
        q: "Who handles refunds and disputes?",
        a: [
          "You do, in your own Stripe dashboard, with the same tools any business has. Because the charge was made on your account, a refund is a refund you issue, not a request you file with us.",
        ],
      },
      {
        q: "What about refunds on the Nimbus subscription itself?",
        a: [
          "Ask within 14 days of a charge and we refund that charge in full, including renewals. You can cancel at any time and keep access until the end of the period you already paid for. The refund policy page has the exact wording.",
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
          "Your plan covers 200 GB of downloads a month for your store. Your account page shows what you have sent out so far, counted from the moment each download starts.",
          "If you go past it, nothing is cut off. Somebody paid you for that file and they get it — we are not going to take a sale and then break it to protect our own bill. We write to you instead, and we work it out.",
          "To put the number in scale: 200 GB is two hundred copies of a one-gigabyte course, or forty thousand copies of a five-megabyte guide, in a single month.",
        ],
      },
      {
        q: "What can I sell?",
        a: [
          "Digital files, paid calls with a calendar, and memberships that charge on a schedule. What is too big to upload, or is not a file at all, is sold as a link to where it already lives. And anything can be given away for free, in exchange for an email address.",
          "One product can carry up to three prices — one week and five weeks, personal and commercial — and each one hands over its own file or its own link. The buyer picks on the card, and what they are charged is read from what you saved rather than from the page they are looking at.",
          "Your page also holds links that are not for sale, with no price and no checkout on them: the channel, the podcast, the profile, the booking page you already pay someone else for.",
        ],
      },
      {
        q: "Can I give something away for an email address?",
        a: [
          "Yes. Set a product's price to 0 and it becomes free: a visitor types their email, we send them a link to it, and when they use that link their address joins your list. Because the link has to be opened from their own inbox, every address on the list is real \u2014 no typos, and nobody signed up by someone else.",
          "Under the email field there is a box, empty until the visitor ticks it, that says they want to hear from you. Your list keeps the two apart: you can download everyone who asked for something, or only the people who ticked the box, as a CSV that every email tool imports. It is yours to take at any time, with nothing to ask for.",
          "Free products are handed out while your subscription or trial is on, and they do not need Stripe, because no money moves. A list holds up to 100,000 addresses.",
        ],
      },
      {
        q: "Can I sell a membership?",
        a: [
          "Yes. Any product can charge on a schedule instead of once: daily, weekly, monthly or yearly. The subscription is created on your own Stripe account, like every other charge here, so the member is your customer, in your dashboard, and the renewals are 0% to us as well.",
          "Members cancel on their own. Under every membership on your page there is a link: the member types the email they pay with, we send them a link, and it opens Stripe's own page for their membership, where cancelling is one click. It ends at the end of the period they have paid for, and nobody has to write to you or wait for you. They can change their card and see their receipts there too.",
          "Two things it does not do yet, said plainly. A membership runs until the member cancels \u2014 you cannot set it to stop after six payments. And it does not take access back when somebody stops paying: if what you deliver is a link, that link keeps working, so remove them wherever you actually keep the thing. Your Stripe dashboard is where you see who is still paying.",
        ],
      },
      {
        q: "Can I sell paid calls?",
        a: [
          "Yes. Any one-off product with a price can be sold as a call. You pick how long it lasts, your time zone and the hours you take calls on each day of the week, with up to two stretches a day. You also choose how much notice you need, how far ahead people can book, a gap between calls, and the meeting link you already use.",
          "The buyer sees the free times in their own time zone, picks one and pays on your own Stripe account. The time is held for them for 30 minutes while they pay, so two people can never pay for the same time. Once it is paid, you both get an email with a calendar file, the call appears in your studio under Upcoming calls, and the buyer's thanks page has the link to join.",
          "Two things it does not do yet, said plainly. It does not read your Google or Outlook calendar, so the hours you set are the hours offered: to take a day off, change them. And there is no reschedule button: to move or cancel, the buyer replies to their confirmation email, which reaches you, and a refund is made from your own Stripe dashboard.",
        ],
      },
      {
        q: "Can I offer something extra, before or after they pay, or sell a limited number?",
        a: [
          "Both. Under any one-off product you can offer another of your products at a price of your own: the buyer sees a box under the buy button, ticks it if they want it, and the button says the new total. It is never ticked for them. Both are paid in one checkout and both are delivered on the thanks page.",
          "Or offer it right after they pay: the thanks page shows it, and one press charges the card they just used, on your own Stripe account. It only works in the browser that paid, for an hour, and once, so a forwarded link can never charge anyone. If the bank wants the buyer to confirm, they confirm it, and nothing is handed over until the payment is through.",
          "You can also limit how many of a product can be sold. Your page shows how many are left, counted from real payments, and stops selling at zero. A buyer who is paying right now holds one for up to 30 minutes, so the last one is never sold to two people; if they do not pay, it comes back.",
        ],
      },
      {
        q: "Can buyers pay in instalments?",
        a: [
          "Yes. Under any one-off product with one price, offer a payment plan: two to twelve payments, weekly or monthly, of an amount you choose, adding up to at least the full price. The buyer picks between paying in full and the plan, and the button says what is charged today.",
          "They get the product after the first payment. The rest are charged to the same card on your own Stripe account, and the plan is given its end as soon as the first payment is through \u2014 and checked again every day for anyone who paid and closed the page \u2014 so no buyer is ever charged one payment more than they agreed to. A plan is not a membership, so it is not cancelled from your page; a buyer who needs to change something replies to their receipt, which reaches you.",
        ],
      },
      {
        q: "Is sales tax or VAT added?",
        a: [
          "When you switch it on. Stripe Tax works out sales tax or VAT from each buyer's address and adds it at checkout, on your own Stripe account, for one-off sales, offers at checkout, payment plans, memberships and calls. You choose whether your prices already include it or it is added on top.",
          "It switches on once Stripe says your tax setup is complete: your head office address, what you sell, and where you are registered, all set in your own Stripe dashboard. You are the seller, so filing and paying the tax stays yours, with Stripe's reports of what was collected. Stripe charges for Stripe Tax on your account at its own published price. While tax is on, the one-click offer after paying is paused, because tax cannot be added to a one-click charge.",
        ],
      },
      {
        q: "Can I see how my store is doing?",
        a: [
          "Yes. Your studio shows the last 7 or 30 days: visitors, page views, checkouts started, sales, revenue and conversion, where your visitors came from, and each product and link on its own line.",
          "Visits are counted without cookies. A visitor is one person on one device on one day, told apart by a one-way fingerprint that is never stored, and your own visits while signed in are not counted. Instagram and TikTok open links in their own browsers, which hide where a visit came from, so we read the app's name instead. To follow a link of your own, add ?utm_source= and a word to it, and its visits are counted under that word.",
          "Sales are read from your own Stripe account, not counted by us: new purchases and new members, before Stripe's fee and any refund. Renewals are in your Stripe dashboard.",
        ],
      },
      {
        q: "Can I add my Meta, Google, TikTok or Pinterest pixel?",
        a: [
          "Yes, on the $29 plan. Paste the pixel's id in your studio and your store's pages tell that platform about every page view, every checkout started, every lead from a free product, and every purchase with its amount, so your ads can learn who buys.",
          "Those platforms set cookies, so visitors in the EU, the UK, Switzerland and Brazil are asked first, in plain words, and nothing loads unless they say yes. Everywhere else the pixels load unless the visitor's browser sends Global Privacy Control. The ads and what they measure are yours: say in your own privacy notice that you use them.",
        ],
      },
      {
        q: "Can I sell a course?",
        a: [
          "Yes. Turn any paid product into a course from your studio and add modules and lessons. A lesson can have a video of up to 5 GB, text, up to five downloads and a link, and any lesson can be a free preview on your store. Upright phone videos stay upright.",
          "A module can open a set number of days after each student joins, and the student gets an email the day it does. Students open the course in the browser they paid in straight away, and on any other device with a link sent to the address they paid with, so nobody makes a password. Your studio shows who opened it and how many lessons each marked done, and you can take a student off the course.",
          "The course can be sold once, in a payment plan, or as a membership that stays open while the member pays. Videos watched count towards your store's 200 GB a month, the same as downloads.",
        ],
      },
      {
        q: "Can I email the people on my list?",
        a: [
          "Yes, on Pro. From your studio you write one-off emails to everyone who agreed to hear from you, or only to those who got one product, and send them now or at a time you choose. Sequences go out by themselves: a welcome when someone joins, a few emails in the days after someone buys. Each person goes through a sequence once.",
          "Only people who agreed are ever written to: those who ticked the box when they got something free or bought from you, and those you import, where you confirm each time that they agreed. Every email carries a one-click unsubscribe, why the reader is getting it and your postal address, which the law in the United States asks for; anyone who leaves is never written to again, whatever a later import says.",
          "Emails go out under your name, and replies come to you. Pro sends up to 50,000 a month, one-off and sequences together; during the free trial a store sends up to 1,000, and the full 50,000 opens with the first payment. Your list stays downloadable as a file at any time.",
        ],
      },
      {
        q: "Can I run a community or a webinar?",
        a: [
          "Not yet. Communities, webinars and an affiliate programme are not built. Platforms that have them today are the better choice if you need them today, and our comparison page says so.",
        ],
      },
      {
        q: "Does it work on a phone?",
        a: [
          "That is the case it is designed for. The store installs to the home screen with its own icon on both iPhone and Android, straight from the browser, with no app to download — for you or for your buyers.",
        ],
      },
      {
        q: "Can I use my own domain?",
        a: [
          ...(isDomainsConfigured()
            ? [
                "Yes, on Pro. In your studio, type the domain you own — shop.yourname.com, or yourname.com — and we show you the one record to add where you bought it. When it shows up, your store opens on that domain, with its certificate handled for you. Your nimbuslabsai.com address keeps working too, and if Pro ends, visitors to the domain are sent there.",
              ]
            : ["Not yet. It is next on the list, on Pro, and this page will say so on the day it works."]),
        ],
      },
      {
        q: "Can I change my store address later?",
        a: [
          "Yes, whenever you want, from your own account page. Nobody has to be asked and there is nothing to wait for.",
          "Your store does not move: same page, same name, same description, same products. Only the address changes.",
          "Every address your store has ever used keeps working and sends people to the current one, so the link already in your bio, in old posts and in messages other people sent never breaks. A store holds up to ten addresses, and you can hand one back if you are sure it was never given to anyone.",
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
        ],
      },
      {
        q: "Does the download link expire?",
        a: [
          "Yes. The link works for a limited window and is tied to that order, so a link that leaks does not turn into a free copy for everyone.",
          "A buyer who loses it does not lose what they paid for, a week or a year later. At the foot of every store page there is \u201cBought something here? Get it again\u201d: they type the address they paid with, and we email it a link to a page with everything that address bought from that store \u2014 downloads, links and courses \u2014 ready to open again. No account, no password.",
          "The list is read from your own Stripe account each time it opens, so a sale you refunded, or a membership that has ended, is not on it. The page answers the same whether or not the address bought anything, so nobody can use it to find out who your customers are.",
        ],
      },
      {
        q: "A buyer says the file never arrived. What now?",
        a: [
          "Send them to \u201cGet it again\u201d at the foot of your store page, at your store address followed by /orders \u2014 they type the address they paid with and a link to everything they bought arrives in their inbox. That answers most of these without you doing anything.",
          "If it still does not appear, check the payment in your own Stripe dashboard: a payment that did not complete is the most common cause. If Stripe shows the payment succeeded and the file still did not arrive, email us with the order details and we will look at it with you.",
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
          "For your store: the email address that signs you in, the store you build, and the Stripe account id you connect. If you ask a store for something free: your email address, what you asked for, and whether you ticked the box to hear from that store \u2014 kept for that store and nobody else. For the research form: what you typed in it and, if you ticked the box, your email address. The privacy page lists it in full.",
        ],
      },
      {
        q: "Can I have it deleted?",
        a: [
          "Yes. Email us from the address you used and we remove it. You do not have to give a reason.",
        ],
      },
      {
        q: "Do you sell or share it?",
        a: ["No. Not with anyone, for any price."],
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <RevealOnScroll />
      <SiteNav />

      <main id="content" className="flex-1">
        {/*
          A help centre opens in daylight. Somebody who is here is stuck, and
          a dark, ceremonial banner is the wrong greeting for that; the search
          field is what they need, so it is the largest thing on the screen.
        */}
        <section className="surface-dawn border-b border-line">
          <div className="container-page py-14 sm:py-18">
            <p className="eyebrow">Help centre</p>
            <h1 className="t-h1 mt-4">
              How can we <span className="serif font-normal text-violet-deep">help?</span>
            </h1>
            <p className="t-lead mt-5 max-w-2xl text-ink-soft">
              Every answer here is about the product as it is today. Where the answer is &ldquo;not yet&rdquo;, it says
              not yet.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-mute">
              <Icon name="check" size={15} className="text-mint-deep" />
              Checked against the product on 22 September 2026.
            </p>
            <HelpSearch />
          </div>
        </section>

        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[15rem_1fr] lg:gap-16">
          <nav aria-label="Help sections" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">Sections</p>
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
              {SECTIONS.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={`#${section.id}`}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-[var(--r-md)] border border-line bg-white px-3 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink lg:border-transparent lg:bg-transparent lg:hover:bg-white"
                  >
                    <Icon name={iconFor(section.emoji)} size={18} className="text-violet-deep" />
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-16">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} data-help-section className="reveal scroll-mt-24">
                <div className="flex items-start gap-4">
                  <span className="icon-tile">
                    <Icon name={iconFor(section.emoji)} size={22} />
                  </span>
                  <div>
                    <h2 className="t-h3 text-[1.6rem]">{section.title}</h2>
                    <p className="mt-1 text-ink-soft">{section.blurb}</p>
                  </div>
                </div>

                <div className="mt-6 divide-y divide-line overflow-hidden rounded-[var(--r-lg)] border border-line bg-white">
                  {section.items.map((item) => (
                    <details key={item.q} id={answerId(item.q)} data-help-item className="group scroll-mt-24">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 font-semibold text-ink transition-colors hover:bg-paper sm:px-6 [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-transform duration-300 group-open:rotate-45 group-open:border-violet-brand group-open:text-violet-deep">
                          <Icon name="plus" size={16} />
                        </span>
                      </summary>
                      <div className="space-y-3 px-5 pb-6 sm:px-6">
                        {item.a.map((paragraph) => (
                          <p key={paragraph} className="leading-relaxed text-ink-soft">
                            {paragraph}
                          </p>
                        ))}
                        <CopyLink id={answerId(item.q)} />
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <section className="reveal card flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div>
                <h2 className="t-h3 text-[1.6rem]">Still stuck?</h2>
                <p className="mt-2 max-w-md text-ink-soft">
                  Write to us. A person reads it, and you will get an answer even if the answer is that we have not built
                  that part yet.
                </p>
                <p className="mt-4 text-sm text-ink-mute">
                  Looking for the rules instead?{" "}
                  <Link href="/terms" className="link font-medium">
                    Terms
                  </Link>
                  ,{" "}
                  <Link href="/privacy" className="link font-medium">
                    Privacy
                  </Link>{" "}
                  and{" "}
                  <Link href="/refunds" className="link font-medium">
                    Refunds
                  </Link>
                  .
                </p>
              </div>
              <a href="mailto:support@nimbuslabsai.com" className="btn btn-primary shrink-0">
                <Icon name="mail" size={18} />
                Email support
              </a>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
